# src/entities/common_states/state_entity_idle.gd
## A generic state that stops horizontal movement and checks for interruptions.
class_name StateEntityIdle
extends BaseState

var _entity: BaseEntity

func enter(_msg := {}) -> void:
	_entity = owner as BaseEntity
	_entity.velocity.x = 0

func process_physics(_delta: float) -> void:
	if _check_interrupts():
		return

# Virtual method for subclasses (AI logic)
func _check_interrupts() -> bool:
	return false
