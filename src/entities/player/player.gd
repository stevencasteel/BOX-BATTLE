# src/entities/player/player.gd
@tool
class_name Player
extends BaseEntity

# --- Signals ---
signal health_changed(current_health, max_health)
signal died

# --- Constants ---
const ACTION_ALLOWED_STATES = [
	&"move",
	&"fall",
	&"jump",
	&"wall_slide"
]

# --- Editor Properties ---
@export_group("Juice & Feedback")
@export var hit_flash_effect: ShaderEffect = null
@export var damage_shake_effect: ScreenShakeEffect = null
@export var hit_spark_effect: VFXEffect = null

@export_group("Configuration")
@export var state_machine_config: StateMachineConfig = null

# --- Node References ---
@onready var melee_hitbox: HitboxComponent = $MeleeHitbox
@onready var pogo_hitbox: HitboxComponent = $PogoHitbox
@onready var hurtbox: HurtboxComponent = $Hurtbox

# --- Data ---
var entity_data: PlayerStateData

# --- Components ---
var _visual_component: VisualComponent

# --- Godot Lifecycle Methods ---
func _ready() -> void:
	super._ready()
	if Engine.is_editor_hint():
		return

	add_to_group(Identifiers.Groups.PLAYER)
	ServiceLocator.targeting_system.register(self, Identifiers.Groups.PLAYER)
	
	entity_data = PlayerStateData.new()
	
	build_entity()

	entity_data.combat.healing_charges = 0
	get_component(PlayerResourceComponent).on_damage_dealt()
	entity_data.combat.determination_counter = 0
	
	# FIX: Initialize Hitbox Position (70 offset)
	if is_instance_valid(melee_hitbox):
		melee_hitbox.set_shape_offset(Vector2(70.0, 0.0))


func _physics_process(delta: float) -> void:
	# CRITICAL FIX: Guard against null entity_data during initialization or teardown
	if _is_dead or not is_instance_valid(entity_data):
		return

	_update_timers(delta)
	
	# Update Visuals via Component
	var facing = entity_data.physics.facing_direction
	if is_instance_valid(_visual_component):
		_visual_component.set_facing(facing)
	
	# POLISH: Sync Hitbox Debug Position (70 offset)
	if is_instance_valid(melee_hitbox):
		var debug_offset = Vector2(70.0 * facing, 0.0)
		melee_hitbox.set_shape_offset(debug_offset)
	
	# Delegate actual movement to base class
	super._physics_process(delta)


func _exit_tree() -> void:
	super._exit_tree()
	if not Engine.is_editor_hint():
		ServiceLocator.targeting_system.unregister(self, Identifiers.Groups.PLAYER)


# --- Internal Build Logic ---
func _on_build() -> void:
	if not _services:
		_services = ServiceLocator

	entity_data.config = _services.player_config
	entity_data.world_config = _services.world_config
	
	entity_data.max_health = entity_data.config.max_health
	entity_data.health = entity_data.max_health

	# Cache Components
	var hc: HealthComponent = get_component(HealthComponent)
	var sm: BaseStateMachine = get_component(BaseStateMachine)
	var fc: FXComponent = get_component(FXComponent)
	var cc: CombatComponent = get_component(CombatComponent)
	var rc: PlayerResourceComponent = get_component(PlayerResourceComponent)
	var pc: PogoComponent = get_component(PogoComponent)
	var healc: HealComponent = get_component(HealComponent)
	_visual_component = get_component(VisualComponent)

	var shared_deps := {
		"data_resource": entity_data, 
		"config": entity_data.config,
		"services": _services
	}

	var states: Dictionary = {}
	var initial_state_key = &""
	
	if state_machine_config:
		initial_state_key = state_machine_config.initial_state
		for def in state_machine_config.states:
			if def.state_script:
				states[def.key] = def.state_script.new(self, sm, entity_data)
	else:
		push_error("Player: Missing StateMachineConfig!")

	var raw_visual_node = get_node("ColorRect")

	var per_component_deps := {
		sm: {"states": states, "initial_state_key": initial_state_key},
		fc: {
			"visual_node": raw_visual_node, 
			"hit_effect": hit_flash_effect,
			"fx_manager": _services.fx_manager
			},
		hc: {
			"fx_manager": _services.fx_manager,
			"event_bus": _services.event_bus
			},
		cc: {
			"object_pool": _services.object_pool,
			"fx_manager": _services.fx_manager,
			"combat_utils": _services.combat_utils,
			"services": _services,
			"melee_hitbox": melee_hitbox
			},
		rc: {
			"event_bus": _services.event_bus
			},
		pc: {
			"pogo_hitbox": pogo_hitbox,
			"services": _services,
			"fx_manager": _services.fx_manager
		},
		healc: {
			"resource_component": rc,
			"event_bus": _services.event_bus
		},
		_visual_component: {
			"visual_node": raw_visual_node
		}
	}

	setup_components(shared_deps, per_component_deps)

	if is_instance_valid(hurtbox):
		hurtbox.setup(self, {"services": _services})

	if rc:
		if cc and not cc.damage_dealt.is_connected(rc.on_damage_dealt):
			cc.damage_dealt.connect(rc.on_damage_dealt)
		if pc and not pc.damage_dealt.is_connected(rc.on_damage_dealt):
			pc.damage_dealt.connect(rc.on_damage_dealt)

	if pc and not pc.pogo_bounce_requested.is_connected(_on_pogo_bounce_requested):
		pc.pogo_bounce_requested.connect(_on_pogo_bounce_requested)
	
	# NEW: Wire up Centralized Damage Response
	if hc and not hc.took_damage.is_connected(_on_took_damage):
		hc.took_damage.connect(_on_took_damage)


