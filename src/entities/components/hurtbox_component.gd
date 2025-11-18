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
# The state key to switch to when damage is taken. If empty, no state change occurs.
@export var hurt_response_state: StringName = &""

# --- Godot Lifecycle ---

func _ready() -> void:
	# Default collision configuration for a Hurtbox
	# Layer 7 (64) = PlayerHurtbox
	# Mask 3 (4) = Enemy, 4 (8) = Hazard, 5 (16) = EnemyProjectile
	collision_layer = 64
	collision_mask = 28
	
	# Ensure we are monitoring to detect overlaps
	monitoring = true
	monitorable = true # Usually true so enemies can detect "I hit the player"


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

## setup() is called manually by the entity, or we can auto-wire in _ready if simple.
## For consistency with the project architecture, we use the setup pattern.
func setup(p_owner: Node, p_dependencies: Dictionary = {}) -> void:
	_owner_entity = p_owner
	
	# 1. Resolve Services
	if p_dependencies.has("services"):
		var services = p_dependencies["services"]
		_combat_utils = services.combat_utils
		_object_pool = services.object_pool
	else:
		# Fallback to global autoloads if not injected (Safety net)
		_combat_utils = CombatUtils
		# Use Adapter to satisfy type hint
		_object_pool = ObjectPoolAdapter

	# 2. Resolve HealthComponent
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
	# Double check valid targets
	var is_threat = (
		target.is_in_group(Identifiers.Groups.ENEMY) or 
		target.is_in_group(Identifiers.Groups.ENEMY_PROJECTILE) or 
		target.is_in_group(Identifiers.Groups.HAZARD)
	)
	
	if not is_threat:
		return

	# Calculate Impact Data
	var damage_info = DamageInfo.new()
	damage_info.amount = 1 # Default contact damage
	damage_info.source_node = target
	damage_info.impact_position = global_position
	damage_info.impact_normal = (global_position - target.global_position).normalized()

	# Apply Damage
	var result = _health_component.apply_damage(damage_info)

	# CRASH FIX: Check validity again. The entity might have died and torn down 
	# the components during the apply_damage call stack.
	if not is_instance_valid(_health_component) or not _health_component.entity_data:
		return

	# Handle Post-Hit Logic
	if result.was_damaged:
		if _owner_entity is CharacterBody2D:
			_owner_entity.velocity = result.knockback_velocity
		
		var is_alive = _health_component.entity_data.health > 0

		if is_alive and hurt_response_state != &"" and _owner_entity.has_method("get_component"):
			var sm = _owner_entity.get_component(BaseStateMachine)
			if is_instance_valid(sm):
				sm.change_state(hurt_response_state)

	# Cleanup Projectiles
	if target.is_in_group(Identifiers.Groups.ENEMY_PROJECTILE):
		if is_instance_valid(_object_pool):
			_object_pool.return_instance.call_deferred(target)
