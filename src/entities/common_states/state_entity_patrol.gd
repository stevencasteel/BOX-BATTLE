# src/entities/common_states/state_entity_patrol.gd
## A generic state for moving an entity according to its MovementLogic.
class_name StateEntityPatrol
extends BaseState

var _entity: BaseEntity

func enter(_msg := {}) -> void:
	_entity = owner as BaseEntity
	# Reset timer if the entity has one for patrolling
	if _entity.has_node("PatrolTimer"):
		_entity.get_node("PatrolTimer").start()

func process_physics(delta: float) -> void:
	if not is_instance_valid(_entity):
		return

	# 1. Allow child classes (or injected logic) to check for state changes
	if _check_interrupts():
		return

	# 2. Execute Movement Logic
	var logic: MovementLogic
	
	# Polymorphic access to behavior.movement_logic
	if "entity_data" in _entity:
		var data = _entity.entity_data
		if "behavior" in data and data.behavior and data.behavior.movement_logic:
			logic = data.behavior.movement_logic
	
	if is_instance_valid(logic):
		# We pass the entity_data to the logic. Both Minion and Boss data 
		# are compatible with what MovementLogic expects (services, config, facing_direction).
		_entity.velocity = logic.execute(delta, _entity, _entity.entity_data)
	else:
		# Fallback if no logic assigned
		_entity.velocity.x = 0
		if not _entity.is_on_floor():
			_entity.velocity.y += 980 * delta

# Virtual method for subclasses to override
func _check_interrupts() -> bool:
	return false
