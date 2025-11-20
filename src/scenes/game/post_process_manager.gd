# src/scenes/game/post_process_manager.gd
## Manages the stack of fullscreen shaders (Shockwave, Chromatic, Vignette).
extends Node

# --- Node References ---
@onready var shockwave_rect: ColorRect = %ShockwaveRect
@onready var chromatic_rect: ColorRect = %ChromaticRect
@onready var vignette_rect: ColorRect = %VignetteRect

# --- State ---
var _is_low_health: bool = false
var _player_health_token: int = 0
var _boss_phase_token: int = 0

# --- Lifecycle ---

func _ready() -> void:
	# Load Materials
	shockwave_rect.material = load("res://src/content/materials/shockwave_material.tres").duplicate()
	chromatic_rect.material = load("res://src/content/materials/chromatic_material.tres").duplicate()
	
	if FileAccess.file_exists("res://src/content/materials/vignette_material.tres"):
		vignette_rect.material = load("res://src/content/materials/vignette_material.tres").duplicate()
	else:
		var mat = ShaderMaterial.new()
		mat.shader = load("res://src/content/shaders/fullscreen/vignette.gdshader")
		vignette_rect.material = mat

	# Reset
	vignette_rect.visible = false
	chromatic_rect.material.set_shader_parameter("fx_progress", 0.0)
	shockwave_rect.material.set_shader_parameter("fx_progress", 0.0)
	
	_player_health_token = EventBus.on(EventCatalog.PLAYER_HEALTH_CHANGED, _on_player_health_changed)
	_boss_phase_token = EventBus.on(EventCatalog.BOSS_PHASE_CHANGED, _on_boss_phase_changed)
	
	# Initial check
	await get_tree().process_frame
	_check_low_health_status()

func _exit_tree() -> void:
	EventBus.off(_player_health_token)
	EventBus.off(_boss_phase_token)

# --- Event Handlers ---

func _on_player_health_changed(payload: PlayerHealthChangedEvent) -> void:
	var is_crit = payload.current_health <= 1
	
	if is_crit != _is_low_health:
		_is_low_health = is_crit
		_update_vignette_state()
	
	# FIX: Removed chromatic aberration trigger from here.
	# It will now only happen on Boss Phase Change.

func _on_boss_phase_changed(_payload: BossPhaseChangedEvent) -> void:
	# Trigger heavy glitch on phase change
	_trigger_chromatic_pulse(0.6) 

func _check_low_health_status() -> void:
	if not ServiceLocator.targeting_system: return
	
	var player = ServiceLocator.targeting_system.get_first(Identifiers.Groups.PLAYER)
	if is_instance_valid(player) and player.entity_data:
		var hp = player.entity_data.health
		if hp <= 1:
			_is_low_health = true
			_update_vignette_state()

func _update_vignette_state() -> void:
	if _is_low_health:
		vignette_rect.visible = true
		var mat = vignette_rect.material as ShaderMaterial
		# FIX: Increased intensity to 1.0 (max) for stronger effect
		mat.set_shader_parameter("intensity", 1.0)
	else:
		vignette_rect.visible = false

func _trigger_chromatic_pulse(duration: float = 0.3) -> void:
	var mat = chromatic_rect.material as ShaderMaterial
	var tween = create_tween()
	
	var attack_dur = min(0.05, duration * 0.2)
	var decay_dur = duration - attack_dur
	
	tween.tween_property(mat, "shader_parameter/fx_progress", 1.0, attack_dur).from(0.0).set_ease(Tween.EASE_OUT).set_trans(Tween.TRANS_QUINT)
	tween.tween_property(mat, "shader_parameter/fx_progress", 0.0, decay_dur).set_ease(Tween.EASE_IN_OUT).set_trans(Tween.TRANS_SINE)

# --- Public API for EncounterScene ---
func get_shockwave_rect() -> ColorRect:
	return shockwave_rect
