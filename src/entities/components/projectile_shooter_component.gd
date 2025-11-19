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

# --- Private Variables ---
var _active_volley_tween: Tween
var _player_node: Node2D

# --- IComponent Contract ---

func setup(p_owner: Node, p_dependencies: Dictionary = {}) -> void:
	self._owner = p_owner as Node2D
	self._entity_data = p_dependencies.get("data_resource")
	self._object_pool = p_dependencies.get("object_pool")
	self._combat_utils = p_dependencies.get("combat_utils")
	
	assert(is_instance_valid(_owner), "ProjectileShooterComponent requires a Node2D owner.")
	assert(is_instance_valid(_entity_data), "ProjectileShooterComponent requires an entity data resource.")
	assert(is_instance_valid(_object_pool), "ProjectileShooterComponent requires 'object_pool'.")
	assert(is_instance_valid(_combat_utils), "ProjectileShooterComponent requires 'combat_utils'.")
	
	if not Engine.is_editor_hint():
		_player_node = _owner.get_tree().get_first_node_in_group(Identifiers.Groups.PLAYER)


func teardown() -> void:
	if is_instance_valid(_active_volley_tween):
		_active_volley_tween.kill()
	_owner = null
	_entity_data = null
	_object_pool = null
	_combat_utils = null
	_player_node = null


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
	if not is_instance_valid(_owner) or not is_instance_valid(_player_node):
		return

	# If the owner is marked as dead via internal flags, don't fire.
	if _owner.get("_is_dead"):
		return

	var pool_key: StringName = _entity_data.projectile_pool_key
	if pool_key == &"":
		push_warning("Entity '%s' tried to fire but has no 'projectile_pool_key'." % _owner.name)
		return

	var shot: Node = _object_pool.get_instance(pool_key)
	if not shot:
		return

	# Calculate direction to player
	var direction = (_player_node.global_position - _owner.global_position).normalized()
	
	# Update facing direction data if the entity tracks the player
	if "facing_direction" in _entity_data and not is_zero_approx(direction.x):
		_entity_data.facing_direction = sign(direction.x)

	# Configure the shot
	if "direction" in shot:
		shot.direction = direction
	if "global_position" in shot:
		shot.global_position = _owner.global_position
	
	var dependencies = {
		"object_pool": _object_pool,
		"combat_utils": _combat_utils
	}
	
	if shot.has_method("activate"):
		shot.activate(dependencies)
