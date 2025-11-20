# src/api/interfaces/IInputProvider.gd
## The interface contract for checking input state.
## Allows swapping the real Input singleton for a mock during testing.
class_name IInputProvider
extends RefCounted

func get_axis(_negative_action: StringName, _positive_action: StringName) -> float:
	return 0.0

func is_action_pressed(_action: StringName) -> bool:
	return false

func is_action_just_pressed(_action: StringName) -> bool:
	return false

func is_action_just_released(_action: StringName) -> bool:
	return false
