# src/core/systems/save_manager.gd
## An autoloaded singleton responsible for serializing game progression.
##
## It manages the 'user://save_data.tres' file, ensuring stats persist
## between sessions.
extends Node

const SAVE_PATH = "user://save_data.tres"

var current_save: SaveData

func _ready() -> void:
	_load_or_create()

## Loads existing data or creates a fresh save if none exists.
func _load_or_create() -> void:
	if FileAccess.file_exists(SAVE_PATH):
		current_save = load(SAVE_PATH) as SaveData
	
	if not current_save:
		current_save = SaveData.new()
		_save_to_disk()

## Writes the current state to disk.
func _save_to_disk() -> void:
	if current_save:
		ResourceSaver.save(current_save, SAVE_PATH)

# --- Public API ---

func record_win() -> void:
	if not current_save: _load_or_create()
	current_save.total_wins += 1
	_save_to_disk()

func record_loss() -> void:
	if not current_save: _load_or_create()
	current_save.total_losses += 1
	_save_to_disk()
