# src/core/data/config/settings.gd
## An autoloaded singleton that manages persistent game settings.
## Handles Audio levels, Input remapping, and Input Presets.
extends Node

# --- Signals ---
signal audio_settings_changed
signal input_settings_changed

# --- Constants ---
const CONFIG_PATH = "user://options.cfg"

# --- Input Settings ---
var _default_inputs: Dictionary = {}
var remappable_actions: Array = []

# Tracks the active preset name. If the user manually rebinds, this becomes "Custom".
var current_input_preset: String = "Default 1"

# --- Audio Settings ---
@export var master_volume: float = 1.0:
	set(value):
		var clamped = clampf(value, 0.0, 1.0)
		if not is_equal_approx(master_volume, clamped):
			master_volume = clamped
			audio_settings_changed.emit()
			_save_config()

@export var music_volume: float = 1.0:
	set(value):
		var clamped = clampf(value, 0.0, 1.0)
		if not is_equal_approx(music_volume, clamped):
			music_volume = clamped
			audio_settings_changed.emit()
			_save_config()

@export var sfx_volume: float = 1.0:
	set(value):
		var clamped = clampf(value, 0.0, 1.0)
		if not is_equal_approx(sfx_volume, clamped):
			sfx_volume = clamped
			audio_settings_changed.emit()
			_save_config()

@export var master_muted: bool = false:
	set(value):
		if master_muted != value:
			master_muted = value
			audio_settings_changed.emit()
			_save_config()

@export var music_muted: bool = false:
	set(value):
		if music_muted != value:
			music_muted = value
			audio_settings_changed.emit()
			_save_config()

@export var sfx_muted: bool = false:
	set(value):
		if sfx_muted != value:
			sfx_muted = value
			audio_settings_changed.emit()
			_save_config()

# --- Lifecycle ---

func _ready() -> void:
	call_deferred("_initialize")

func _initialize() -> void:
	_define_remappable_actions()
	_capture_default_inputs()
	_load_config()

# --- Input Management ---

func _define_remappable_actions() -> void:
	# Order matters for the UI list
	remappable_actions = [
		Identifiers.Actions.MOVE_UP,
		Identifiers.Actions.MOVE_LEFT,
		Identifiers.Actions.MOVE_DOWN,
		Identifiers.Actions.MOVE_RIGHT,
		Identifiers.Actions.JUMP,
		Identifiers.Actions.ATTACK,
		Identifiers.Actions.DASH
	]

func _capture_default_inputs() -> void:
	for action in remappable_actions:
		_default_inputs[action] = InputMap.action_get_events(action)

func remap_action(action: String, new_event: InputEvent) -> void:
	if not remappable_actions.has(action):
		return
	
	InputMap.action_erase_events(action)
	InputMap.action_add_event(action, new_event)
	
	current_input_preset = "Custom"
	input_settings_changed.emit()
	_save_config()

func get_input_label(action: String) -> String:
	var events = InputMap.action_get_events(action)
	if events.is_empty():
		return "None"
	
	var event = events[0]
	if event is InputEventKey:
		return OS.get_keycode_string(event.physical_keycode)
	elif event is InputEventMouseButton:
		var btn_name = "Mouse " + str(event.button_index)
		if event.button_index == MOUSE_BUTTON_LEFT: btn_name = "L-Click"
		if event.button_index == MOUSE_BUTTON_RIGHT: btn_name = "R-Click"
		if event.button_index == MOUSE_BUTTON_MIDDLE: btn_name = "M-Click"
		return btn_name
	
	return "Unknown"

# --- Presets API ---

func get_available_presets() -> Array[String]:
	return ["Default 1", "Default 2", "Custom"]

