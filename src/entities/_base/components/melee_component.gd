# src/entities/components/melee_component.gd
@tool
## A generic, data-driven component for executing melee attacks.
##
## This component manages a hitbox Area2D and orchestrates the telegraph,
## attack duration, and damage application based on a provided MeleeAttackData resource.
class_name MeleeComponent
extends IComponent

# --- Signals ---
## Emitted when the attack successfully hits a valid target.
signal hit_confirmed
## Emitted when the full attack sequence (telegraph + duration) is complete.
signal attack_finished

# --- Constants ---
const DEFAULT_TELEGRAPH_SCENE = preload(AssetPaths.SCENE_TELEGRAPH_COMPONENT)

# --- Node References ---
@onready var hitbox: Area2D = $Hitbox
@onready var collision_shape: CollisionShape2D = $Hitbox/CollisionShape2D

# --- Private Member Variables ---
var _owner: BaseEntity
var _combat_utils: Node
var _fx_manager: IFXManager
var _current_attack_data: MeleeAttackData
var _hit_targets_this_swing: Dictionary = {}
var _is_attacking: bool = false

# --- IComponent Contract ---
func setup(p_owner: Node, p_dependencies: Dictionary = {}) -> void:
	self._owner = p_owner as BaseEntity
	self._combat_utils = p_dependencies.get("combat_utils")
	self._fx_manager = p_dependencies.get("fx_manager")
	
	assert(is_instance_valid(_owner), "MeleeComponent must be owned by a BaseEntity.")
	assert(is_instance_valid(_combat_utils), "MeleeComponent requires 'combat_utils'.")
	assert(is_instance_valid(_fx_manager), "MeleeComponent requires 'fx_manager'.")
	
	hitbox.body_entered.connect(_on_hitbox_body_entered)
	hitbox.area_entered.connect(_on_hitbox_area_entered)


func teardown() -> void:
	if is_instance_valid(hitbox):
		if hitbox.body_entered.is_connected(_on_hitbox_body_entered):
			hitbox.body_entered.disconnect(_on_hitbox_body_entered)
		if hitbox.area_entered.is_connected(_on_hitbox_area_entered):
			hitbox.area_entered.disconnect(_on_hitbox_area_entered)
	_owner = null
	_combat_utils = null
	_fx_manager = null


# --- Public API ---
## The main entry point to start a melee attack sequence.
func perform_attack(attack_data: MeleeAttackData) -> void:
	if _is_attacking or not is_instance_valid(attack_data):
		return

	_is_attacking = true
	_current_attack_data = attack_data
	_hit_targets_this_swing.clear()
	
	_execute_attack_sequence()


