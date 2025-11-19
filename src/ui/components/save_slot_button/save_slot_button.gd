# src/ui/components/save_slot_button/save_slot_button.gd
@tool
class_name SaveSlotButton
extends Control

# Emitted for generic UI feedback (Sound) - 0 arguments
signal pressed
# Emitted for logic - 1 argument
signal slot_chosen(slot_index)

@export var slot_index: int = 0

@onready var slot_label: Label = %SlotLabel
@onready var info_label: Label = %InfoLabel

var is_hovered: bool = false
var is_selected: bool = false
var _data_summary: Dictionary = {}

func _ready() -> void:
	focus_mode = FOCUS_ALL
	mouse_filter = MOUSE_FILTER_STOP
	
	mouse_entered.connect(_on_mouse_entered)
	mouse_exited.connect(_on_mouse_exited)
	focus_entered.connect(_on_focus_entered)
	focus_exited.connect(_on_focus_exited)
	
	refresh()

func refresh() -> void:
	if not is_instance_valid(slot_label): return
	
	slot_label.text = "SLOT %d" % (slot_index + 1)
	
	if Engine.is_editor_hint():
		return
		
	_data_summary = SaveManager.get_slot_summary(slot_index)
	if _data_summary.get("empty"):
		info_label.text = "NEW GAME"
		info_label.modulate = Palette.COLOR_TEXT_DISABLED
	else:
		info_label.text = "WINS: %d  |  LOSSES: %d" % [_data_summary.wins, _data_summary.losses]
		info_label.modulate = Palette.COLOR_TEXT_PRIMARY
	
	queue_redraw()

func _gui_input(event: InputEvent) -> void:
	if event.is_action_pressed("ui_accept") and has_focus():
		get_viewport().set_input_as_handled()
		_trigger_press()
		return

	if event is InputEventMouseButton and event.button_index == MOUSE_BUTTON_LEFT and event.is_pressed():
		_trigger_press()

func _trigger_press() -> void:
	pressed.emit()
	slot_chosen.emit(slot_index)

func _draw() -> void:
	var bg_color = Palette.COLOR_UI_PANEL_BG
	var border_color = Palette.COLOR_UI_ACCENT_PRIMARY
	var border_width = 3.0

	if is_hovered or is_selected or has_focus():
		bg_color = Palette.COLOR_UI_ACCENT_PRIMARY
		border_color = Palette.get_color(4)
		info_label.modulate = Palette.COLOR_BACKGROUND
		slot_label.modulate = Palette.COLOR_BACKGROUND
		
		var glow_rect = Rect2(Vector2.ZERO, size).grow(10)
		draw_rect(glow_rect, Color(Palette.COLOR_UI_GLOW.r, Palette.COLOR_UI_GLOW.g, Palette.COLOR_UI_GLOW.b, 0.2))
	else:
		slot_label.modulate = Palette.COLOR_TEXT_PRIMARY
		if _data_summary.get("empty", true):
			info_label.modulate = Palette.COLOR_TEXT_DISABLED
		else:
			info_label.modulate = Palette.COLOR_TEXT_PRIMARY

	draw_rect(Rect2(Vector2.ZERO, size), bg_color)
	draw_rect(Rect2(Vector2.ZERO, size), border_color, false, border_width)

func _on_mouse_entered() -> void:
	is_hovered = true
	grab_focus()
	CursorManager.set_pointer_state(true)
	AudioManager.play_sfx(AssetPaths.SFX_UI_MOVE)
	queue_redraw()

func _on_mouse_exited() -> void:
	is_hovered = false
	CursorManager.set_pointer_state(false)
	queue_redraw()

func _on_focus_entered() -> void:
	queue_redraw()

func _on_focus_exited() -> void:
	queue_redraw()
