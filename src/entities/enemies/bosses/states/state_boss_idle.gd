# src/entities/boss/states/state_boss_idle.gd
## A specialized idle state for the Boss.
## It immediately selects the next attack pattern (Transient State).
class_name BossStateIdle
extends StateEntityIdle

func enter(msg := {}) -> void:
	super.enter(msg)
	
	# Boss Idle is unique: it immediately decides what to do next.
	# We can do this directly in enter() or via the interrupt check.
	_decide_next_action()

func process_physics(delta: float) -> void:
	# Apply gravity while deciding (safety)
	if owner.has_method("apply_gravity"):
		owner.apply_gravity(delta)
	
	super.process_physics(delta)

func _decide_next_action() -> void:
	# Removed strict casting to avoid cyclic dep
	var boss = owner
	if boss.current_attack_patterns.is_empty():
		push_warning("BossStateIdle: No attack patterns. Defaulting to Cooldown.")
		state_machine.change_state(Identifiers.BossStates.COOLDOWN)
		return

	var chosen_pattern: AttackPattern = boss.current_attack_patterns.pick_random()
	state_machine.change_state(Identifiers.BossStates.ATTACK, {"pattern": chosen_pattern})
