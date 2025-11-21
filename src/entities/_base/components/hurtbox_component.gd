# src/entities/components/hurtbox_component.gd
@tool
## A component that manages an Area2D to detect incoming damage sources.
##
## It polls for overlapping bodies and areas (Enemies, Hazards, Projectiles)
## and routes damage to the owner's [HealthComponent].
class_name HurtboxComponent
extends Area2D

# --- Dependencies ---
var _health_component: HealthComponent
var _combat_utils: Node # Service
var _object_pool: IObjectPool # Service
var _owner_entity: Node

# --- Configuration ---
# If true, this component will automatically find the HealthComponent on the parent.
@export var auto_wire_health: bool = true
# DEPRECATED: State change is now handled by the Entity listening to HealthComponent.
@export var hurt_response_state: StringName = &""

# --- Godot Lifecycle ---

func _ready() -> void:
	# Ensure we are monitoring to detect overlaps
	monitoring = true
	monitorable = true 

func _physics_process(_delta: float) -> void:
	if not is_instance_valid(_health_component) or _health_component.is_invincible():
		return

	# 1. Check Bodies (Enemies, Hazards)
	for body in get_overlapping_bodies():
		_process_contact(body)

	# 2. Check Areas (Projectiles, Hazards)
	for area in get_overlapping_areas():
		_process_contact(area)


# --- Public Methods (IComponent-like Setup) ---

func setup(p_owner: Node, p_dependencies: Dictionary = {}) -> void:
	_owner_entity = p_owner
	
	if p_dependencies.has("services"):
		var services = p_dependencies["services"]
		_combat_utils = services.combat_utils
		_object_pool = services.object_pool
	else:
		_combat_utils = CombatUtils
		_object_pool = ObjectPoolAdapter

	if auto_wire_health and p_owner.has_method("get_component"):
		_health_component = p_owner.get_component(HealthComponent)


func teardown() -> void:
	set_physics_process(false)
	set_deferred("monitoring", false)
	_owner_entity = null
	_health_component = null
	_combat_utils = null
	_object_pool = null


# --- Private Logic ---

func _process_contact(target: Node) -> void:
	# CRITICAL FIX: Guard against mid-frame teardown.
	if not _combat_utils or not is_instance_valid(_health_component):
		return

	var is_hazard = target.is_in_group(Identifiers.Groups.HAZARD)
	var is_enemy = target.is_in_group(Identifiers.Groups.ENEMY)
	var is_proj = target.is_in_group(Identifiers.Groups.ENEMY_PROJECTILE)

	if not (is_hazard or is_enemy or is_proj):
		return

	var impact_normal = (global_position - target.global_position).normalized()
	
	var damage_info = _combat_utils.create_damage_info(
		1, 
		target,
		global_position,
		impact_normal
	)

	# We apply damage. The HealthComponent will emit 'took_damage',
	# which the Player entity listens to for Knockback and State Change.
	_health_component.apply_damage(damage_info)

	if target.is_in_group(Identifiers.Groups.ENEMY_PROJECTILE):
		# Projectiles should destroy themselves, but as a backup/legacy behavior:
		if is_instance_valid(_object_pool):
			_object_pool.return_instance.call_deferred(target)
