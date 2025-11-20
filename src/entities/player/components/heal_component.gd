# src/entities/player/components/heal_component.gd
@tool
class_name HealComponent
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
	if not is_instance_valid(_owner_node):
		return

	var state = _state_machine.get_current_state_key()
	if state != Identifiers.PlayerStates.MOVE and state != Identifiers.PlayerStates.FALL and state != Identifiers.PlayerStates.JUMP:
		return

	if _input_component.input.jump_just_pressed:
		var is_holding_down = _input_component.input.down

		if (
			is_holding_down
			and _p_data.combat.healing_charges > 0
			and _owner_node.is_on_floor()
			and is_zero_approx(_owner_node.velocity.x)
		):
			# PRIORITY FIX: If standing on a drop-through platform, 
			# Down+Jump means "Drop", not "Heal".
			if JumpHelper.is_standing_on_platform(_owner_node):
				return

			_state_machine.change_state(Identifiers.PlayerStates.HEAL, {})

func teardown() -> void:
	set_physics_process(false)
	_owner_node = null
	_p_data = null
	_state_machine = null
	_input_component = null
