# src/entities/player/states/state_dash.gd
extends BaseState

var _dash_direction: Vector2
var _invincibility_token: int
var _health: HealthComponent
var _physics: PlayerPhysicsComponent

func enter(_msg := {}):
	_health = owner.get_component(HealthComponent)
	_physics = owner.get_component(PlayerPhysicsComponent)

	state_data.physics.can_dash = false
	state_data.physics.dash_duration_timer = state_data.config.dash_duration
	state_data.physics.dash_cooldown_timer = state_data.config.dash_cooldown

	_invincibility_token = _health.grant_invincibility(self)

	_dash_direction = _get_dash_direction()
	_physics.set_velocity(_dash_direction * state_data.config.dash_speed)


func exit():
	if is_instance_valid(owner) and is_instance_valid(_health):
		_health.release_invincibility(_invincibility_token)

	# Stop momentum on exit
	if is_instance_valid(_physics):
		var current_vel = owner.velocity
		# Stop velocity on axes we dashed on
		if _dash_direction.y != 0:
			current_vel.y = 0.0
		if _dash_direction.x != 0:
			current_vel.x = 0.0
		_physics.set_velocity(current_vel)


func process_physics(_delta: float):
	if state_data.physics.dash_duration_timer <= 0:
		state_machine.change_state(Identifiers.PlayerStates.FALL)


func _get_dash_direction() -> Vector2:
	var ic: InputComponent = owner.get_component(InputComponent)
	var dir = Vector2.ZERO

	# 1. Horizontal Input
	dir.x = ic.input.move_axis

	# 2. Vertical Input
	if ic.input.up:
		dir.y = -1.0
	elif ic.input.down:
		dir.y = 1.0

	# 3. Fallback: If no input, dash forward
	if dir == Vector2.ZERO:
		dir.x = state_data.physics.facing_direction

	# Normalize to ensure diagonal dashes aren't faster
	return dir.normalized()
