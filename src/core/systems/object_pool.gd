# src/core/systems/object_pool.gd
## An autoloaded singleton that manages pools of reusable nodes.
## Supports parenting active objects to a specific world node for Viewport compatibility.
extends Node

# --- Constants ---
const MANIFEST_PATH = "res://src/data/default_pool_manifest.tres"

# --- Private Member Variables ---
var _pools: Dictionary = {}
var _is_initialized: bool = false
var _active_world_container: Node = null 

# --- Godot Lifecycle Methods ---

func _ready() -> void:
	pass

func _exit_tree() -> void:
	_cleanup_pools()

# --- Public Methods ---

func initialize() -> void:
	if _is_initialized:
		return
	
	if not FileAccess.file_exists(MANIFEST_PATH):
		push_error("ObjectPool: Manifest not found at %s" % MANIFEST_PATH)
		return
		
	var manifest: PoolManifest = load(MANIFEST_PATH)
	if not manifest:
		push_error("ObjectPool: Failed to load PoolManifest resource.")
		return
		
	for def in manifest.pools:
		if def.scene == null:
			push_warning("ObjectPool: Pool definition for '%s' has no scene." % def.pool_key)
			continue
		_create_pool_for_scene(def.pool_key, def.scene, def.initial_size)
		
	_is_initialized = true

func register_world_container(container: Node) -> void:
	_active_world_container = container

func get_pool_stats() -> Dictionary:
	var stats: Dictionary = {}
	for pool_name in _pools:
		var pool: Dictionary = _pools[pool_name]
		var inactive_count: int = pool.inactive.size()
		var total: int = pool.total_created
		# "Active" is simply the total created minus those currently sitting in the pool
		stats[pool_name] = {"active": total - inactive_count, "total": total}
	return stats

func reset() -> void:
	_active_world_container = null

func get_instance(p_pool_name: StringName) -> Node:
	if not _pools.has(p_pool_name):
		push_error("ObjectPool: Attempted to get instance from a non-existent pool: '%s'" % p_pool_name)
		return null

	var pool: Dictionary = _pools[p_pool_name]
	var instance: Node = null

	# Robust Retrieval Loop
	# Keep popping until we find a valid instance or run out.
	while not pool.inactive.is_empty():
		var candidate = pool.inactive.pop_front()
		if is_instance_valid(candidate) and not candidate.is_queued_for_deletion():
			instance = candidate
			break
		else:
			# If we found a ghost reference, we decrement total count effectively (it's gone)
			# We don't decrement total_created here to keep stats simple, or we could.
			pass

	# If no valid instance found in pool, create new
	if not is_instance_valid(instance):
		instance = pool.scene.instantiate()
		instance.set_meta("pool_name", p_pool_name)
		pool.container.add_child(instance)
		pool.total_created += 1

	# Reparenting Logic
	if is_instance_valid(_active_world_container) and not _active_world_container.is_queued_for_deletion():
		if instance.get_parent() != _active_world_container:
			# Standard reparent
			instance.reparent(_active_world_container, false) 
	
	return instance

func return_instance(p_instance: Node) -> void:
	if not is_instance_valid(p_instance):
		return

	var pool_name: StringName = p_instance.get_meta("pool_name", "")
	if pool_name == "" or not _pools.has(pool_name):
		p_instance.queue_free()
		return

	var pool: Dictionary = _pools[pool_name]
	
	# Prevent double-return
	if pool.inactive.has(p_instance):
		return

	if p_instance.has_method("deactivate"):
		p_instance.deactivate()

	# Return to pool container for storage
	if p_instance.get_parent() != pool.container:
		if is_instance_valid(pool.container):
			p_instance.reparent(pool.container, false)
		else:
			p_instance.queue_free()
			return

	pool.inactive.push_front(p_instance)

# --- Private Methods ---

func _create_pool_for_scene(
	p_pool_name: StringName, p_scene: PackedScene, p_initial_size: int
) -> void:
	if _pools.has(p_pool_name):
		return

	var pool_container := Node.new()
	pool_container.name = str(p_pool_name)
	add_child(pool_container)

	# Added 'total_created' to track stats accurately
	_pools[p_pool_name] = {
		"scene": p_scene, 
		"inactive": [], 
		"container": pool_container,
		"total_created": 0
	}

	for i in range(p_initial_size):
		var instance: Node = p_scene.instantiate()
		instance.set_meta("pool_name", p_pool_name)
		pool_container.add_child(instance)
		if instance.has_method("deactivate"):
			instance.deactivate()
		_pools[p_pool_name].inactive.append(instance)
		_pools[p_pool_name].total_created += 1

func _cleanup_pools() -> void:
	for pool_name in _pools:
		var pool = _pools[pool_name]
		for item in pool.inactive:
			if is_instance_valid(item):
				item.free()
		if is_instance_valid(pool.container):
			pool.container.free()
	_pools.clear()
