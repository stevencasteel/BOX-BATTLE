# src/entities/player/states/state_wall_slide.gd
# Handles the player's wall sliding state.
extends BaseState

var _physics: PlayerPhysicsComponent
var _input: InputComponent


func enter(_msg := {}):
	_physics = owner.get_component(PlayerPhysicsComponent)
	_input = owner.get_component(InputComponent)
	state_data.physics.can_dash = true
	state_data.physics.air_jumps_left = state_data.config.max_air_jumps


func exit():
	if state_data.physics.last_wall_normal != Vector2.ZERO:
		state_data.physics.facing_direction = sign(state_data.physics.last_wall_normal.x)


func process_physics(delta: float):
	var gravity = state_data.world_config.gravity
	var wall_slide_speed = state_data.config.wall_slide_speed
	owner.velocity.y = min(owner.velocity.y + gravity * delta, wall_slide_speed)

	state_data.physics.facing_direction = sign(-state_data.physics.last_wall_normal.x)

	if _input.input.jump_just_pressed:
		_physics.perform_wall_jump()
		state_machine.change_state(Identifiers.PlayerStates.JUMP)
		return

	var move_axis = _input.input.move_axis
	if move_axis * -state_data.physics.last_wall_normal.x < 0.8:
		state_machine.change_state(Identifiers.PlayerStates.FALL)
		return

	if state_data.physics.wall_coyote_timer <= 0:
		state_machine.change_state(Identifiers.PlayerStates.FALL)
		return

	if owner.is_on_floor():
		state_machine.change_state(Identifiers.PlayerStates.MOVE)
		return
