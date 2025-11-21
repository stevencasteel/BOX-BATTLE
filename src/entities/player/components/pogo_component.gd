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
var _combat_utils: Node 
var _fx_manager: IFXManager

# --- Godot Lifecycle ---

func _ready() -> void:
	process_priority = 0

# --- IComponent Contract ---

func setup(p_owner: Node, p_dependencies: Dictionary = {}) -> void:
	_owner_node = p_owner as CharacterBody2D
	_p_data = p_dependencies.get("data_resource")
	_hitbox = p_dependencies.get("pogo_hitbox")
	
	_object_pool = p_dependencies.get("object_pool")
	_combat_utils = p_dependencies.get("combat_utils")
	_fx_manager = p_dependencies.get("fx_manager")

	assert(is_instance_valid(_owner_node), "PogoComponent requires a CharacterBody2D owner.")
	assert(is_instance_valid(_p_data), "PogoComponent requires PlayerStateData.")
	assert(is_instance_valid(_object_pool), "PogoComponent requires 'object_pool'.")
	assert(is_instance_valid(_combat_utils), "PogoComponent requires 'combat_utils'.")
	assert(is_instance_valid(_fx_manager), "PogoComponent requires 'fx_manager'.")
	
	if is_instance_valid(_hitbox):
		# Configure hitbox specifically for Pogo
		# FIX: Added HAZARD to mask
		_hitbox.collision_mask |= PhysicsLayers.SOLID_WORLD | PhysicsLayers.PLATFORMS | PhysicsLayers.HAZARD
		
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
	_fx_manager = null

# --- Private Logic ---

func _on_hit_detected(target: Node) -> void:
	if not _p_data.combat.is_pogo_attack:
		return
	if not is_instance_valid(target):
		return

	var should_bounce = false

	# Case 1: Hit an Enemy Projectile (destroy it with impact)
	if target.is_in_group(Identifiers.Groups.ENEMY_PROJECTILE):
		should_bounce = true
		
		# 1. Destroy Enemy Projectile (Red Splash)
		if target.has_method("destroy_with_impact"):
			target.destroy_with_impact()
		else:
			_object_pool.return_instance.call_deferred(target)
			
		# 2. Spawn Player Hit Spark (Green Splash)
		_spawn_player_spark(target.global_position)

	# Case 2: Hit a Damageable Entity (Enemy)
	var damageable = _combat_utils.find_damageable(target)
	if is_instance_valid(damageable):
		should_bounce = true
		# DRY: Use factory method (Pogo pierces i-frames)
		var damage_info = _combat_utils.create_damage_info(
			1,
			_owner_node,
			target.global_position,
			Vector2.UP,
			true 
		)
		
		var result = damageable.apply_damage(damage_info)
		if result.was_damaged:
			damage_dealt.emit()

	# Case 3: Hit World Geometry or Hazard
	if target is PhysicsBody2D:
		var layer = target.collision_layer
		# FIX: Added HAZARD check
		if (layer & (PhysicsLayers.SOLID_WORLD | PhysicsLayers.PLATFORMS | PhysicsLayers.HAZARD)) != 0:
			should_bounce = true
	
	if target.is_in_group(Identifiers.Groups.WORLD) or target.is_in_group(Identifiers.Groups.HAZARD):
		should_bounce = true

	if should_bounce:
		pogo_bounce_requested.emit()


func _spawn_player_spark(pos: Vector2) -> void:
	if not is_instance_valid(_fx_manager) or not _p_data.config.hit_spark_effect:
		return
	_fx_manager.play_vfx(_p_data.config.hit_spark_effect, pos, Vector2.UP)
