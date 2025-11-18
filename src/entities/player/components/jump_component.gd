# src/entities/player/components/jump_component.gd
@tool
class_name JumpComponent
extends IComponent

const JumpHelper = preload("res://src/entities/player/components/player_jump_helper.gd")

var _owner_node: Player
var _p_data: PlayerStateData
var _state_machine: BaseStateMachine
var _input_component: InputComponent

func _ready() -> void:
	process_priority = 0

func setup(p_owner: Node, p_dependencies: Dictionary = {}) -> void:
	_owner_node = p_owner as Player
	_p_data = p_dependencies.get("data_resource")
	_state_machine = _owner_node.get_component(BaseStateMachine)
	_input_component = _owner_node.get_component(InputComponent)

func _physics_process(_delta: float) -> void:
	if not is_instance_valid(_owner_node) or not is_instance_valid(_state_machine):
		return
	
	if not _state_machine.get_current_state_key() in Player.ACTION_ALLOWED_STATES:
		return

	if _input_component.buffer.get("jump_just_pressed"):
		var is_holding_down = _input_component.buffer.get("down", false)
		
		# Note: Heal logic is now in HealComponent, so we don't check it here.
		
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