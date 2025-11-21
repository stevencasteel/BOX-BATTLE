# src/entities/minions/minion.gd
@tool
## A generic minion enemy, whose behavior is defined by a MinionBehavior resource.
class_name Minion
extends BaseEntity

# --- Editor Configuration ---
@export_group("Core Configuration")
@export var behavior: MinionBehavior
@export var state_machine_config: StateMachineConfig

@export_group("Juice & Feedback")
@export var hit_flash_effect: ShaderEffect
@export var hit_spark_effect: VFXEffect
@export var dissolve_effect: ShaderEffect

# --- Node References ---
# visual ref handled by component
@onready var attack_timer: Timer = $AttackTimer
@onready var range_detector: SensorComponent = $RangeDetector
@onready var range_detector_shape: CollisionShape2D = $RangeDetector/CollisionShape2D

# --- Public Member Variables ---
var entity_data: MinionStateData
var _visual_component: VisualComponent

# --- Godot Lifecycle Methods ---
func _get_configuration_warnings() -> PackedStringArray:
	var warnings := PackedStringArray()
	if not archetype:
		warnings.append("This node requires an EntityArchetype resource.")
	if not behavior:
		warnings.append("This node requires a MinionBehavior resource to function.")
	if not state_machine_config:
		warnings.append("This node requires a StateMachineConfig resource.")
	return warnings


func _ready() -> void:
	super._ready()
	if Engine.is_editor_hint():
		return
	
	ServiceLocator.targeting_system.register(self, Identifiers.Groups.ENEMY)

	_initialize_data()
	build_entity()
	
	if entity_data.behavior.is_anchored:
		motion_mode = CharacterBody2D.MOTION_MODE_FLOATING


func _physics_process(delta: float) -> void:
	if _is_dead or not is_instance_valid(entity_data):
		return
	
	if entity_data.behavior.is_anchored:
		velocity = Vector2.ZERO
	elif not is_on_floor():
		velocity.y += entity_data.world_config.gravity * delta
		
	# Delegate to BaseEntity
	super._physics_process(delta)


func _notification(what: int) -> void:
	if what == NOTIFICATION_PREDELETE:
		teardown()

func _exit_tree() -> void:
	super._exit_tree()
	if not Engine.is_editor_hint():
		ServiceLocator.targeting_system.unregister(self, Identifiers.Groups.ENEMY)


# --- Public Methods ---
func teardown() -> void:
	if not Engine.is_editor_hint():
		ServiceLocator.targeting_system.unregister(self, Identifiers.Groups.ENEMY)

	super.teardown()
	entity_data = null
	_visual_component = null


func update_player_tracking() -> void:
	_update_player_tracking()


func deactivate() -> void:
	var sm: BaseStateMachine = get_component(BaseStateMachine)
	if is_instance_valid(sm):
		sm.teardown()
	if is_instance_valid(attack_timer):
		attack_timer.stop()

	set_physics_process(false)
	if is_instance_valid(range_detector):
		range_detector.monitoring = false
	
	var melee_detector = get_node_or_null("MeleeRangeDetector")
	if is_instance_valid(melee_detector) and melee_detector is Area2D:
		melee_detector.monitoring = false


# --- Internal Build Logic ---
func _on_build() -> void:
	# Apply Behavior Config
	var circle_shape := CircleShape2D.new()
	circle_shape.radius = entity_data.behavior.detection_radius
	range_detector_shape.shape = circle_shape

	# Setup Sensors
	if is_instance_valid(range_detector):
		range_detector.setup(self, {"data_resource": entity_data})
	
	var melee_detector = get_node_or_null("MeleeRangeDetector")
	if is_instance_valid(melee_detector) and melee_detector is SensorComponent:
		melee_detector.setup(self, {"data_resource": entity_data})

	# Setup Components
	var hc: HealthComponent = get_component(HealthComponent)
	var sm: BaseStateMachine = get_component(BaseStateMachine)
	var fc: FXComponent = get_component(FXComponent)
	
	# Dynamically add VisualComponent if missing (Minions likely rely on archetype update)
	_visual_component = get_component(VisualComponent)
	if not _visual_component:
		_visual_component = VisualComponent.new()
		add_child(_visual_component)

	var shared_deps := {
		"data_resource": entity_data,
		"config": entity_data.config,
		"services": _services
	}

	var states: Dictionary = {}
	var initial_state_key = &""
	
	if state_machine_config:
		# Prefer behavior's override if set, otherwise default to config's initial
		initial_state_key = entity_data.behavior.initial_state_key
		if initial_state_key == &"":
			initial_state_key = state_machine_config.initial_state
			
		for def in state_machine_config.states:
			if def.state_script:
				states[def.key] = def.state_script.new(self, sm, entity_data)
	else:
		push_error("Minion: Missing StateMachineConfig!")

	var raw_visual = get_node("Visual")

	var per_component_deps := {
		sm: {"states": states, "initial_state_key": initial_state_key},
		fc: {
			"visual_node": raw_visual, 
			"hit_effect": hit_flash_effect,
			"fx_manager": _services.fx_manager
			},
		hc: {
			"fx_manager": _services.fx_manager,
			"event_bus": _services.event_bus
			},
		_visual_component: {
			"visual_node": raw_visual
		}
	}

	setup_components(shared_deps, per_component_deps)
	
	# Minions rely on Polygon2D color property, handled by VisualComponent now.
	# We set a default color here if needed, or let VisualComponent handle generic init.
	_visual_component.set_color(Palette.COLOR_TERRAIN_SECONDARY)


func _safe_script(script_ref: Script, fallback_path: String) -> Script:
	if script_ref:
		return script_ref
	return load(fallback_path)


# --- Override Virtual Handlers ---
func _on_entity_died() -> void:
	_die()


# --- Private Methods ---
func _die() -> void:
	if _is_dead:
		return
	_is_dead = true

	collision_layer = 0
	collision_mask = 0
	deactivate()

	# Manual dissolve trigger because Minion death logic handles queue_free timing
	var fc: FXComponent = get_component(FXComponent)
	if is_instance_valid(dissolve_effect) and is_instance_valid(fc):
		var death_tween: Tween = fc.play_effect(dissolve_effect, {}, {"preserve_final_state": true})
		if is_instance_valid(death_tween):
			await death_tween.finished

	if is_instance_valid(self):
		queue_free()


func _initialize_data() -> void:
	add_to_group(Identifiers.Groups.ENEMY)
	entity_data = MinionStateData.new()
	
	if not _services:
		_services = ServiceLocator

	assert(is_instance_valid(behavior), "Minion requires a valid MinionBehavior resource.")
	entity_data.behavior = behavior
	entity_data.max_health = behavior.max_health
	entity_data.projectile_pool_key = behavior.projectile_pool_key
	entity_data.services = _services
	entity_data.config = _services.enemy_config
	entity_data.world_config = _services.world_config


func _update_player_tracking() -> void:
	if not is_instance_valid(_player):
		return

	var dir_to_player: float = _player.global_position.x - global_position.x
	if not is_zero_approx(dir_to_player):
		entity_data.facing_direction = sign(dir_to_player)
	
	if is_instance_valid(_visual_component):
		_visual_component.set_facing(entity_data.facing_direction)


# --- Signal Handlers ---
func _on_health_component_died() -> void:
	_die()
