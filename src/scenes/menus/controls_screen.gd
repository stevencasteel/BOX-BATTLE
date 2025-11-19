# src/scenes/menus/controls_screen.gd
## The controller for the controls configuration screen.
## Dynamically populates the list based on Settings.remappable_actions.
@tool
extends "res://src/scenes/menus/base_menu_screen.gd"

# --- Constants ---
const ROW_SCENE = preload("res://src/ui/components/control_setting_row/control_setting_row.tscn")

# --- Node References ---
@onready var back_button: StyledMenuItem = %BackButton
@onready var controls_vbox: VBoxContainer = %ControlsVBox
@onready var preset_button: Button = %PresetButton

# --- Godot Lifecycle Methods ---
func _ready() -> void:
	back_button.text = "BACK"

	if not Engine.is_editor_hint():
		_update_preset_display()
		_populate_controls_list()
		
		# --- Connect Unique Action Signals ---
		back_button.pressed.connect(_on_back_button_pressed)
		
		# Connect Preset Button Hover (Cursor Logic)
		preset_button.mouse_entered.connect(CursorManager.set_pointer_state.bind(true))
		preset_button.mouse_exited.connect(CursorManager.set_pointer_state.bind(false))
		
		# Listen for settings changes to update UI
		Settings.input_settings_changed.connect(_on_settings_changed)

		setup_menu_navigation([back_button], [back_button, preset_button])

		await get_tree().process_frame
		back_button.grab_focus()

func _exit_tree() -> void:
	if not Engine.is_editor_hint():
		if Settings.input_settings_changed.is_connected(_on_settings_changed):
			Settings.input_settings_changed.disconnect(_on_settings_changed)
		
		# Disconnect signals to be safe (though not strictly necessary on exit)
		if is_instance_valid(preset_button):
			if preset_button.mouse_entered.is_connected(CursorManager.set_pointer_state):
				preset_button.mouse_entered.disconnect(CursorManager.set_pointer_state)
			if preset_button.mouse_exited.is_connected(CursorManager.set_pointer_state):
				preset_button.mouse_exited.disconnect(CursorManager.set_pointer_state)


# --- Private Methods ---

func _populate_controls_list() -> void:
	if not is_instance_valid(controls_vbox):
		return

	# Clear existing rows
	for child in controls_vbox.get_children():
		child.queue_free()
	
	# Generate rows from Settings
	for action in Settings.remappable_actions:
		var row = ROW_SCENE.instantiate()
		controls_vbox.add_child(row)
		
		var display_name = _get_friendly_name(action)
		row.setup(action, display_name)


func _get_friendly_name(action: String) -> String:
	var clean = action.replace("ui_", "").replace("debug_", "")
	return clean.capitalize()


func _update_preset_display() -> void:
	if is_instance_valid(preset_button):
		preset_button.text = Settings.current_input_preset


# --- Signal Handlers ---

func _on_settings_changed() -> void:
	_update_preset_display()
	# Re-populate to show new keys
	_populate_controls_list()


func _on_back_button_pressed() -> void:
	AudioManager.play_sfx(AssetPaths.SFX_UI_BACK)
	SceneManager.go_to_scene(AssetPaths.SCENE_OPTIONS_SCREEN)


func _on_preset_button_pressed() -> void:
	var presets = Settings.get_available_presets()
	var current = Settings.current_input_preset
	var idx = presets.find(current)
	
	# Cycle to next preset
	var next_idx = (idx + 1) % presets.size()
	var next_preset = presets[next_idx]
	
	# Skip "Custom" in the cycle if we are manually cycling
	if next_preset == "Custom":
		next_idx = (next_idx + 1) % presets.size()
		next_preset = presets[next_idx]
		
	Settings.apply_preset(next_preset)
	AudioManager.play_sfx(AssetPaths.SFX_UI_SELECT)