func apply_preset(preset_name: String) -> void:
	var map = {}
	
	# Default 1: Arrows/WASD + ZXC
	if preset_name == "Default 1":
		map = {
			Identifiers.Actions.MOVE_UP: [_create_key(KEY_UP), _create_key(KEY_W)],
			Identifiers.Actions.MOVE_LEFT: [_create_key(KEY_LEFT), _create_key(KEY_A)],
			Identifiers.Actions.MOVE_DOWN: [_create_key(KEY_DOWN), _create_key(KEY_S)],
			Identifiers.Actions.MOVE_RIGHT: [_create_key(KEY_RIGHT), _create_key(KEY_D)],
			Identifiers.Actions.JUMP: [_create_key(KEY_X)],
			Identifiers.Actions.ATTACK: [_create_key(KEY_C)],
			Identifiers.Actions.DASH: [_create_key(KEY_Z)]
		}
		
	# Default 2: WASD + .,/
	elif preset_name == "Default 2":
		map = {
			Identifiers.Actions.MOVE_UP: [_create_key(KEY_W)],
			Identifiers.Actions.MOVE_LEFT: [_create_key(KEY_A)],
			Identifiers.Actions.MOVE_DOWN: [_create_key(KEY_S)],
			Identifiers.Actions.MOVE_RIGHT: [_create_key(KEY_D)],
			Identifiers.Actions.JUMP: [_create_key(KEY_PERIOD)],
			Identifiers.Actions.ATTACK: [_create_key(KEY_COMMA)],
			Identifiers.Actions.DASH: [_create_key(KEY_SLASH)]
		}
	
	# Custom: Fully Empty (User must bind)
	elif preset_name == "Custom":
		for action in remappable_actions:
			map[action] = []

	if map.is_empty() and preset_name != "Custom":
		return

	# Apply
	for action in remappable_actions:
		if map.has(action):
			InputMap.action_erase_events(action)
			for event in map[action]:
				InputMap.action_add_event(action, event)
	
	current_input_preset = preset_name
	input_settings_changed.emit()
	_save_config()

# --- Helper Factories ---
func _create_key(keycode: int) -> InputEventKey:
	var ev = InputEventKey.new()
	ev.physical_keycode = keycode
	return ev

# --- Persistence Logic ---

func _save_config() -> void:
	var config = ConfigFile.new()
	
	# Audio
	config.set_value("audio", "master_volume", master_volume)
	config.set_value("audio", "music_volume", music_volume)
	config.set_value("audio", "sfx_volume", sfx_volume)
	config.set_value("audio", "master_muted", master_muted)
	config.set_value("audio", "music_muted", music_muted)
	config.set_value("audio", "sfx_muted", sfx_muted)
	
	# Input Meta
	config.set_value("input", "preset", current_input_preset)
	
	# Input Bindings (Only save if Custom)
	if current_input_preset == "Custom":
		for action in remappable_actions:
			var events = InputMap.action_get_events(action)
			if not events.is_empty():
				config.set_value("input_custom", action, events[0])

	config.save(CONFIG_PATH)

func _load_config() -> void:
	var config = ConfigFile.new()
	var err = config.load(CONFIG_PATH)
	if err != OK:
		apply_preset("Default 1")
		return 

	# Audio
	master_volume = config.get_value("audio", "master_volume", 1.0)
	music_volume = config.get_value("audio", "music_volume", 1.0)
	sfx_volume = config.get_value("audio", "sfx_volume", 1.0)
	master_muted = config.get_value("audio", "master_muted", false)
	music_muted = config.get_value("audio", "music_muted", false)
	sfx_muted = config.get_value("audio", "sfx_muted", false)
	
	# Input
	var saved_preset = config.get_value("input", "preset", "Default 1")
	# Map legacy names to new ones if needed
	if saved_preset == "Default": saved_preset = "Default 1"
	if saved_preset == "Alt": saved_preset = "Default 2"
	
	if saved_preset != "Custom":
		apply_preset(saved_preset)
	else:
		current_input_preset = "Custom"
		# Clear first so we only have loaded bindings
		for action in remappable_actions:
			InputMap.action_erase_events(action)
			
		for action in remappable_actions:
			if config.has_section_key("input_custom", action):
				var saved_event = config.get_value("input_custom", action)
				if saved_event is InputEvent:
					InputMap.action_add_event(action, saved_event)
	
	audio_settings_changed.emit()
	input_settings_changed.emit()