# --- Private Logic ---
func _execute_attack_sequence() -> void:
	var facing_direction = _owner.entity_data.facing_direction if "facing_direction" in _owner.entity_data else 1.0
	
	# --- 1. Telegraph Phase ---
	if _current_attack_data.telegraph_duration > 0.0:
		# OCP: Use the scene defined in data, fallback to default if null.
		var scene_to_instantiate = _current_attack_data.telegraph_scene
		if not scene_to_instantiate:
			scene_to_instantiate = DEFAULT_TELEGRAPH_SCENE
			
		var telegraph = scene_to_instantiate.instantiate()
		_owner.add_child(telegraph)
		
		var telegraph_size = _current_attack_data.shape.get_rect().size
		var telegraph_offset = _current_attack_data.offset
		var telegraph_position = _owner.global_position + (telegraph_offset * Vector2(facing_direction, 1.0))
		
		# Duck-typing check to ensure the custom scene supports the API
		if telegraph.has_method("start_telegraph"):
			telegraph.start_telegraph(
				_current_attack_data.telegraph_duration,
				telegraph_size,
				telegraph_position,
				Palette.COLOR_UI_PANEL_BG
			)
			# Robust wait: Prevents soft-lock if telegraph is destroyed mid-wait
			await _wait_for_telegraph_safe(telegraph)
		else:
			push_warning("Telegraph scene '%s' does not implement 'start_telegraph'. Skipping wait." % telegraph.name)
			telegraph.queue_free()
		
		# GUARD CLAUSE: Check if we are still valid after the wait
		if not is_instance_valid(self) or not is_instance_valid(_owner) or not is_instance_valid(collision_shape):
			return

	# --- 2. Attack Phase ---
	collision_shape.shape = _current_attack_data.shape
	hitbox.position = _current_attack_data.offset * Vector2(facing_direction, 1.0)
	
	hitbox.monitoring = true
	# Use the new dedicated hitbox layer.
	hitbox.collision_layer = PhysicsLayers.HITBOX
	
	if _owner.is_in_group(Identifiers.Groups.PLAYER):
		hitbox.collision_mask = PhysicsLayers.ENEMY | PhysicsLayers.ENEMY_PROJECTILE
	else:
		hitbox.collision_mask = PhysicsLayers.PLAYER_HURTBOX
	
	collision_shape.disabled = false
	
	await get_tree().create_timer(_current_attack_data.duration).timeout
	
	# GUARD CLAUSE: Check if we are still valid after the wait
	if not is_instance_valid(self) or not is_instance_valid(hitbox) or not is_instance_valid(collision_shape):
		return
		
	# --- 3. Cleanup ---
	collision_shape.disabled = true
	hitbox.monitoring = false
	hitbox.collision_layer = 0
	hitbox.collision_mask = 0
	
	_is_attacking = false
	attack_finished.emit()


## A robust waiter that returns if the telegraph finishes OR if it is destroyed.
func _wait_for_telegraph_safe(telegraph: Node) -> void:
	if not is_instance_valid(telegraph):
		return
		
	# Use a Dictionary (reference type) so the lambda updates the shared state
	var signal_state = { "received": false }
	var on_finish = func(): signal_state["received"] = true
	
	if telegraph.has_signal("telegraph_finished"):
		telegraph.connect("telegraph_finished", on_finish, CONNECT_ONE_SHOT)
	if telegraph.has_signal("tree_exiting"):
		telegraph.connect("tree_exiting", on_finish, CONNECT_ONE_SHOT)
	
	# Wait loop: continues until signal emits OR node becomes invalid
	while is_instance_valid(telegraph) and not signal_state["received"]:
		await get_tree().process_frame
		
	# Cleanup connections if node still exists
	if is_instance_valid(telegraph):
		if telegraph.is_connected("telegraph_finished", on_finish):
			telegraph.disconnect("telegraph_finished", on_finish)
		if telegraph.is_connected("tree_exiting", on_finish):
			telegraph.disconnect("tree_exiting", on_finish)


func _process_hit(collider: Node) -> void:
	var target_id = collider.get_instance_id()
	if _hit_targets_this_swing.has(target_id):
		return

	_hit_targets_this_swing[target_id] = true
	
	var damageable: IDamageable = _combat_utils.find_damageable(collider)
	if is_instance_valid(damageable):
		var impact_normal = (collider.global_position - _owner.global_position).normalized()
		
		# DRY: Use factory method
		var damage_info = _combat_utils.create_damage_info(
			_current_attack_data.damage_amount,
			_owner,
			collider.global_position,
			impact_normal
		)
		
		var result := damageable.apply_damage(damage_info)
		if result.was_damaged:
			if is_instance_valid(_current_attack_data.hit_spark_effect):
				_fx_manager.play_vfx(
					_current_attack_data.hit_spark_effect,
					damage_info.impact_position,
					damage_info.impact_normal
				)
			
			if _current_attack_data.hit_stop_duration > 0.0:
				_fx_manager.request_hit_stop(_current_attack_data.hit_stop_duration)
			
			hit_confirmed.emit()


# --- Signal Handlers ---
func _on_hitbox_body_entered(body: Node) -> void:
	_process_hit(body)


func _on_hitbox_area_entered(area: Area2D) -> void:
	_process_hit(area)
