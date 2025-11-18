# src/entities/player/components/player_physics_component.gd
@tool
## Manages all direct physics interactions for the player character.
## Acts as the gatekeeper for the 'velocity' property and physics timers.
class_name PlayerPhysicsComponent
extends IComponent

# --- Member Variables ---
var owner_node: Player
var p_data: PlayerStateData

# --- Godot Lifecycle Methods ---


func _ready() -> void:
	process_priority = -50


func _physics_process(delta: float) -> void:
	if not is_instance_valid(owner_node):
		return

	_update_timers(delta)

	owner_node.move_and_slide()
	
	if not is_instance_valid(owner_node):
		return

	if owner_node.is_on_wall() and not owner_node.is_on_floor():
		p_data.wall_coyote_timer = p_data.config.wall_coyote_time
		p_data.last_wall_normal = owner_node.get_wall_normal()


# --- Private Methods ---


func _update_timers(delta: float) -> void:
	if not is_instance_valid(p_data):
		return
	p_data.coyote_timer = max(0.0, p_data.coyote_timer - delta)
	p_data.wall_coyote_timer = max(0.0, p_data.wall_coyote_timer - delta)


# --- Public Methods ---


func setup(p_owner: Node, p_dependencies: Dictionary = {}) -> void:
	self.owner_node = p_owner as Player
	self.p_data = p_dependencies.get("data_resource")


func teardown() -> void:
	set_physics_process(false)
	owner_node = null
	p_data = null


# --- Movement API ---

## Standard horizontal movement based on Input.
func apply_horizontal_movement() -> void:
	var input_component: InputComponent = owner_node.get_component(InputComponent)
	if not is_instance_valid(input_component):
		return
	var move_axis = input_component.buffer.get("move_axis", 0.0)
	owner_node.velocity.x = move_axis * p_data.config.move_speed
	if not is_zero_approx(move_axis):
		p_data.facing_direction = sign(move_axis)


## Applies gravity to the vertical velocity.
func apply_gravity(delta: float, multiplier: float = 1.0) -> void:
	owner_node.velocity.y += p_data.world_config.gravity * multiplier * delta


## Applies an instant vertical force.
func jump(force: float) -> void:
	owner_node.velocity.y = -force


## Sets the full velocity vector immediately (used for Dashing/Recoil).
func set_velocity(new_velocity: Vector2) -> void:
	owner_node.velocity = new_velocity


## Reduces the vertical velocity (used for variable jump height).
func damp_jump() -> void:
	if owner_node.velocity.y < 0:
		owner_node.velocity.y *= p_data.config.jump_release_dampener


## Applies friction/drag to bring velocity to zero.
func apply_friction(amount: float, delta: float) -> void:
	owner_node.velocity = owner_node.velocity.move_toward(Vector2.ZERO, amount * delta)


## Executes the physical reaction to a pogo hit.
func perform_pogo_bounce() -> void:
	owner_node.velocity.y = -p_data.config.pogo_force
	# Nudge up slightly to prevent immediate re-collision issues
	owner_node.position.y -= 1


## Checks if the conditions for performing a wall slide are met.
func can_wall_slide() -> bool:
	var ic: InputComponent = owner_node.get_component(InputComponent)
	if not is_instance_valid(ic):
		return false
	var move_axis = ic.buffer.get("move_axis", 0.0)
	return (
		p_data.wall_coyote_timer > 0
		and not owner_node.is_on_floor()
		and move_axis != 0
		and sign(move_axis) == -p_data.last_wall_normal.x
	)


## Applies the velocity and resets timers for a wall jump.
func perform_wall_jump() -> void:
	owner_node.velocity.y = -p_data.config.wall_jump_force_y
	owner_node.velocity.x = p_data.last_wall_normal.x * p_data.config.wall_jump_force_x
	p_data.coyote_timer = 0
	p_data.wall_coyote_timer = 0
