# src/entities/components/combat_component.gd
@tool
## Centralizes player offensive logic (Melee & Projectiles), excluding Pogo.
class_name CombatComponent
extends IComponent

# --- Signals ---
signal damage_dealt

# --- Member Variables ---
var owner_node: CharacterBody2D
var p_data: PlayerStateData
var _object_pool: IObjectPool
var _fx_manager: IFXManager
var _combat_utils: Node

# --- Hitbox References ---
var _melee_hitbox: HitboxComponent

# --- Godot Lifecycle Methods ---

func _ready() -> void:
	process_priority = 0

func _physics_process(delta: float) -> void:
	if not is_instance_valid(owner_node):
		return
	_update_timers(delta)

# --- Public Methods ---
func setup(p_owner: Node, p_dependencies: Dictionary = {}) -> void:
	self.owner_node = p_owner as CharacterBody2D
	self.p_data = p_dependencies.get("data_resource")
	
	self._object_pool = p_dependencies.get("object_pool")
	self._fx_manager = p_dependencies.get("fx_manager")
	self._combat_utils = p_dependencies.get("combat_utils")
	
	# Inject Hitboxes
	_melee_hitbox = p_dependencies.get("melee_hitbox")
	
	if is_instance_valid(_melee_hitbox):
		if not _melee_hitbox.hit_detected.is_connected(_on_melee_hit_detected):
			_melee_hitbox.hit_detected.connect(_on_melee_hit_detected)

	assert(is_instance_valid(_object_pool), "CombatComponent requires 'object_pool'.")
	assert(is_instance_valid(_fx_manager), "CombatComponent requires 'fx_manager'.")
	assert(is_instance_valid(_combat_utils), "CombatComponent requires 'combat_utils'.")


func teardown() -> void:
	set_physics_process(false)
	if is_instance_valid(_melee_hitbox) and _melee_hitbox.hit_detected.is_connected(_on_melee_hit_detected):
		_melee_hitbox.hit_detected.disconnect(_on_melee_hit_detected)

	owner_node = null
	p_data = null
	_object_pool = null
	_fx_manager = null
	_combat_utils = null
	_melee_hitbox = null


## Fires a player projectile from the object pool.
func fire_shot(is_max_charge: bool = false) -> void:
	p_data.combat.attack_cooldown_timer = p_data.config.attack_cooldown

	var shot = _object_pool.get_instance(Identifiers.Pools.PLAYER_SHOTS)
	if not shot:
		return

	# --- Diagonal Input Logic ---
	var dir = Vector2.ZERO
	
	if Input.is_action_pressed("ui_up"): 
		dir.y = -1.0
	elif Input.is_action_pressed("ui_down"): 
		dir.y = 1.0
		
	if Input.is_action_pressed("ui_left"): 
		dir.x = -1.0
	elif Input.is_action_pressed("ui_right"): 
		dir.x = 1.0
	
	# Fallback: Use facing direction if no input
	if dir == Vector2.ZERO:
		dir.x = p_data.physics.facing_direction
	
	var shot_dir = dir.normalized()

	shot.direction = shot_dir
	shot.global_position = owner_node.global_position + (shot_dir * 60)
	
	var final_damage = 1
	var final_scale = Vector2.ONE
	
	if is_max_charge:
		final_damage = p_data.config.level_2_damage
		final_scale = Vector2(2.0, 2.0) # Visual size increase for level 2
	
	var dependencies = {
		"object_pool": _object_pool,
		"combat_utils": _combat_utils,
		"fx_manager": _fx_manager,
		"damage": final_damage,
		"scale": final_scale
	}
	shot.activate(dependencies)


# --- Private Methods ---

func _update_timers(delta: float) -> void:
	if not is_instance_valid(p_data):
		return
	p_data.combat.attack_cooldown_timer = max(0.0, p_data.combat.attack_cooldown_timer - delta)
	p_data.combat.attack_duration_timer = max(0.0, p_data.combat.attack_duration_timer - delta)


# --- Private Signal Handlers ---

func _on_melee_hit_detected(target: Node) -> void:
	var target_id = target.get_instance_id()
	if p_data.combat.hit_targets_this_swing.has(target_id):
		return

	p_data.combat.hit_targets_this_swing[target_id] = true
	
	# --- 1. Projectile Destruction Logic ---
	if target.is_in_group(Identifiers.Groups.ENEMY_PROJECTILE):
		# Trigger the projectile's own impact VFX (Red Splash)
		if target.has_method("destroy_with_impact"):
			target.destroy_with_impact()
		else:
			if is_instance_valid(_object_pool):
				_object_pool.return_instance.call_deferred(target)
			else:
				target.queue_free()
			
		# Spawn Player Hit Spark (Green Splash)
		_spawn_player_spark(target.global_position)
		
		damage_dealt.emit()
		return

	# --- 2. Entity Damage Logic ---
	var damageable = _combat_utils.find_damageable(target)
	if is_instance_valid(damageable):
		var damage_info = DamageInfo.new()
		damage_info.source_node = owner_node
		var distance = owner_node.global_position.distance_to(target.global_position)
		
		var is_close_range = distance <= p_data.config.close_range_threshold
		damage_info.amount = 5 if is_close_range else 1
		damage_info.impact_position = target.global_position
		damage_info.impact_normal = (target.global_position - owner_node.global_position).normalized()

		var damage_result = damageable.apply_damage(damage_info)
		if damage_result.was_damaged:
			damage_dealt.emit()
			
			# NEW: Spawn Player's Spark on successful hit
			_spawn_player_spark(target.global_position)
			
			if is_close_range:
				_fx_manager.request_hit_stop(
					p_data.world_config.hit_stop_player_melee_close
				)


func _spawn_player_spark(pos: Vector2) -> void:
	if not is_instance_valid(_fx_manager) or not p_data.config.hit_spark_effect:
		return
	_fx_manager.play_vfx(p_data.config.hit_spark_effect, pos, Vector2.UP)
