# src/tests/unit/test_input_component.gd
extends GutTest

# --- Constants ---
const InputComponent = preload("res://src/entities/_base/components/input_component.gd")
const PlayerStateData = preload("res://src/entities/player/data/player_state_data.gd")
const PlayerConfig = preload("res://src/data/player_config.tres")
const FakeInputProvider = preload("res://src/tests/fakes/fake_input_provider.gd")
const Identifiers = preload("res://src/shared/identifiers.gd") # Note: identifiers moved to shared next? No, keeping updated path

# --- Test Internals ---
var _input_component: InputComponent
var _fake_input: FakeInputProvider
var _mock_owner: CharacterBody2D

# --- Test Lifecycle ---
func before_each():
	_mock_owner = CharacterBody2D.new()
	add_child_autofree(_mock_owner)

	_input_component = InputComponent.new()
	_mock_owner.add_child(_input_component)

	_fake_input = FakeInputProvider.new()

	var dependencies = {
		"data_resource": PlayerStateData.new(),
		"config": PlayerConfig,
		"input_provider": _fake_input
	}
	_input_component.setup(_mock_owner, dependencies)

# --- The Tests ---

func test_move_axis_is_buffered_correctly() -> void:
	# 1. Test Right
	_fake_input.set_axis(Identifiers.Actions.MOVE_LEFT, Identifiers.Actions.MOVE_RIGHT, 1.0)
	_input_component._physics_process(0.016)
	assert_eq(_input_component.input.move_axis, 1.0, "Move axis should be 1.0 for Right.")

	# 2. Test Left
	_fake_input.set_axis(Identifiers.Actions.MOVE_LEFT, Identifiers.Actions.MOVE_RIGHT, -1.0)
	_input_component._physics_process(0.016)
	assert_eq(_input_component.input.move_axis, -1.0, "Move axis should be -1.0 for Left.")

	# 3. Test Neutral
	_fake_input.set_axis(Identifiers.Actions.MOVE_LEFT, Identifiers.Actions.MOVE_RIGHT, 0.0)
	_input_component._physics_process(0.016)
	assert_eq(_input_component.input.move_axis, 0.0, "Move axis should be 0.0 when neutral.")

func test_action_just_pressed_is_buffered() -> void:
	# Press
	_fake_input.set_action_just_pressed(Identifiers.Actions.JUMP, true)
	_input_component._physics_process(0.016)
	assert_true(_input_component.input.jump_just_pressed, "jump_just_pressed should be true.")

	# Next Frame (Released)
	_fake_input.set_action_just_pressed(Identifiers.Actions.JUMP, false)
	_input_component._physics_process(0.016)
	assert_false(_input_component.input.jump_just_pressed, "jump_just_pressed should be false on next frame.")

func test_action_released_is_buffered() -> void:
	# Release
	_fake_input.set_action_just_released(Identifiers.Actions.ATTACK, true)
	_input_component._physics_process(0.016)
	assert_true(_input_component.input.attack_released, "attack_released should be true.")

	# Next Frame
	_fake_input.set_action_just_released(Identifiers.Actions.ATTACK, false)
	_input_component._physics_process(0.016)
	assert_false(_input_component.input.attack_released, "attack_released should be false on next frame.")

func test_action_held_persists_across_frames() -> void:
	# Frame 1: Pressed
	_fake_input.set_action_pressed(Identifiers.Actions.JUMP, true)
	_input_component._physics_process(0.016)
	assert_true(_input_component.input.jump_pressed, "jump_pressed should be true.")

	# Frame 2: Still Pressed
	_input_component._physics_process(0.016)
	assert_true(_input_component.input.jump_pressed, "jump_pressed should remain true.")

	# Frame 3: Released
	_fake_input.set_action_pressed(Identifiers.Actions.JUMP, false)
	_input_component._physics_process(0.016)
	assert_false(_input_component.input.jump_pressed, "jump_pressed should be false after release.")
