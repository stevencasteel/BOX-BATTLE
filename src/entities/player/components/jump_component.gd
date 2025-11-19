# src/entities/player/components/jump_component.gd
@tool
class_name JumpComponent
extends IComponent

const JumpHelper = preload("res://src/entities/player/components/player_jump_helper.gd")

var _owner_node # Typed as Player
var _p_data: PlayerStateData
var _state_machine: BaseStateMachine
var _input_component: InputComponent

func _ready() -> void:
	process_priority = 0

func setup(p_owner: Node, p_dependencies: Dictionary = {}) -> void:
	_owner_node = p_owner
	_p_data = p_dependencies.get("data_resource")
	_state_machine = _owner_node.get_component(BaseStateMachine)
	_input_component = _owner_node.get_component(InputComponent)

func _physics_process(_delta: float) -> void:
	if Engine.is_editor_hint():
		return
	if not is_instance_valid(_owner_node) or not is_instance_valid(_state_machine):
		return
	
	# Check constant on the script resource to avoid cyclic reference to Player class
	if not _state_machine.get_current_state_key() in Identifiers.PlayerStates.MOVE: # Fallback check
		# We rely on the string keys matching identifiers
		var key = _state_machine.get_current_state_key()
		if key != Identifiers.PlayerStates.MOVE and key != Identifiers.PlayerStates.FALL and key != Identifiers.PlayerStates.JUMP and key != Identifiers.PlayerStates.WALL_SLIDE:
			return

	if _input_component.buffer.get("jump_just_pressed"):
		var is_holding_down = _input_component.buffer.get("down", false)
		
		if is_holding_down:
			if JumpHelper.try_platform_drop(_owner_node):
				return
		
		JumpHelper.try_jump(_owner_node, _p_data)

func teardown() -> void:
	set_physics_process(false)
	_owner_node = null
	_p_data = null
	_state_machine = null
	_input_component = null