# --- Public Methods ---
func teardown() -> void:
	var cc: CombatComponent = get_component(CombatComponent)
	var rc: PlayerResourceComponent = get_component(PlayerResourceComponent)
	var pc: PogoComponent = get_component(PogoComponent)
	var hc: HealthComponent = get_component(HealthComponent)

	if is_instance_valid(rc):
		if is_instance_valid(cc) and cc.damage_dealt.is_connected(rc.on_damage_dealt):
			cc.damage_dealt.disconnect(rc.on_damage_dealt)
		if is_instance_valid(pc) and pc.damage_dealt.is_connected(rc.on_damage_dealt):
			pc.damage_dealt.disconnect(rc.on_damage_dealt)

	if is_instance_valid(pc) and pc.pogo_bounce_requested.is_connected(_on_pogo_bounce_requested):
		pc.pogo_bounce_requested.disconnect(_on_pogo_bounce_requested)
	
	if is_instance_valid(hc) and hc.took_damage.is_connected(_on_took_damage):
		hc.took_damage.disconnect(_on_took_damage)
	
	if is_instance_valid(hurtbox):
		hurtbox.teardown()
	
	if not Engine.is_editor_hint():
		ServiceLocator.targeting_system.unregister(self, Identifiers.Groups.PLAYER)

	super.teardown()
	entity_data = null
	_visual_component = null


# --- Override Virtual Handlers ---
func _on_entity_died() -> void:
	_die()

func _on_health_changed(current: int, max_val: int) -> void:
	var ev = PlayerHealthChangedEvent.new()
	ev.current_health = current
	ev.max_health = max_val
	_services.event_bus.emit(EventCatalog.PLAYER_HEALTH_CHANGED, ev)
	health_changed.emit(current, max_val)


# --- Centralized Damage Response ---
func _on_took_damage(_info: DamageInfo, result: DamageResult) -> void:
	# FIX: Guard against mid-teardown execution
	if not is_instance_valid(entity_data) or not is_instance_valid(result):
		return

	if not result.was_damaged:
		return
		
	# Apply Knockback
	velocity = result.knockback_velocity
	
	# Change State
	var sm = get_component(BaseStateMachine)
	if is_instance_valid(sm):
		# PUNISHMENT: Lose healing charge if hit while healing
		if sm.get_current_state_key() == Identifiers.PlayerStates.HEAL:
			var rc = get_component(PlayerResourceComponent)
			if rc:
				rc.consume_healing_charge()
		
		sm.change_state(Identifiers.PlayerStates.HURT)
		
	# Trigger Shake
	if is_instance_valid(damage_shake_effect) and _services.fx_manager.is_camera_shaker_registered():
		_services.fx_manager.request_screen_shake(damage_shake_effect)
		_services.fx_manager.request_hit_stop(entity_data.world_config.hit_stop_player_hurt)


# --- Private Methods ---
func _die() -> void:
	if _is_dead:
		return
	_is_dead = true

	collision_layer = 0
	collision_mask = 0
	set_physics_process(false)
	
	if not Engine.is_editor_hint():
		ServiceLocator.targeting_system.unregister(self, Identifiers.Groups.PLAYER)
	
	if is_instance_valid(hurtbox):
		hurtbox.teardown()

	var sm: BaseStateMachine = get_component(BaseStateMachine)
	if is_instance_valid(sm):
		sm.teardown()
	
	# Delegate death visuals
	if is_instance_valid(_visual_component):
		var tween: Tween = _visual_component.play_death_sequence()
		if is_instance_valid(tween):
			await tween.finished

	died.emit()


func _update_timers(delta: float) -> void:
	if not is_instance_valid(entity_data):
		return
	
	entity_data.physics.knockback_timer = max(0.0, entity_data.physics.knockback_timer - delta)


# --- Signal Handlers ---

func _on_pogo_bounce_requested() -> void:
	var physics = get_component(PlayerPhysicsComponent)
	if physics:
		physics.perform_pogo_bounce()
	
	entity_data.physics.can_dash = true
	entity_data.physics.air_jumps_left = entity_data.config.max_air_jumps
	get_component(BaseStateMachine).change_state(Identifiers.PlayerStates.FALL)
