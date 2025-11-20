# src/entities/player/components/dash_component.gd
@tool
class_name DashComponent
extends IComponent

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

func _physics_process(delta: float) -> void:
	if Engine.is_editor_hint():
		return
	if not is_instance_valid(_owner_node):
		return

	_update_timers(delta)

	var state = _state_machine.get_current_state_key()
	if state == Identifiers.PlayerStates.ATTACK or state == Identifiers.PlayerStates.HURT or state == Identifiers.PlayerStates.HEAL or state == Identifiers.PlayerStates.DASH:
		return

	if (
		_input_component.input.dash_pressed
		and _p_data.physics.can_dash
		and _p_data.physics.dash_cooldown_timer <= 0
	):
		_state_machine.change_state(Identifiers.PlayerStates.DASH, {})

func teardown() -> void:
	set_physics_process(false)
	_owner_node = null
	_p_data = null
	_state_machine = null
	_input_component = null

func _update_timers(delta: float) -> void:
	if not is_instance_valid(_p_data):
		return
	_p_data.physics.dash_cooldown_timer = max(0.0, _p_data.physics.dash_cooldown_timer - delta)
	_p_data.physics.dash_duration_timer = max(0.0, _p_data.physics.dash_duration_timer - delta)
