# src/entities/player/states/state_move.gd
## Handles the player's grounded movement state.
extends BaseState

var _physics: PlayerPhysicsComponent


func enter(_msg := {}) -> void:
	_physics = owner.get_component(PlayerPhysicsComponent)
	# UPDATE: config.max_air_jumps
	state_data.physics.air_jumps_left = state_data.config.max_air_jumps
	state_data.physics.can_dash = true


func process_physics(delta: float) -> void:
	# UPDATE: config.coyote_time
	state_data.physics.coyote_timer = state_data.config.coyote_time

	_physics.apply_gravity(delta)
	_physics.apply_horizontal_movement()

	if not owner.is_on_floor():
		state_machine.change_state(Identifiers.PlayerStates.FALL)
		return
