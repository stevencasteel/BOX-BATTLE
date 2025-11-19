# src/entities/boss/base_boss.gd
@tool
class_name BaseBoss
extends BaseEntity

# --- Editor Configuration ---
@export_group("Core Configuration")
@export var behavior: BossBehavior = null
@export var state_machine_config: StateMachineConfig = null

@export_group("Juice & Feedback")
@export var hit_flash_effect: ShaderEffect = null
@export var phase_change_shake_effect: ScreenShakeEffect = null
@export var death_shake_effect: ScreenShakeEffect = null
@export var hit_spark_effect: VFXEffect = null
@export var dissolve_effect: ShaderEffect = null

@export_group("State Scripts")
@export var state_idle_script: Script = null
@export var state_attack_script: Script = null
@export var state_cooldown_script: Script = null
@export var state_patrol_script: Script = null
@export var state_lunge_script: Script = null
@export var state_melee_script: Script = null

# --- Node References ---
@onready var visual_sprite: ColorRect = $ColorRect
@onready var cooldown_timer: Timer = $CooldownTimer
@onready var patrol_timer: Timer = $PatrolTimer
@onready var collision_shape: CollisionShape2D = $CollisionShape2D
@onready var close_range_detector: SensorComponent = $CloseRangeDetector

# --- Public Member Variables ---
var current_attack_patterns: Array[AttackPattern] = []
var phases_remaining: int = 3
var entity_data: BossStateData

# --- Godot Lifecycle Methods ---
func _get_configuration_warnings() -> PackedStringArray:
	var warnings = PackedStringArray()
	if not archetype:
		warnings.append("This node requires an EntityArchetype resource.")
	if not behavior:
		warnings.append("This node requires a BossBehavior resource.")
	elif is_instance_valid(behavior) and behavior.phase_1_patterns.is_empty():
		warnings.append("The assigned BossBehavior has no Phase 1 attack patterns.")
	if not state_machine_config:
		warnings.append("This node requires a StateMachineConfig resource.")
	return warnings


func _ready() -> void:
	super._ready()
	if Engine.is_editor_hint():
		return

	if not is_in_group(Identifiers.Groups.ENEMY):
		add_to_group(Identifiers.Groups.ENEMY)
	
	ServiceLocator.targeting_system.register(self, Identifiers.Groups.ENEMY)

	_initialize_data()
	
	# Trigger internal build
	build_entity()


func _physics_process(delta: float) -> void:
	if Engine.is_editor_hint() or not is_instance_valid(entity_data):
		return
	if not is_on_floor():
		velocity.y += entity_data.world_config.gravity * delta
	move_and_slide()


func _exit_tree() -> void:
	super._exit_tree()
	if not Engine.is_editor_hint():
		ServiceLocator.targeting_system.unregister(self, Identifiers.Groups.ENEMY)


# --- Internal Build Logic ---
func _on_build() -> void:
	if is_instance_valid(close_range_detector):
		close_range_detector.setup(self, {"data_resource": entity_data})

	var hc: HealthComponent = get_component(HealthComponent)
	var sm: BaseStateMachine = get_component(BaseStateMachine)
	var fc: FXComponent = get_component(FXComponent)

	var shared_deps := {
		"data_resource": entity_data, 
		"config": entity_data.config,
		"services": _services
		}

	# OCP: Build state map dynamically from config resource
	var states: Dictionary = {}
	var initial_state_key = &""
	
	if state_machine_config:
		initial_state_key = state_machine_config.initial_state
		for def in state_machine_config.states:
			if def.state_script:
				states[def.key] = def.state_script.new(self, sm, entity_data)
	else:
		push_error("BaseBoss: Missing StateMachineConfig!")

	var per_component_deps := {
		sm: {"states": states, "initial_state_key": initial_state_key},
		fc: {
			"visual_node": visual_sprite, 
			"hit_effect": hit_flash_effect,
			"fx_manager": _services.fx_manager
			},
		hc: {
			"hit_spark_effect": hit_spark_effect,
			"fx_manager": _services.fx_manager,
			"event_bus": _services.event_bus
			}
	}

	setup_components(shared_deps, per_component_deps)

	if hc:
		if not hc.health_threshold_reached.is_connected(_on_health_threshold_reached):
			hc.health_threshold_reached.connect(_on_health_threshold_reached)


# --- Public Methods ---
func teardown() -> void:
	set_physics_process(false)
	var hc: HealthComponent = get_component(HealthComponent)
	if is_instance_valid(hc):
		if hc.health_threshold_reached.is_connected(_on_health_threshold_reached):
			hc.health_threshold_reached.disconnect(_on_health_threshold_reached)

	if not Engine.is_editor_hint():
		ServiceLocator.targeting_system.unregister(self, Identifiers.Groups.ENEMY)

	super.teardown()
	entity_data = null


