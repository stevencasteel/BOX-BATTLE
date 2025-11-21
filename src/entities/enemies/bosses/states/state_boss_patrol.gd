# src/entities/boss/states/state_boss_patrol.gd
## A specialized patrol state for the Boss that inherits generic movement logic
## but adds specific interrupt conditions (Close Range Melee).
class_name BossStatePatrol
extends StateEntityPatrol

const QuickSwipeData = preload("res://src/data/combat/attacks/boss_quick_swipe.tres")
const PATROL_DURATION: float = 3.0

var _timer: float = 0.0

func enter(msg := {}) -> void:
	super.enter(msg)
	_timer = PATROL_DURATION

func process_physics(delta: float) -> void:
	# 1. Apply Gravity (explicitly, since BaseBoss no longer does it globally)
	if owner.has_method("apply_gravity"):
		owner.apply_gravity(delta)

	# 2. Update Timer
	_timer -= delta
	if _timer <= 0:
		state_machine.change_state(Identifiers.BossStates.IDLE)
		return

	# 3. Run Generic Patrol Logic (Movement)
	super.process_physics(delta)

# Override the virtual method from StateEntityPatrol
func _check_interrupts() -> bool:
	# High-priority check: if player gets too close, interrupt patrol to attack.
	if state_data.is_player_in_close_range:
		state_machine.change_state(Identifiers.CommonStates.MELEE, {"attack_data": QuickSwipeData})
		return true
	
	return false
