# src/ui/components/sound_setting_row/sound_setting_row.gd
@tool
## A self-contained UI component for a single audio setting row.
## Manages its own visuals and emits signals when its values are changed by the user.
class_name SoundSettingRow
extends HBoxContainer

# --- Signals ---
signal value_changed(value: float)
signal mute_toggled(is_muted: bool)

# --- Node References ---
@onready var name_label: Label = %NameLabel
@onready var value_slider: TextureRect = %ValueSlider
@onready var value_label: Label = %ValueLabel
@onready var mute_checkbox: TextureButton = %MuteCheckbox

# --- Public Properties ---
@export var setting_name: String = "SETTING":
	set(value):
		setting_name = value
		if is_instance_valid(name_label):
			name_label.text = setting_name

var is_muted: bool = false
var _last_percent_value: int = -1

# --- Godot Lifecycle Methods ---
func _ready() -> void:
	if is_instance_valid(name_label):
		name_label.text = setting_name
	if not Engine.is_editor_hint():
		value_slider.value_changed.connect(_on_slider_value_changed)
		mute_checkbox.pressed.connect(_on_mute_button_pressed)

		mute_checkbox.mouse_entered.connect(CursorManager.set_pointer_state.bind(true))
		mute_checkbox.mouse_exited.connect(CursorManager.set_pointer_state.bind(false))
		mute_checkbox.mouse_entered.connect(func(): AudioManager.play_sfx(AssetPaths.SFX_UI_MOVE))


# --- Public Methods ---
## Sets the visual state of the slider without emitting a signal.
func set_slider_value(value: float) -> void:
	if is_instance_valid(value_slider):
		value_slider.set_value(value)
	
	# Initialize tracking variable
	_last_percent_value = int(value * 100)
	
	if is_instance_valid(value_label):
		value_label.text = str(_last_percent_value)


## Sets the visual state of the checkbox without emitting a signal.
func set_mute_state(p_is_muted: bool) -> void:
	is_muted = p_is_muted
	var new_texture = (
		load(AssetPaths.SPRITE_CHECKBOX_UNCHECKED)
		if not is_muted
		else load(AssetPaths.SPRITE_CHECKBOX_CHECKED)
	)
	if is_instance_valid(mute_checkbox) and mute_checkbox.texture_normal != new_texture:
		mute_checkbox.texture_normal = new_texture


# --- Signal Handlers ---
func _on_slider_value_changed(value: float) -> void:
	var current_percent = int(value * 100)
	
	if is_instance_valid(value_label):
		value_label.text = str(current_percent)
	
	# AUDIO LOGIC (Before Emit)
	if not Engine.is_editor_hint():
		# If initialized and value actually changed
		if _last_percent_value != -1 and current_percent != _last_percent_value:
			# Only play sound on intervals of 5 (0, 5, 10, 15...)
			if current_percent % 5 == 0:
				AudioManager.play_sfx(AssetPaths.SFX_UI_SLIDER_TICK)
		
		# Update local tracker immediately
		_last_percent_value = current_percent

	# EMIT SIGNAL (After Audio)
	value_changed.emit(value)


func _on_mute_button_pressed() -> void:
	is_muted = not is_muted
	set_mute_state(is_muted)
	mute_toggled.emit(is_muted)
