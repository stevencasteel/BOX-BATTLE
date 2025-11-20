# src/entities/minions/states/state_minion_patrol.gd
## A specialized patrol state for Minions.
## Inherits generic movement but adds specific AI interrupts.
class_name MinionStatePatrol
extends StateEntityPatrol

var _minion # Untyped

func enter(msg := {}) -> void:
	super.enter(msg)
	_minion = owner

func _check_interrupts() -> bool:
	if not is_instance_valid(_minion):
		return false

	# --- Priority 1: Melee Interrupt ---
	if state_data.is_player_in_melee_range:
		if _minion.get_component(MeleeComponent):
			_minion.velocity = Vector2.ZERO
			_minion.attack_timer.stop() 
			state_machine.change_state(Identifiers.CommonStates.MELEE)
			return true

	# --- Priority 2: Ranged Attack ---
	if (
		state_data.is_player_in_range
		and _minion.attack_timer.is_stopped()
		and not state_data.behavior.attack_patterns.is_empty()
	):
		_minion.update_player_tracking()
		var pattern: AttackPattern = state_data.behavior.attack_patterns.pick_random()
		_minion.attack_timer.wait_time = pattern.cooldown
		_minion.attack_timer.start()
		
		if is_instance_valid(pattern.logic):
			var attack_command: Callable = pattern.logic.execute(_minion, pattern)
			if attack_command.is_valid():
				attack_command.call()
	
	return false
