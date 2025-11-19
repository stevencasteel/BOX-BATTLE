# src/scenes/menus/save_select_screen.gd
extends "res://src/scenes/menus/base_menu_screen.gd"

@onready var slots_vbox: VBoxContainer = %SlotsVBox
@onready var back_button: StyledMenuItem = %BackButton
@onready var btn_copy: StyledMenuItem = %BtnCopy
@onready var btn_erase: StyledMenuItem = %BtnErase
@onready var title_label: Label = %TitleLabel
@onready var mode_label: Label = %ModeLabel

# States
enum Mode { NORMAL, COPY_SELECT_SOURCE, COPY_SELECT_DEST, ERASE }
var _current_mode: Mode = Mode.NORMAL
var _copy_source_index: int = -1

func _ready() -> void:
	# Connect Slot Signals
	for child in slots_vbox.get_children():
		if child is SaveSlotButton:
			child.slot_chosen.connect(_on_slot_chosen)

	btn_copy.pressed.connect(_on_copy_mode_pressed)
	btn_erase.pressed.connect(_on_erase_mode_pressed)
	back_button.pressed.connect(_on_back_pressed)
	
	# Setup Nav
	var nav_items: Array[Control] = []
	for child in slots_vbox.get_children():
		nav_items.append(child)
	nav_items.append(btn_copy)
	nav_items.append(btn_erase)
	nav_items.append(back_button)
	
	setup_menu_navigation(nav_items, nav_items)
	
	_set_mode(Mode.NORMAL)
	
	# Focus first slot
	await get_tree().process_frame
	if slots_vbox.get_child_count() > 0:
		slots_vbox.get_child(0).grab_focus()

func _refresh_slots() -> void:
	for child in slots_vbox.get_children():
		if child is SaveSlotButton:
			child.refresh()

func _set_mode(mode: Mode) -> void:
	_current_mode = mode
	
	# FIX: Moved reset logic inside the match block.
	# We do NOT want to reset _copy_source_index when entering COPY_SELECT_DEST.
	
	match _current_mode:
		Mode.NORMAL:
			_copy_source_index = -1
			title_label.text = "SELECT DATA"
			title_label.add_theme_color_override("font_color", Color.WHITE)
			mode_label.text = " "
			btn_copy.text = "COPY"
			btn_erase.text = "ERASE"
		
		Mode.COPY_SELECT_SOURCE:
			_copy_source_index = -1
			title_label.text = "COPY DATA"
			title_label.add_theme_color_override("font_color", Color(0.4, 0.8, 1.0))
			mode_label.text = "Select SOURCE Slot"
			btn_copy.text = "CANCEL"
			btn_erase.text = "ERASE"

		Mode.COPY_SELECT_DEST:
			# Do not reset _copy_source_index here!
			mode_label.text = "Select DESTINATION Slot"
			
		Mode.ERASE:
			_copy_source_index = -1
			title_label.text = "ERASE DATA"
			title_label.add_theme_color_override("font_color", Color(1.0, 0.4, 0.4))
			mode_label.text = "Select Slot to DELETE"
			btn_copy.text = "COPY"
			btn_erase.text = "CANCEL"

func _on_slot_chosen(index: int) -> void:
	# Sound is played by SaveSlotButton 'pressed' signal for generic feedback,
	# but we play specific success/fail sounds here.
	
	match _current_mode:
		Mode.NORMAL:
			# Play
			var summary = SaveManager.get_slot_summary(index)
			if summary.get("empty", true):
				SaveManager.create_new_slot(index)
			else:
				SaveManager.load_slot(index)
			
			AudioManager.play_sfx(AssetPaths.SFX_GAME_START)
			SceneManager.start_game(AssetPaths.ENCOUNTER_00)

		Mode.COPY_SELECT_SOURCE:
			var summary = SaveManager.get_slot_summary(index)
			if summary.get("empty", true):
				# Cannot copy empty slot
				AudioManager.play_sfx(AssetPaths.SFX_UI_ERROR)
				return
			
			_copy_source_index = index
			_set_mode(Mode.COPY_SELECT_DEST) # Update UI text
			AudioManager.play_sfx(AssetPaths.SFX_UI_SELECT)

		Mode.COPY_SELECT_DEST:
			if index == _copy_source_index:
				AudioManager.play_sfx(AssetPaths.SFX_UI_ERROR)
				return
				
			var success = SaveManager.copy_slot(_copy_source_index, index)
			if success:
				AudioManager.play_sfx(AssetPaths.SFX_UI_SELECT)
				_refresh_slots()
				_set_mode(Mode.NORMAL)
			else:
				AudioManager.play_sfx(AssetPaths.SFX_UI_ERROR)

		Mode.ERASE:
			SaveManager.erase_slot(index)
			AudioManager.play_sfx(AssetPaths.SFX_UI_SELECT)
			_refresh_slots()
			_set_mode(Mode.NORMAL)

func _on_copy_mode_pressed() -> void:
	AudioManager.play_sfx(AssetPaths.SFX_UI_SELECT)
	if _current_mode == Mode.COPY_SELECT_SOURCE or _current_mode == Mode.COPY_SELECT_DEST:
		_set_mode(Mode.NORMAL) # Toggle Off
	else:
		_set_mode(Mode.COPY_SELECT_SOURCE)

func _on_erase_mode_pressed() -> void:
	AudioManager.play_sfx(AssetPaths.SFX_UI_SELECT)
	if _current_mode == Mode.ERASE:
		_set_mode(Mode.NORMAL) # Toggle Off
	else:
		_set_mode(Mode.ERASE)

func _on_back_pressed() -> void:
	AudioManager.play_sfx(AssetPaths.SFX_UI_BACK)
	if _current_mode != Mode.NORMAL:
		_set_mode(Mode.NORMAL)
	else:
		SceneManager.go_to_title_screen()
