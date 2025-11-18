# src/entities/components/input_component.gd
@tool
## A component that centralizes all raw input polling.
class_name InputComponent
extends IComponent

# --- Member Variables ---
var owner_node: CharacterBody2D
var p_data: PlayerStateData

## A buffer dictionary populated each frame with the current input state.
var buffer: Dictionary = {}

# --- Godot Lifecycle Methods ---


func _ready() -> void:
	process_priority = -100


func _physics_process(_delta: float) -> void:
	if not is_instance_valid(owner_node):
		return

	buffer.clear()
	buffer["move_axis"] = Input.get_axis("ui_left", "ui_right")
	buffer["up"] = Input.is_action_pressed("ui_up")
	buffer["down"] = Input.is_action_pressed("ui_down")
	buffer["jump_just_pressed"] = Input.is_action_just_pressed("ui_jump")
	buffer["jump_held"] = Input.is_action_pressed("ui_jump")
	buffer["jump_released"] = Input.is_action_just_released("ui_jump")
	buffer["attack_pressed"] = Input.is_action_pressed("ui_attack")
	buffer["attack_just_pressed"] = Input.is_action_just_pressed("ui_attack")
	buffer["attack_released"] = Input.is_action_just_released("ui_attack")
	buffer["dash_pressed"] = Input.is_action_just_pressed("ui_dash")


# --- Public Methods ---


func setup(p_owner: Node, p_dependencies: Dictionary = {}) -> void:
	self.owner_node = p_owner as CharacterBody2D
	self.p_data = p_dependencies.get("data_resource")

	if not p_data:
		push_error("InputComponent.setup: Missing 'data_resource' dependency.")
		return


func teardown() -> void:
	set_physics_process(false)
	owner_node = null
	p_data = null
	buffer.clear()
