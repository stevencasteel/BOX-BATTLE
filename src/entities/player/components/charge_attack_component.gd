# src/entities/player/components/charge_attack_component.gd
@tool
class_name ChargeAttackComponent
extends IComponent

const AURA_START_DELAY: float = 0.25

var _owner_node # Typed as Player
var _p_data: PlayerStateData
var _state_machine: BaseStateMachine
var _input_component: InputComponent
var _combat_component: CombatComponent

var _aura_instance: Node2D

func _ready() -> void:
	process_priority = 0

func setup(p_owner: Node, p_dependencies: Dictionary = {}) -> void:
	_owner_node = p_owner
	_p_data = p_dependencies.get("data_resource")
	_state_machine = _owner_node.get_component(BaseStateMachine)
	_input_component = _owner_node.get_component(InputComponent)
	_combat_component = _owner_node.get_component(CombatComponent)
	
	var aura_scene = _p_data.config.vfx_charge_aura
	if is_instance_valid(_owner_node) and is_instance_valid(aura_scene):
		_aura_instance = aura_scene.instantiate()
		_aura_instance.emitting = false
		_owner_node.add_child(_aura_instance)

func _physics_process(delta: float) -> void:
	if Engine.is_editor_hint():
		return
	if not is_instance_valid(_owner_node):
		return
	
	# 1. Update Timers
	if _p_data.combat.is_charging and _input_component.input.attack_pressed:
		_p_data.combat.charge_timer += delta

	# 2. Update Visuals
	var should_emit = _p_data.combat.is_charging and _p_data.combat.charge_timer >= AURA_START_DELAY
	
	if is_instance_valid(_aura_instance):
		if _aura_instance.emitting != should_emit:
			_aura_instance.emitting = should_emit
		
		if _p_data.combat.charge_timer >= _p_data.config.level_2_charge_time:
			_aura_instance.scale = Vector2(1.5, 1.5)
		else:
			_aura_instance.scale = Vector2(1.0, 1.0)

	# 3. Handle Inputs
	if _input_component.input.attack_just_pressed:
		_p_data.combat.is_charging = true
		_p_data.combat.charge_timer = 0.0

	if _input_component.input.attack_released:
		if _p_data.combat.is_charging:
			_try_execute_attack()
			_p_data.combat.is_charging = false

func _try_execute_attack() -> void:
	if _state_machine.states.is_empty():
		return

	var state = _state_machine.get_current_state_key()
	if state == Identifiers.PlayerStates.HURT or state == Identifiers.PlayerStates.DASH or state == Identifiers.PlayerStates.HEAL:
		return

	if _p_data.combat.charge_timer >= _p_data.config.charge_time:
		var is_lvl_2 = _p_data.combat.charge_timer >= _p_data.config.level_2_charge_time
		_combat_component.fire_shot(is_lvl_2)
		_spawn_release_splash(is_lvl_2)
	elif _input_component.input.down:
		_state_machine.change_state(Identifiers.PlayerStates.POGO, {})
	else:
		_state_machine.change_state(Identifiers.PlayerStates.ATTACK, {})

func _spawn_release_splash(is_large: bool = false) -> void:
	if not is_instance_valid(_owner_node):
		return
	
	var splash_scene = _p_data.config.vfx_charge_splash
	if not is_instance_valid(splash_scene):
		return

	var splash = splash_scene.instantiate()
	var offset = Vector2(_p_data.physics.facing_direction * 60, 0)
	splash.global_position = _owner_node.global_position + offset
	
	if is_large:
		splash.scale = Vector2(1.5, 1.5)
	
	splash.emitting = true
	_owner_node.get_tree().current_scene.add_child(splash)

func teardown() -> void:
	set_physics_process(false)
	if is_instance_valid(_aura_instance):
		_aura_instance.queue_free()
	_aura_instance = null
	_owner_node = null
	_p_data = null
	_state_machine = null
	_input_component = null
	_combat_component = null
