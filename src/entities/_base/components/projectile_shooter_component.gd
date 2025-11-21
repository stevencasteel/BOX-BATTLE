# src/entities/components/projectile_shooter_component.gd
@tool
## A component responsible for firing projectiles.
## It handles object pooling and targeting logic for ranged attacks.
class_name ProjectileShooterComponent
extends IComponent

# --- Dependencies ---
var _owner: Node2D
var _entity_data: Resource # BossStateData or MinionStateData
var _object_pool: IObjectPool
var _combat_utils: Node
var _targeting_system: Node
var _fx_manager: IFXManager # Need this for VFX

# --- Private Variables ---
var _active_volley_tween: Tween
var _player_node: Node2D

# --- IComponent Contract ---

func setup(p_owner: Node, p_dependencies: Dictionary = {}) -> void:
	self._owner = p_owner as Node2D
	self._entity_data = p_dependencies.get("data_resource")
	self._object_pool = p_dependencies.get("object_pool")
	self._combat_utils = p_dependencies.get("combat_utils")
	self._targeting_system = p_dependencies.get("targeting_system")
	
	# Try to get FXManager from services (BaseEntity usually passes it)
	if p_dependencies.has("services"):
		self._fx_manager = p_dependencies.get("services").fx_manager
	
	assert(is_instance_valid(_owner), "ProjectileShooterComponent requires a Node2D owner.")
	assert(is_instance_valid(_entity_data), "ProjectileShooterComponent requires an entity data resource.")
	assert(is_instance_valid(_object_pool), "ProjectileShooterComponent requires 'object_pool'.")
	
	if not Engine.is_editor_hint():
		if not _targeting_system:
			_targeting_system = ServiceLocator.targeting_system
		_player_node = _targeting_system.get_first(Identifiers.Groups.PLAYER)


func teardown() -> void:
	if is_instance_valid(_active_volley_tween):
		_active_volley_tween.kill()
	_owner = null
	_entity_data = null
	_object_pool = null
	_combat_utils = null
	_player_node = null
	_targeting_system = null
	_fx_manager = null


# --- Public API ---

## Fires a sequence of shots with a delay between them.
func fire_volley(shot_count: int, delay: float) -> void:
	if is_instance_valid(_active_volley_tween):
		_active_volley_tween.kill()
	
	_active_volley_tween = create_tween()
	
	for i in range(shot_count):
		_active_volley_tween.tween_callback(fire_shot_at_player)
		if i < shot_count - 1:
			_active_volley_tween.tween_interval(delay)


## Fires a single shot directly at the player's current position.
func fire_shot_at_player() -> void:
	if not is_instance_valid(_owner):
		return
		
	if not is_instance_valid(_player_node) and is_instance_valid(_targeting_system):
		_player_node = _targeting_system.get_first(Identifiers.Groups.PLAYER)

	if not is_instance_valid(_player_node):
		return

	if _owner.get("_is_dead"):
		return

	var pool_key: StringName = _entity_data.projectile_pool_key
	if pool_key == &"":
		return

	var shot: Node = _object_pool.get_instance(pool_key)
	if not shot:
		return

	var direction = (_player_node.global_position - _owner.global_position).normalized()
	
	if "facing_direction" in _entity_data and not is_zero_approx(direction.x):
		_entity_data.facing_direction = sign(direction.x)

	if "direction" in shot:
		shot.direction = direction
	if "global_position" in shot:
		shot.global_position = _owner.global_position
	
	var dependencies = {
		"object_pool": _object_pool,
		"combat_utils": _combat_utils,
		"fx_manager": _fx_manager # Pass FXManager to projectile
	}
	
	if shot.has_method("activate"):
		shot.activate(dependencies)
		
	# --- Muzzle Flash VFX ---
	_spawn_muzzle_vfx(direction)


func _spawn_muzzle_vfx(dir: Vector2) -> void:
	if not is_instance_valid(_fx_manager) or not _entity_data or not _entity_data.config:
		return
		
	# Check if config has the property (EnemyConfig)
	if "projectile_muzzle_vfx" in _entity_data.config:
		var vfx = _entity_data.config.projectile_muzzle_vfx
		if is_instance_valid(vfx):
			_fx_manager.play_vfx(vfx, _owner.global_position, dir)
