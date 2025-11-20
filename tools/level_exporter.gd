extends Node

const EncounterPath = "res://src/data/encounters/encounter_00.tres"
const OutputPath = "res://src/content/levels/level_00.tscn"

# Dependencies
const LevelParserScript = preload("res://src/game/level_gen/level_parser.gd")
const GridUtilsScript = preload("res://src/core/util/grid_utils.gd")
const PhysicsLayers = preload("res://src/core/util/physics_layers.gd")
const Constants = preload("res://src/core/util/constants.gd")
const Palette = preload("res://src/core/util/palette.gd")
const Identifiers = preload("res://src/core/util/identifiers.gd") # Added for Groups

# Inner class to mock ServiceLocator
class MockLocator:
	var grid_utils

func _ready() -> void:
	# Defer to ensure engine is stable
	await get_tree().process_frame
	export_level()
	print("Export finished. Quitting...")
	get_tree().quit()

func export_level() -> void:
	print("--- STARTING LEVEL EXPORT ---")
	
	if not FileAccess.file_exists(EncounterPath):
		printerr("Error: Encounter file not found at ", EncounterPath)
		return
		
	var encounter = load(EncounterPath)
	if not encounter:
		printerr("Error: Failed to load resource.")
		return

	# Manual Dependency Injection
	var grid_utils = GridUtilsScript.new()
	var mock_locator = MockLocator.new()
	mock_locator.grid_utils = grid_utils

	var parser = LevelParserScript.new()
	var build_data = parser.parse_level_data(encounter, mock_locator)
	
	var root = Node2D.new()
	root.name = "Level_00"
	
	var terrain_container = _create_container("Terrain", root)
	var hazard_container = _create_container("Hazards", root)
	var platform_container = _create_container("Platforms", root)
	var bg_container = _create_container("Background", root)
	var spawn_container = _create_container("Spawns", root)
	var enemy_container = _create_container("Enemies", root)
	
	# --- Build Logic ---
	
	for pos in build_data.terrain_tiles:
		var body = _create_static_body(pos, PhysicsLayers.SOLID_WORLD, Palette.COLOR_TERRAIN_PRIMARY)
		terrain_container.add_child(body)
		_set_owner_recursive(body, root)

	for pos in build_data.hazard_tiles:
		var body = _create_static_body(pos, PhysicsLayers.HAZARD, Palette.COLOR_HAZARD_PRIMARY)
		hazard_container.add_child(body)
		_set_owner_recursive(body, root)
		
	for pos in build_data.oneway_platforms:
		var body = _create_platform_body(pos)
		platform_container.add_child(body)
		_set_owner_recursive(body, root)

	for grid_pos in build_data.background_tiles:
		var rect = _create_bg_rect(grid_pos)
		bg_container.add_child(rect)
		_set_owner_recursive(rect, root)
		
	var player_spawn = Marker2D.new()
	player_spawn.name = "PlayerSpawn"
	player_spawn.position = build_data.player_spawn_pos
	spawn_container.add_child(player_spawn)
	_set_owner_recursive(player_spawn, root)
	
	var boss_spawn = Marker2D.new()
	boss_spawn.name = "BossSpawn"
	boss_spawn.position = build_data.boss_spawn_pos
	spawn_container.add_child(boss_spawn)
	_set_owner_recursive(boss_spawn, root)

	# Minions
	for spawn in build_data.minion_spawns:
		if spawn.scene:
			var minion_node = spawn.scene.instantiate()
			minion_node.position = spawn.position
			enemy_container.add_child(minion_node)
			_set_owner_recursive(minion_node, root)
	
	# --- Save ---
	
	var packed_scene = PackedScene.new()
	var result = packed_scene.pack(root)
	
	if result == OK:
		var err = ResourceSaver.save(packed_scene, OutputPath)
		if err == OK:
			print("SUCCESS: Level saved to ", OutputPath)
		else:
			printerr("FAIL: Could not save file. Error code: ", err)
	else:
		printerr("FAIL: Could not pack scene. Error code: ", result)
	
	root.free()
	grid_utils.free()


# --- Helpers ---

func _create_container(name: String, root: Node) -> Node2D:
	var node = Node2D.new()
	node.name = name
	root.add_child(node)
	node.owner = root
	return node

func _set_owner_recursive(node: Node, root: Node) -> void:
	if node != root:
		node.owner = root
	for child in node.get_children():
		_set_owner_recursive(child, root)

func _create_static_body(pos: Vector2, layer: int, color: Color) -> StaticBody2D:
	var body = StaticBody2D.new()
	body.position = pos
	body.collision_layer = layer
	
	var shape = CollisionShape2D.new()
	var rect = RectangleShape2D.new()
	rect.size = Vector2(Constants.TILE_SIZE, Constants.TILE_SIZE)
	shape.shape = rect
	body.add_child(shape)
	
	var poly = Polygon2D.new()
	var half = Constants.TILE_SIZE / 2.0
	poly.polygon = PackedVector2Array([
		Vector2(-half, -half), Vector2(half, -half), 
		Vector2(half, half), Vector2(-half, half)
	])
	poly.color = color
	body.add_child(poly)
	
	return body

func _create_platform_body(pos: Vector2) -> StaticBody2D:
	var body = StaticBody2D.new()
	body.position = pos
	body.collision_layer = PhysicsLayers.PLATFORMS
	# FIX: Add to group so PlayerJumpHelper can detect it for drop-through
	body.add_to_group(Identifiers.Groups.ONEWAY_PLATFORMS)
	
	var shape = CollisionShape2D.new()
	shape.one_way_collision = true
	var rect = RectangleShape2D.new()
	rect.size = Vector2(Constants.TILE_SIZE, 10)
	shape.shape = rect
	shape.position.y = -(Constants.TILE_SIZE / 2.0) + (rect.size.y / 2.0)
	body.add_child(shape)
	
	var poly = Polygon2D.new()
	var half_w = Constants.TILE_SIZE / 2.0
	var half_h = 5.0
	poly.position = shape.position
	poly.polygon = PackedVector2Array([
		Vector2(-half_w, -half_h), Vector2(half_w, -half_h), 
		Vector2(half_w, half_h), Vector2(-half_w, half_h)
	])
	poly.color = Palette.COLOR_TERRAIN_SECONDARY
	body.add_child(poly)
	
	return body

func _create_bg_rect(grid_pos: Vector2i) -> ColorRect:
	var rect = ColorRect.new()
	rect.color = Palette.COLOR_GRID
	rect.size = Vector2(Constants.TILE_SIZE, Constants.TILE_SIZE)
	rect.position = Vector2(grid_pos) * Constants.TILE_SIZE
	# FIX: Push background behind everything (default is 0)
	rect.z_index = -10
	return rect
