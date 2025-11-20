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
# Dissolve effect moved to PlayerConfig via VisualComponent

@export_group("Configuration")
@export var state_machine_config: StateMachineConfig = null

# --- Node References ---
@onready var visual_sprite: ColorRect = get_node("ColorRect")
@onready var healing_timer: Timer = get_node("HealingTimer")
@onready var melee_hitbox: HitboxComponent = get_node("MeleeHitbox")
@onready var pogo_hitbox: HitboxComponent = get_node("PogoHitbox")
@onready var hurtbox: HurtboxComponent = get_node("Hurtbox")

# --- Data ---
var entity_data: PlayerStateData

# --- Godot Lifecycle Methods ---
func _ready() -> void:
	super._ready()
	if Engine.is_editor_hint():
		return

	# Registration
	add_to_group(Identifiers.Groups.PLAYER)
	ServiceLocator.targeting_system.register(self, Identifiers.Groups.PLAYER)
	
	# Setup Data
	entity_data = PlayerStateData.new()
	
	# Trigger internal build
	build_entity()

	# Post-Build Init
	entity_data.combat.healing_charges = 0
	get_component(PlayerResourceComponent).on_damage_dealt()
	entity_data.combat.determination_counter = 0


func _physics_process(delta: float) -> void:
	if _is_dead:
		return
	_update_timers(delta)
	
	# Centralized Physics Movement
	move_and_slide()


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
	
	# CRITICAL FIX: Initialize health from config before components read it
	entity_data.max_health = entity_data.config.max_health
	entity_data.health = entity_data.max_health

	var hc: HealthComponent = get_component(HealthComponent)
	var sm: BaseStateMachine = get_component(BaseStateMachine)
	var fc: FXComponent = get_component(FXComponent)
	var cc: CombatComponent = get_component(CombatComponent)
	var rc: PlayerResourceComponent = get_component(PlayerResourceComponent)
	var pc: PogoComponent = get_component(PogoComponent)
	var vc: VisualComponent = get_component(VisualComponent)

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
		push_error("Player: Missing StateMachineConfig!")

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
			"services": _services
		},
		vc: {
			"visual_node": visual_sprite
		}
	}

	setup_components(shared_deps, per_component_deps)

	if is_instance_valid(hurtbox):
		hurtbox.setup(self, {"services": _services})

	# --- Wire signals between components ---
	if rc:
		if cc and not cc.damage_dealt.is_connected(rc.on_damage_dealt):
			cc.damage_dealt.connect(rc.on_damage_dealt)
		if pc and not pc.damage_dealt.is_connected(rc.on_damage_dealt):
			pc.damage_dealt.connect(rc.on_damage_dealt)

	if pc and not pc.pogo_bounce_requested.is_connected(_on_pogo_bounce_requested):
		pc.pogo_bounce_requested.connect(_on_pogo_bounce_requested)

	if healing_timer and not healing_timer.timeout.is_connected(_on_healing_timer_timeout):
		healing_timer.timeout.connect(_on_healing_timer_timeout)


# --- Public Methods ---
func teardown() -> void:
	var cc: CombatComponent = get_component(CombatComponent)
	var rc: PlayerResourceComponent = get_component(PlayerResourceComponent)
	var pc: PogoComponent = get_component(PogoComponent)

	if is_instance_valid(rc):
		if is_instance_valid(cc) and cc.damage_dealt.is_connected(rc.on_damage_dealt):
			cc.damage_dealt.disconnect(rc.on_damage_dealt)
		if is_instance_valid(pc) and pc.damage_dealt.is_connected(rc.on_damage_dealt):
			pc.damage_dealt.disconnect(rc.on_damage_dealt)

	if is_instance_valid(pc) and pc.pogo_bounce_requested.is_connected(_on_pogo_bounce_requested):
		pc.pogo_bounce_requested.disconnect(_on_pogo_bounce_requested)

	if is_instance_valid(healing_timer):
		if healing_timer.timeout.is_connected(_on_healing_timer_timeout):
			healing_timer.timeout.disconnect(_on_healing_timer_timeout)
	
	if is_instance_valid(hurtbox):
		hurtbox.teardown()
	
	if not Engine.is_editor_hint():
		ServiceLocator.targeting_system.unregister(self, Identifiers.Groups.PLAYER)

	super.teardown()
	entity_data = null


# --- Override Virtual Handlers ---
func _on_entity_died() -> void:
	_die()

func _on_health_changed(current: int, max_val: int) -> void:
	var ev = PlayerHealthChangedEvent.new()
	ev.current_health = current
	ev.max_health = max_val
	_services.event_bus.emit(EventCatalog.PLAYER_HEALTH_CHANGED, ev)
	health_changed.emit(current, max_val)


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
	
	# SRP Fix: Delegate death visuals to VisualComponent
	var vc: VisualComponent = get_component(VisualComponent)
	if is_instance_valid(vc):
		var tween: Tween = vc.play_death_sequence()
		if is_instance_valid(tween):
			await tween.finished

	died.emit()


func _update_timers(delta: float) -> void:
	if not is_instance_valid(entity_data):
		return
	
	entity_data.physics.knockback_timer = max(0.0, entity_data.physics.knockback_timer - delta)
	
	# NOTE: Charge timer logic was removed from here. 
	# It is now handled exclusively by ChargeAttackComponent.


# --- Signal Handlers ---

func _on_healing_timer_timeout() -> void:
	var sm: BaseStateMachine = get_component(BaseStateMachine)
	if sm.current_state == sm.states[Identifiers.PlayerStates.HEAL]:
		entity_data.health += 1
		get_component(PlayerResourceComponent).consume_healing_charge()
		_on_health_changed(entity_data.health, entity_data.max_health)
		
		# DIP Fix: Load splash from config
		var splash_scene = entity_data.config.vfx_heal_splash
		if is_instance_valid(splash_scene):
			var splash = splash_scene.instantiate()
			splash.global_position = global_position
			splash.emitting = true
			get_tree().current_scene.add_child(splash)
			
		sm.change_state(Identifiers.PlayerStates.MOVE)


func _on_pogo_bounce_requested() -> void:
	var physics = get_component(PlayerPhysicsComponent)
	if physics:
		physics.perform_pogo_bounce()
	
	entity_data.physics.can_dash = true
	entity_data.physics.air_jumps_left = entity_data.config.max_air_jumps
	get_component(BaseStateMachine).change_state(Identifiers.PlayerStates.FALL)


func _cancel_heal() -> void:
	if healing_timer.is_stopped():
		return
	healing_timer.stop()
