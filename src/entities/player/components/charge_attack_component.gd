# src/entities/player/components/charge_attack_component.gd
@tool
class_name ChargeAttackComponent
extends IComponent

var _owner_node # Typed as Player
var _p_data: PlayerStateData
var _state_machine: BaseStateMachine
var _input_component: InputComponent
var _combat_component: CombatComponent

func _ready() -> void:
	process_priority = 0

func setup(p_owner: Node, p_dependencies: Dictionary = {}) -> void:
	_owner_node = p_owner
	_p_data = p_dependencies.get("data_resource")
	_state_machine = _owner_node.get_component(BaseStateMachine)
	_input_component = _owner_node.get_component(InputComponent)
	_combat_component = _owner_node.get_component(CombatComponent)

func _physics_process(delta: float) -> void:
	if Engine.is_editor_hint():
		return
	if not is_instance_valid(_owner_node):
		return
	
	# 1. Update Timers
	if _p_data.combat.is_charging and _input_component.buffer.get("attack_pressed"):
		_p_data.combat.charge_timer += delta

	# 2. Handle Inputs
	if _input_component.buffer.get("attack_just_pressed") and _p_data.combat.attack_cooldown_timer <= 0:
		_p_data.combat.is_charging = true
		_p_data.combat.charge_timer = 0.0

	if _input_component.buffer.get("attack_released"):
		if _p_data.combat.is_charging:
			_try_execute_attack()
			_p_data.combat.is_charging = false

func _try_execute_attack() -> void:
	# Guard against race condition where state machine is cleared (player death)
	if _state_machine.states.is_empty():
		return

	var state = _state_machine.get_current_state_key()
	if state == Identifiers.PlayerStates.HURT or state == Identifiers.PlayerStates.DASH or state == Identifiers.PlayerStates.HEAL:
		return

	if _p_data.combat.charge_timer >= _p_data.config.charge_time:
		_combat_component.fire_shot()
	elif _input_component.buffer.get("down"):
		_state_machine.change_state(Identifiers.PlayerStates.POGO, {})
	else:
		_state_machine.change_state(Identifiers.PlayerStates.ATTACK, {})

func teardown() -> void:
	set_physics_process(false)
	_owner_node = null
	_p_data = null
	_state_machine = null
	_input_component = null
	_combat_component = null
