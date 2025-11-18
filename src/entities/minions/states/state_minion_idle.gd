# src/entities/minions/states/state_minion_idle.gd
## A specialized idle state for Minions.
class_name MinionStateIdle
extends StateEntityIdle

var _minion: Minion

func enter(msg := {}) -> void:
	super.enter(msg)
	_minion = owner as Minion

func _check_interrupts() -> bool:
	if not is_instance_valid(_minion):
		return false

	# 1. Melee Check
	if state_data.is_player_in_melee_range and _minion.attack_timer.is_stopped():
		if _minion.get_component(MeleeComponent):
			# UPDATE
			state_machine.change_state(Identifiers.CommonStates.MELEE)
			return true

	# 2. Ranged Attack Check
	if state_data.is_player_in_range and _minion.attack_timer.is_stopped():
		if not state_data.behavior.attack_patterns.is_empty():
			state_machine.change_state(Identifiers.MinionStates.ATTACK, {"pattern": state_data.behavior.attack_patterns.pick_random()})
			return true

	# 3. Default to Patrol if ready
	if _minion.attack_timer.is_stopped():
		# UPDATE
		state_machine.change_state(Identifiers.CommonStates.PATROL)
		return true
		
	return false