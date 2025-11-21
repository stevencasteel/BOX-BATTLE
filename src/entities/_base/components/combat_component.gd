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

# --- Hitbox & Muzzle References ---
var _melee_hitbox: HitboxComponent
var _up_hitbox: HitboxComponent
var _muzzles: Dictionary = {}

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
	
	# Inject Hitboxes & Muzzles
	_melee_hitbox = p_dependencies.get("melee_hitbox")
	_up_hitbox = p_dependencies.get("up_hitbox")
	if p_dependencies.has("muzzles"):
		_muzzles = p_dependencies["muzzles"]
	
	if is_instance_valid(_melee_hitbox):
		if not _melee_hitbox.hit_detected.is_connected(_on_melee_hit_detected):
			_melee_hitbox.hit_detected.connect(_on_melee_hit_detected)
			
	if is_instance_valid(_up_hitbox):
		if not _up_hitbox.hit_detected.is_connected(_on_melee_hit_detected):
			_up_hitbox.hit_detected.connect(_on_melee_hit_detected)

	assert(is_instance_valid(_object_pool), "CombatComponent requires 'object_pool'.")
	assert(is_instance_valid(_fx_manager), "CombatComponent requires 'fx_manager'.")
	assert(is_instance_valid(_combat_utils), "CombatComponent requires 'combat_utils'.")


func teardown() -> void:
	set_physics_process(false)
	if is_instance_valid(_melee_hitbox) and _melee_hitbox.hit_detected.is_connected(_on_melee_hit_detected):
		_melee_hitbox.hit_detected.disconnect(_on_melee_hit_detected)
	
	if is_instance_valid(_up_hitbox) and _up_hitbox.hit_detected.is_connected(_on_melee_hit_detected):
		_up_hitbox.hit_detected.disconnect(_on_melee_hit_detected)

	owner_node = null
	p_data = null
	_object_pool = null
	_fx_manager = null
	_combat_utils = null
	_melee_hitbox = null
	_up_hitbox = null
	_muzzles.clear()


## Fires a player projectile from the object pool.
func fire_shot(is_max_charge: bool = false) -> void:
	p_data.combat.attack_cooldown_timer = p_data.config.attack_cooldown

	var shot = _object_pool.get_instance(Identifiers.Pools.PLAYER_SHOTS)
	if not shot:
		return

	# --- Diagonal Input Logic (via InputComponent) ---
	var input_comp: InputComponent = owner_node.get_component(InputComponent)
	var dir = Vector2.ZERO
	
	if is_instance_valid(input_comp):
		if input_comp.input.up:
			dir.y = -1.0
		elif input_comp.input.down:
			dir.y = 1.0
			
		if not is_zero_approx(input_comp.input.move_axis):
			dir.x = sign(input_comp.input.move_axis)
	else:
		if Input.is_action_pressed("ui_up"): dir.y = -1.0
		elif Input.is_action_pressed("ui_down"): dir.y = 1.0
		if Input.is_action_pressed("ui_right"): dir.x = 1.0
		elif Input.is_action_pressed("ui_left"): dir.x = -1.0
	
	# Fallback: Use facing direction if no input
	if dir == Vector2.ZERO:
		dir.x = p_data.physics.facing_direction
	
	var shot_dir = dir.normalized()
	shot.direction = shot_dir
	
	# --- WYSIWYG Muzzle Logic ---
	# Determine which marker to use as the origin
	var spawn_pos = owner_node.global_position # Default fallback
	
	# Logic: 
	# 1. If aiming UP (purely), use MuzzleUp.
	# 2. If aiming DOWN (purely), use MuzzleDown.
	# 3. Else (Forward or Diagonal), use MuzzleForward.
	
	if dir.x == 0 and dir.y < 0 and _muzzles.has("up") and is_instance_valid(_muzzles.up):
		spawn_pos = _muzzles.up.global_position
	elif dir.x == 0 and dir.y > 0 and _muzzles.has("down") and is_instance_valid(_muzzles.down):
		spawn_pos = _muzzles.down.global_position
	elif _muzzles.has("forward") and is_instance_valid(_muzzles.forward):
		spawn_pos = _muzzles.forward.global_position

	shot.global_position = spawn_pos
	
	var final_damage = 1
	var final_scale = Vector2.ONE
	
	if is_max_charge:
		final_damage = p_data.config.level_2_damage
		final_scale = Vector2(2.0, 2.0) 
	
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
	
	if target.is_in_group(Identifiers.Groups.ENEMY_PROJECTILE):
		if target.has_method("destroy_with_impact"):
			target.destroy_with_impact()
		else:
			if is_instance_valid(_object_pool):
				_object_pool.return_instance.call_deferred(target)
			else:
				target.queue_free()
			
		_spawn_player_spark(target.global_position)
		damage_dealt.emit()
		return

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
			_spawn_player_spark(target.global_position)
			
			if is_close_range:
				_fx_manager.request_hit_stop(
					p_data.world_config.hit_stop_player_melee_close
				)


func _spawn_player_spark(pos: Vector2) -> void:
	if not is_instance_valid(_fx_manager) or not p_data.config.hit_spark_effect:
		return
	_fx_manager.play_vfx(p_data.config.hit_spark_effect, pos, Vector2.UP)
