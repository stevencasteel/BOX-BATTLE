# src/ui/components/control_setting_row/control_setting_row.gd
@tool
## A UI component representing a single remappable action.
## Handles listening for input and updating the Settings singleton.
class_name ControlSettingRow
extends HBoxContainer

# --- Node References ---
@onready var action_label: Label = %ActionLabel
@onready var rebind_button: Button = %RebindButton

# --- Private Variables ---
var _action_name: String = ""
var _is_listening: bool = false

# --- Godot Lifecycle ---

func _ready() -> void:
	# Ensure visual state matches current settings on load
	if not _action_name.is_empty():
		_update_display()
	
	if not Engine.is_editor_hint():
		rebind_button.mouse_entered.connect(_on_hover_started)
		rebind_button.mouse_exited.connect(_on_hover_ended)

func _input(event: InputEvent) -> void:
	if not _is_listening:
		return
		
	# Filter out non-input events (like mouse movement)
	if event is InputEventMouseMotion:
		return

	# Allow canceling with Escape (if it's not the key being bound)
	if event.is_action_pressed("ui_cancel"):
		_is_listening = false
		_update_display()
		get_viewport().set_input_as_handled()
		return

	# Accept Key or Mouse Button
	if event is InputEventKey or event is InputEventMouseButton:
		if event.is_pressed():
			_apply_rebind(event)
			get_viewport().set_input_as_handled()


# --- Public API ---

func setup(action: String, display_name: String) -> void:
	_action_name = action
	if is_instance_valid(action_label):
		action_label.text = display_name
	_update_display()


# --- Private Logic ---

func _update_display() -> void:
	if not is_instance_valid(rebind_button):
		return
		
	if _is_listening:
		rebind_button.text = "Press any key..."
	else:
		rebind_button.text = Settings.get_input_label(_action_name)


func _apply_rebind(event: InputEvent) -> void:
	Settings.remap_action(_action_name, event)
	_is_listening = false
	_update_display()


# --- Signal Handlers ---

func _on_rebind_button_pressed() -> void:
	AudioManager.play_sfx(AssetPaths.SFX_UI_SELECT)
	_is_listening = true
	_update_display()


func _on_hover_started() -> void:
	CursorManager.set_pointer_state(true)
	AudioManager.play_sfx(AssetPaths.SFX_UI_MOVE)


func _on_hover_ended() -> void:
	CursorManager.set_pointer_state(false)
