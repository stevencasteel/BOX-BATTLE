# src/core/systems/camera_manager.gd
## An autoloaded singleton responsible for all camera logic.
extends Node

# --- Public Methods ---


## Centers the camera on the arena for a pixel-perfect setup (Legacy Tile-Based).
func center_camera_on_arena(camera: Camera2D, arena_size_tiles: Vector2i) -> void:
	if not is_instance_valid(camera):
		push_error("CameraManager: Invalid Camera2D provided.")
		return

	var arena_pixel_size = Vector2(arena_size_tiles) * Constants.TILE_SIZE
	camera.position = arena_pixel_size / 2.0


## Centers the camera based on a visual bounds node in the scene.
func setup_camera_from_bounds(camera: Camera2D, bounds_node: Control) -> void:
	if not is_instance_valid(camera) or not is_instance_valid(bounds_node):
		return
		
	var center = bounds_node.global_position + (bounds_node.size / 2.0)
	camera.global_position = center
