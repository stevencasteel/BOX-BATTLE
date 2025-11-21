# src/scenes/game/game_viewport.gd
class_name GameViewport
extends Control

@onready var sub_viewport: SubViewport = %SubViewport
@onready var game_camera: Camera2D = %GameCamera
@onready var sub_viewport_container: SubViewportContainer = $CenterContainer/Border/SubViewportContainer

func add_level(level_node: Node) -> void:
	sub_viewport.add_child(level_node)

func get_camera() -> Camera2D:
	return game_camera

## Converts a position in the game world to global screen coordinates (Root Viewport).
func world_to_screen_pos(world_pos: Vector2) -> Vector2:
	# 1. Get position relative to the Game Camera (Viewport Center)
	var camera_pos = game_camera.global_position
	var viewport_size = Vector2(sub_viewport.size)
	var pos_in_viewport = (world_pos - camera_pos) + (viewport_size / 2.0)
	
	# 2. Get where the Viewport Container is on the main screen
	# (SubViewportContainer's global position is its top-left corner in the root window)
	var container_screen_pos = sub_viewport_container.global_position
	
	return container_screen_pos + pos_in_viewport
