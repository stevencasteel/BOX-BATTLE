# src/core/systems/save_manager.gd
## An autoloaded singleton responsible for serializing game progression.
## Manages multiple save slots (0, 1, 2).
extends Node

signal current_save_updated

const MAX_SLOTS = 3
const SAVE_FILE_TEMPLATE = "user://save_slot_%02d.tres"

var current_slot_index: int = -1
var current_save: SaveData = null

func _ready() -> void:
	pass

# --- Slot Management API ---

func get_slot_path(index: int) -> String:
	return SAVE_FILE_TEMPLATE % index

func slot_exists(index: int) -> bool:
	return FileAccess.file_exists(get_slot_path(index))

func get_slot_summary(index: int) -> Dictionary:
	if not slot_exists(index):
		return {"empty": true}
	
	# Force ignore cache to ensure we see disk changes immediately (e.g. after copy/erase)
	var data = ResourceLoader.load(get_slot_path(index), "", ResourceLoader.CACHE_MODE_IGNORE) as SaveData
	if not data:
		return {"empty": true, "corrupt": true}
	
	return {
		"empty": false,
		"wins": data.total_wins,
		"losses": data.total_losses
	}

func load_slot(index: int) -> bool:
	if not slot_exists(index):
		return false
	
	var data = ResourceLoader.load(get_slot_path(index), "", ResourceLoader.CACHE_MODE_IGNORE) as SaveData
	if data:
		current_slot_index = index
		current_save = data
		current_save_updated.emit()
		return true
	return false

func create_new_slot(index: int) -> void:
	var new_data = SaveData.new()
	# Initialize defaults here if needed
	current_slot_index = index
	current_save = new_data
	_save_to_disk()
	current_save_updated.emit()

func erase_slot(index: int) -> void:
	if slot_exists(index):
		DirAccess.remove_absolute(get_slot_path(index))
	
	if current_slot_index == index:
		current_save = null
		current_slot_index = -1

func copy_slot(from_index: int, to_index: int) -> bool:
	if not slot_exists(from_index):
		push_error("SaveManager: Source slot %d does not exist." % from_index)
		return false
	
	var source_data = ResourceLoader.load(get_slot_path(from_index), "", ResourceLoader.CACHE_MODE_IGNORE) as SaveData
	if not source_data:
		push_error("SaveManager: Failed to load source slot %d." % from_index)
		return false
		
	# Duplicate with sub-resources (true) to ensure independence
	var new_data = source_data.duplicate(true)
	
	# Critical: Tell the resource it belongs to the new path
	var dest_path = get_slot_path(to_index)
	new_data.take_over_path(dest_path)
	
	var err = ResourceSaver.save(new_data, dest_path)
	if err != OK:
		push_error("SaveManager: Failed to save copy to %s (Error %d)" % [dest_path, err])
		return false
		
	return true

# --- Runtime API ---

func record_win() -> void:
	if not current_save: return
	current_save.total_wins += 1
	_save_to_disk()

func record_loss() -> void:
	if not current_save: return
	current_save.total_losses += 1
	_save_to_disk()

func _save_to_disk() -> void:
	if current_save and current_slot_index >= 0:
		ResourceSaver.save(current_save, get_slot_path(current_slot_index))