func get_health_thresholds() -> Array[float]:
	if is_instance_valid(behavior):
		return [behavior.phase_2_threshold, behavior.phase_3_threshold]
	return []


# --- Override Virtual Handlers ---
func _on_entity_died() -> void:
	_die()

func _on_health_changed(current: int, max_val: int) -> void:
	var ev := BossHealthChangedEvent.new()
	ev.current_health = current
	ev.max_health = max_val
	_services.event_bus.emit(EventCatalog.BOSS_HEALTH_CHANGED, ev)


# --- Private Methods ---
func _die() -> void:
	if _is_dead:
		return
	_is_dead = true

	var sm: BaseStateMachine = get_component(BaseStateMachine)
	if is_instance_valid(sm):
		sm.teardown()

	cooldown_timer.stop()
	patrol_timer.stop()
	if is_instance_valid(close_range_detector):
		close_range_detector.monitoring = false

	collision_layer = 0
	collision_mask = 0
	set_physics_process(false)

	ServiceLocator.targeting_system.unregister(self, Identifiers.Groups.ENEMY)

	if is_instance_valid(death_shake_effect):
		_services.fx_manager.request_screen_shake(death_shake_effect)
	
	_services.fx_manager.request_hit_stop(entity_data.world_config.hit_stop_boss_death)

	var fc: FXComponent = get_component(FXComponent)
	if is_instance_valid(dissolve_effect) and is_instance_valid(fc):
		fc.play_effect(dissolve_effect, {}, {"preserve_final_state": true})

	var ev = BossDiedEvent.new()
	ev.boss_node = self
	_services.event_bus.emit(EventCatalog.BOSS_DIED, ev)


func _initialize_data() -> void:
	add_to_group(Identifiers.Groups.ENEMY)
	visual_sprite.color = Palette.COLOR_BOSS_PRIMARY
	if is_instance_valid(behavior):
		current_attack_patterns = behavior.phase_1_patterns
	entity_data = BossStateData.new()
	
	if not _services:
		_services = ServiceLocator

	entity_data.config = _services.enemy_config
	entity_data.world_config = _services.world_config
	
	entity_data.behavior = behavior
	entity_data.services = _services
	
	entity_data.projectile_pool_key = behavior.projectile_pool_key

	# CRITICAL FIX: Set max_health from config, overriding the default of 1
	entity_data.max_health = entity_data.config.boss_health
	entity_data.health = entity_data.max_health


func _update_player_tracking() -> void:
	if is_instance_valid(_player):
		var dir_to_player: float = _player.global_position.x - global_position.x
		if not is_zero_approx(dir_to_player):
			entity_data.facing_direction = sign(dir_to_player)
	self.scale.x = entity_data.facing_direction


# --- Signal Handlers ---

func _on_health_threshold_reached(health_percentage: float) -> void:
	if not is_instance_valid(behavior):
		return

	var new_phases_remaining: int = phases_remaining
	if health_percentage <= behavior.phase_3_threshold and phases_remaining > 1:
		new_phases_remaining = 1
	elif health_percentage <= behavior.phase_2_threshold and phases_remaining > 2:
		new_phases_remaining = 2

	if new_phases_remaining != phases_remaining:
		phases_remaining = new_phases_remaining
		match phases_remaining:
			2:
				current_attack_patterns = behavior.phase_2_patterns
			1:
				current_attack_patterns = behavior.phase_3_patterns
		if is_instance_valid(phase_change_shake_effect):
			_services.fx_manager.request_screen_shake(phase_change_shake_effect)
		
		_services.fx_manager.request_hit_stop(
			entity_data.world_config.hit_stop_boss_phase_change
		)
		
		var ev = BossPhaseChangedEvent.new()
		ev.phases_remaining = phases_remaining
		_services.event_bus.emit(EventCatalog.BOSS_PHASE_CHANGED, ev)


func _on_cooldown_timer_timeout() -> void:
	var sm: BaseStateMachine = get_component(BaseStateMachine)
	if is_instance_valid(sm) and sm.current_state == sm.states[Identifiers.BossStates.COOLDOWN]:
		sm.change_state(Identifiers.BossStates.PATROL)


func _on_patrol_timer_timeout() -> void:
	var sm: BaseStateMachine = get_component(BaseStateMachine)
	if is_instance_valid(sm) and sm.current_state == sm.states[Identifiers.BossStates.PATROL]:
		sm.change_state(Identifiers.BossStates.IDLE)


func _on_health_component_health_changed(current: int, max_val: int) -> void:
	var ev := BossHealthChangedEvent.new()
	ev.current_health = current
	ev.max_health = max_val
	_services.event_bus.emit(EventCatalog.BOSS_HEALTH_CHANGED, ev)


func _on_health_component_died() -> void:
	_die()
