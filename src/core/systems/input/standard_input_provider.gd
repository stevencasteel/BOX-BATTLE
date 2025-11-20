# src/core/systems/input/standard_input_provider.gd
## The concrete implementation that wraps Godot's global Input singleton.
class_name StandardInputProvider
extends IInputProvider

func get_axis(negative_action: StringName, positive_action: StringName) -> float:
	return Input.get_axis(negative_action, positive_action)

func is_action_pressed(action: StringName) -> bool:
	return Input.is_action_pressed(action)

func is_action_just_pressed(action: StringName) -> bool:
	return Input.is_action_just_pressed(action)

func is_action_just_released(action: StringName) -> bool:
	return Input.is_action_just_released(action)
