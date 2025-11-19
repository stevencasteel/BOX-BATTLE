# src/core/data/config/settings.gd
## An autoloaded singleton that manages persistent game settings.
##
## It automatically saves to 'user://options.cfg' whenever a value changes.
extends Node

# --- Signals ---
## Emitted whenever any audio-related setting is changed.
signal audio_settings_changed

# --- Constants ---
const CONFIG_PATH = "user://options.cfg"

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

@export var music_muted: bool = false: # Changed default to false for better UX
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
	_load_config()

# --- Persistence Logic ---

func _save_config() -> void:
	var config = ConfigFile.new()
	config.set_value("audio", "master_volume", master_volume)
	config.set_value("audio", "music_volume", music_volume)
	config.set_value("audio", "sfx_volume", sfx_volume)
	config.set_value("audio", "master_muted", master_muted)
	config.set_value("audio", "music_muted", music_muted)
	config.set_value("audio", "sfx_muted", sfx_muted)
	config.save(CONFIG_PATH)

func _load_config() -> void:
	var config = ConfigFile.new()
	var err = config.load(CONFIG_PATH)
	if err != OK:
		return # Use defaults if file doesn't exist

	# We use internal variables to avoid triggering _save_config() recursively during load
	master_volume = config.get_value("audio", "master_volume", 1.0)
	music_volume = config.get_value("audio", "music_volume", 1.0)
	sfx_volume = config.get_value("audio", "sfx_volume", 1.0)
	master_muted = config.get_value("audio", "master_muted", false)
	music_muted = config.get_value("audio", "music_muted", false)
	sfx_muted = config.get_value("audio", "sfx_muted", false)
	
	# Emit once at the end to sync systems
	audio_settings_changed.emit()
