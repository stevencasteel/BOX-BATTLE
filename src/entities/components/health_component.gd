# src/entities/components/health_component.gd
@tool
class_name HealthComponent
extends IDamageable

# --- Signals ---
signal health_changed(current_health: int, max_health: int)
signal died
signal health_threshold_reached(health_percentage: float)
signal took_damage(damage_info: DamageInfo, damage_result: DamageResult)

const InvincibilityEffectScript = preload("res://src/api/status_effects/invincibility_effect.gd")

# --- Member Variables ---
var entity_data: Resource
var owner_node: CharacterBody2D

var _max_health: int
var _invincibility_duration: float
var _knockback_speed: float
var _hazard_knockback_speed: float
var _damage_audio_cue: AudioCue 

var _active_invincibility_map: Dictionary = {} # Map<token_int, StatusEffect>
var _next_token_id: int = 1

var _fx_manager: IFXManager
var _event_bus
var _hit_spark_effect: VFXEffect
var _audio_manager: Node 
var _status_effect_component: StatusEffectComponent # New!

# --- Lifecycle ---
func _notification(what: int) -> void:
	if what == NOTIFICATION_PREDELETE:
		teardown()

# --- Setup ---
func setup(p_owner: Node, p_dependencies: Dictionary = {}) -> void:
	self.owner_node = p_owner as CharacterBody2D
	self.entity_data = p_dependencies.get("data_resource")
	
	self._fx_manager = p_dependencies.get("fx_manager")
	self._event_bus = p_dependencies.get("event_bus")
	self._hit_spark_effect = p_dependencies.get("hit_spark_effect")
	self._status_effect_component = p_dependencies.get("status_effect_component")
	
	if p_dependencies.has("audio_manager"):
		self._audio_manager = p_dependencies.get("audio_manager")
	else:
		self._audio_manager = AudioManager

	var dmg_config = p_dependencies.get("damage_config")

	# Validate critical dependencies
	if not entity_data or not dmg_config or not _fx_manager or not _event_bus:
		push_error("HealthComponent.setup: Missing required dependencies.")
		return
		
	if not _status_effect_component:
		push_warning("HealthComponent: StatusEffectComponent missing. Invincibility will not work.")

	_max_health = entity_data.max_health
	
	_invincibility_duration = dmg_config.invincibility_duration
	_knockback_speed = dmg_config.knockback_speed
	_hazard_knockback_speed = dmg_config.hazard_knockback_speed
	_damage_audio_cue = dmg_config.audio_cue 

	entity_data.health = _max_health
	health_changed.emit(entity_data.health, _max_health)

func teardown() -> void:
	entity_data = null
	owner_node = null
	_fx_manager = null
	_event_bus = null
	_hit_spark_effect = null
	_damage_audio_cue = null
	_audio_manager = null
	_status_effect_component = null
	_active_invincibility_map.clear()

# --- Logic ---
func apply_damage(damage_info: DamageInfo) -> DamageResult:
	var result := DamageResult.new()

	if not is_instance_valid(damage_info):
		return result

	if is_invincible() and not damage_info.bypass_invincibility:
		return result

	var health_before_damage: int = entity_data.health
	entity_data.health -= damage_info.amount
	health_changed.emit(entity_data.health, _max_health)

	# Apply post-hit invincibility via Status System
	if is_instance_valid(_status_effect_component) and _invincibility_duration > 0:
		var effect = InvincibilityEffectScript.new()
		effect.duration = _invincibility_duration
		_status_effect_component.apply_effect(effect)

	result.knockback_velocity = _calculate_knockback(damage_info.source_node)
	_check_for_threshold_crossing(health_before_damage, entity_data.health)

	result.was_damaged = true
	took_damage.emit(damage_info, result)

	if result.was_damaged and is_instance_valid(_fx_manager) and is_instance_valid(_hit_spark_effect):
		_fx_manager.play_vfx(
			_hit_spark_effect, damage_info.impact_position, damage_info.impact_normal
		)
	
	if result.was_damaged and is_instance_valid(_damage_audio_cue) and is_instance_valid(_audio_manager):
		_audio_manager.play_cue(_damage_audio_cue)

	if entity_data.health <= 0:
		died.emit()

	return result

func is_invincible() -> bool:
	if is_instance_valid(_status_effect_component):
		return _status_effect_component.has_tag(&"invincible")
	return false

# Legacy API Wrapper for Compatibility
func grant_invincibility(_requester: Object) -> int:
	if not is_instance_valid(_status_effect_component):
		return -1
		
	var token_id := _next_token_id
	_next_token_id += 1
	
	var effect = InvincibilityEffectScript.new()
	effect.duration = 0.0 # Infinite, manual removal
	_status_effect_component.apply_effect(effect)
	
	_active_invincibility_map[token_id] = effect
	return token_id

func release_invincibility(token: int) -> void:
	if not is_instance_valid(_status_effect_component):
		return
		
	if _active_invincibility_map.has(token):
		var effect = _active_invincibility_map[token]
		_status_effect_component.remove_effect_instance(effect)
		_active_invincibility_map.erase(token)

func _check_for_threshold_crossing(health_before: int, health_after: int) -> void:
	# LSP Fix: Use BaseEntity contract instead of duck typing
	var thresholds: Array[float] = []
	if owner_node is BaseEntity:
		thresholds = (owner_node as BaseEntity).get_health_thresholds()
		
	if thresholds.is_empty():
		return

	var old_percent: float = float(health_before) / _max_health
	var new_percent: float = float(health_after) / _max_health
	for threshold in thresholds:
		if old_percent > threshold and new_percent <= threshold:
			health_threshold_reached.emit(threshold)

func _calculate_knockback(source: Node) -> Vector2:
	if _knockback_speed == 0 or not is_instance_valid(source):
		return Vector2.ZERO
	var knockback_dir: Vector2 = (owner_node.global_position - source.global_position).normalized()
	var speed: float = _knockback_speed
	if source.is_in_group(Identifiers.Groups.HAZARD):
		speed = _hazard_knockback_speed
	return (knockback_dir + Vector2.UP * 0.5).normalized() * speed
