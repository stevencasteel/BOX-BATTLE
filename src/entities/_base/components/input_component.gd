# src/entities/components/input_component.gd
@tool
## A component that centralizes all raw input polling.
## Uses Dependency Inversion to allow for input mocking in tests.
class_name InputComponent
extends IComponent

# --- Member Variables ---
var owner_node: CharacterBody2D
var p_data: PlayerStateData
var _input_provider: IInputProvider

## A buffer dictionary populated each frame with the current input state.
var buffer: Dictionary = {}

# --- Godot Lifecycle Methods ---

func _ready() -> void:
	process_priority = -100

func _physics_process(_delta: float) -> void:
	if Engine.is_editor_hint():
		return

	if not is_instance_valid(owner_node) or not _input_provider:
		return

	buffer.clear()
	
	# Use the provider instead of global Input
	buffer["move_axis"] = _input_provider.get_axis(Identifiers.Actions.MOVE_LEFT, Identifiers.Actions.MOVE_RIGHT)
	buffer["up"] = _input_provider.is_action_pressed(Identifiers.Actions.MOVE_UP)
	buffer["down"] = _input_provider.is_action_pressed(Identifiers.Actions.MOVE_DOWN)
	
	buffer["jump_just_pressed"] = _input_provider.is_action_just_pressed(Identifiers.Actions.JUMP)
	buffer["jump_held"] = _input_provider.is_action_pressed(Identifiers.Actions.JUMP)
	buffer["jump_released"] = _input_provider.is_action_just_released(Identifiers.Actions.JUMP)
	
	buffer["attack_pressed"] = _input_provider.is_action_pressed(Identifiers.Actions.ATTACK)
	buffer["attack_just_pressed"] = _input_provider.is_action_just_pressed(Identifiers.Actions.ATTACK)
	buffer["attack_released"] = _input_provider.is_action_just_released(Identifiers.Actions.ATTACK)
	
	buffer["dash_pressed"] = _input_provider.is_action_just_pressed(Identifiers.Actions.DASH)


# --- Public Methods ---

func setup(p_owner: Node, p_dependencies: Dictionary = {}) -> void:
	self.owner_node = p_owner as CharacterBody2D
	self.p_data = p_dependencies.get("data_resource")
	
	if p_dependencies.has("input_provider"):
		self._input_provider = p_dependencies["input_provider"]
	else:
		# Fallback for tests or standalone use
		self._input_provider = StandardInputProvider.new()

	if not p_data:
		push_error("InputComponent.setup: Missing 'data_resource' dependency.")
		return

func teardown() -> void:
	set_physics_process(false)
	owner_node = null
	p_data = null
	_input_provider = null
	buffer.clear()
