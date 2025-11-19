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
var _services: ServiceLocator

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
	self._services = p_dependencies.get("services")
	
	# Inject Hitboxes
	_melee_hitbox = p_dependencies.get("melee_hitbox")
	
	if is_instance_valid(_melee_hitbox):
		if not _melee_hitbox.hit_detected.is_connected(_on_melee_hit_detected):
			_melee_hitbox.hit_detected.connect(_on_melee_hit_detected)

	assert(is_instance_valid(_object_pool), "CombatComponent requires an IObjectPool.")
	assert(is_instance_valid(_fx_manager), "CombatComponent requires an IFXManager.")


func teardown() -> void:
	set_physics_process(false)
	if is_instance_valid(_melee_hitbox) and _melee_hitbox.hit_detected.is_connected(_on_melee_hit_detected):
		_melee_hitbox.hit_detected.disconnect(_on_melee_hit_detected)

	owner_node = null
	p_data = null
	_object_pool = null
	_fx_manager = null
	_combat_utils = null
	_services = null
	_melee_hitbox = null


## Fires a player projectile from the object pool.
func fire_shot() -> void:
	p_data.combat.attack_cooldown_timer = p_data.config.attack_cooldown

	var shot = _object_pool.get_instance(Identifiers.Pools.PLAYER_SHOTS)
	if not shot:
		return

	var shot_dir = Vector2(p_data.physics.facing_direction, 0)
	# We assume InputComponent is updating the buffer elsewhere
	if Input.is_action_pressed("ui_up"):
		shot_dir = Vector2.UP
	elif Input.is_action_pressed("ui_down"):
		shot_dir = Vector2.DOWN

	shot.direction = shot_dir
	shot.global_position = owner_node.global_position + (shot_dir * 60)
	
	var dependencies = {
		"object_pool": _object_pool,
		"combat_utils": _combat_utils
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
			if is_close_range:
				_fx_manager.request_hit_stop(
					p_data.world_config.hit_stop_player_melee_close
				)
