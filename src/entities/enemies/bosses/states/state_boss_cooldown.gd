# src/entities/boss/states/state_boss_cooldown.gd
## The state for when the boss is waiting after completing an attack.
extends BaseState
class_name BossStateCooldown

var _timer: float = 0.0

func enter(msg := {}) -> void:
	owner.velocity.x = 0
	_timer = msg.get("duration", 1.0) # Default to 1.0s if not provided

func process_physics(delta: float) -> void:
	# Apply gravity
	if owner.has_method("apply_gravity"):
		owner.apply_gravity(delta)

	_timer -= delta
	if _timer <= 0:
		state_machine.change_state(Identifiers.BossStates.PATROL)
