# src/tests/fakes/fake_input_provider.gd
## A test double for IInputProvider.
## Allows unit tests to manually set input state without touching the global Input singleton.
class_name FakeInputProvider
extends IInputProvider

var _pressed_actions: Dictionary = {}
var _just_pressed_actions: Dictionary = {}
var _just_released_actions: Dictionary = {}
var _axes: Dictionary = {}

# --- Setup Methods (Test API) ---

func set_action_pressed(action: StringName, pressed: bool) -> void:
	_pressed_actions[action] = pressed

func set_action_just_pressed(action: StringName, pressed: bool) -> void:
	_just_pressed_actions[action] = pressed
	if pressed:
		_pressed_actions[action] = true

func set_action_just_released(action: StringName, released: bool) -> void:
	_just_released_actions[action] = released
	if released:
		_pressed_actions[action] = false

func set_axis(negative: StringName, positive: StringName, value: float) -> void:
	var key = "%s_%s" % [negative, positive]
	_axes[key] = value

func clear() -> void:
	_pressed_actions.clear()
	_just_pressed_actions.clear()
	_just_released_actions.clear()
	_axes.clear()

# --- Interface Implementation ---

func get_axis(negative_action: StringName, positive_action: StringName) -> float:
	var key = "%s_%s" % [negative_action, positive_action]
	return _axes.get(key, 0.0)

func is_action_pressed(action: StringName) -> bool:
	return _pressed_actions.get(action, false)

func is_action_just_pressed(action: StringName) -> bool:
	return _just_pressed_actions.get(action, false)

func is_action_just_released(action: StringName) -> bool:
	return _just_released_actions.get(action, false)
