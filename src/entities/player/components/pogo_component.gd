# src/entities/player/components/pogo_component.gd
@tool
## Dedicated component for handling the "Pogo" (downward strike) mechanic.
class_name PogoComponent
extends IComponent

# --- Signals ---
signal pogo_bounce_requested
signal damage_dealt

# --- Dependencies ---
var _owner_node: CharacterBody2D
var _p_data: PlayerStateData
var _hitbox: HitboxComponent
var _object_pool: IObjectPool
var _combat_utils: Node # Service

# --- Godot Lifecycle ---

func _ready() -> void:
	process_priority = 0

# --- IComponent Contract ---

func setup(p_owner: Node, p_dependencies: Dictionary = {}) -> void:
	_owner_node = p_owner as CharacterBody2D
	_p_data = p_dependencies.get("data_resource")
	_hitbox = p_dependencies.get("pogo_hitbox")
	
	var services = p_dependencies.get("services")
	if services:
		_object_pool = services.object_pool
		_combat_utils = services.combat_utils

	assert(is_instance_valid(_owner_node), "PogoComponent requires a CharacterBody2D owner.")
	assert(is_instance_valid(_p_data), "PogoComponent requires PlayerStateData.")
	assert(is_instance_valid(_object_pool), "PogoComponent requires IObjectPool.")
	
	if is_instance_valid(_hitbox):
		# Configure hitbox specifically for Pogo
		# Layer 8 (128) = Solid World, Layer 2 (2) = Platforms
		_hitbox.collision_mask |= PhysicsLayers.SOLID_WORLD | PhysicsLayers.PLATFORMS
		
		if not _hitbox.hit_detected.is_connected(_on_hit_detected):
			_hitbox.hit_detected.connect(_on_hit_detected)

func teardown() -> void:
	if is_instance_valid(_hitbox):
		if _hitbox.hit_detected.is_connected(_on_hit_detected):
			_hitbox.hit_detected.disconnect(_on_hit_detected)
	
	_owner_node = null
	_p_data = null
	_hitbox = null
	_object_pool = null
	_combat_utils = null

# --- Private Logic ---

func _on_hit_detected(target: Node) -> void:
	if not _p_data.combat.is_pogo_attack:
		return
	if not is_instance_valid(target):
		return

	var should_bounce = false

	# Case 1: Hit an Enemy Projectile (destroy it)
	if target.is_in_group(Identifiers.Groups.ENEMY_PROJECTILE):
		should_bounce = true
		_object_pool.return_instance.call_deferred(target)

	# Case 2: Hit a Damageable Entity (Enemy)
	var damageable = _combat_utils.find_damageable(target)
	if is_instance_valid(damageable):
		should_bounce = true
		var damage_info = DamageInfo.new()
		damage_info.amount = 1 # Standard pogo damage
		damage_info.source_node = _owner_node
		damage_info.bypass_invincibility = true # Pogo often pierces i-frames
		damage_info.impact_position = target.global_position
		damage_info.impact_normal = Vector2.UP
		
		var result = damageable.apply_damage(damage_info)
		if result.was_damaged:
			damage_dealt.emit()

	# Case 3: Hit World Geometry
	# Check physics bodies (World, Platforms)
	if target is PhysicsBody2D and (target.collision_layer & (PhysicsLayers.SOLID_WORLD | PhysicsLayers.PLATFORMS)) != 0:
		should_bounce = true
	# Check TileMap layers or static bodies in world group
	elif target.is_in_group(Identifiers.Groups.WORLD):
		should_bounce = true

	if should_bounce:
		pogo_bounce_requested.emit()
