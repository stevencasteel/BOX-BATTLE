# src/entities/boss/states/state_boss_patrol.gd
## A specialized patrol state for the Boss that inherits generic movement logic
## but adds specific interrupt conditions (Close Range Melee).
class_name BossStatePatrol
extends StateEntityPatrol

const QuickSwipeData = preload("res://src/data/combat/attacks/boss_quick_swipe.tres")

# Override the virtual method from StateEntityPatrol
func _check_interrupts() -> bool:
	# High-priority check: if player gets too close, interrupt patrol to attack.
	if state_data.is_player_in_close_range and owner.cooldown_timer.is_stopped():
		# UPDATE: Use constant
		state_machine.change_state(Identifiers.CommonStates.MELEE, {"attack_data": QuickSwipeData})
		return true
	
	return false
