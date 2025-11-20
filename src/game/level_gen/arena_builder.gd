# src/game/level_gen/arena_builder.gd
## An autoload that loads the level scene and manages entity injection.
##
## REFACTORED: Now uses 'level_scene' from EncounterData instead of procedural generation.
extends Node

# --- Constants ---
const BossSpawnShake = preload("res://src/core/data/effects/boss_spawn_shake.tres")
const LevelBuildDataScript = preload("res://src/game/level_gen/level_build_data.gd")

# --- Private Member Variables ---
var _current_build_data: LevelBuildData
var _current_level_container: Node

# --- Public Methods ---

## Asynchronously builds/loads the level and returns the root node.
func build_level_async() -> Node:
	_current_level_container = null
	
	var encounter_path: String = GameManager.state.current_encounter_path
	if encounter_path.is_empty():
		return _create_empty_container()

	var encounter_data: EncounterData = load(encounter_path)
	if not is_instance_valid(encounter_data):
		push_error("ArenaBuilder: Failed to load EncounterData at path: %s" % encounter_path)
		return _create_empty_container()

	# 1. Instantiate the Level Scene
	if not is_instance_valid(encounter_data.level_scene):
		push_error("ArenaBuilder: EncounterData has no 'level_scene' assigned.")
		return _create_empty_container()
		
	_current_level_container = encounter_data.level_scene.instantiate()
	
	# 2. Construct compatibility BuildData for EncounterScene
	_current_build_data = LevelBuildDataScript.new()
	_current_build_data.encounter_data_resource = encounter_data
	# Legacy support: assume 20x20 grid based on 1000x1000 level for camera centering
	_current_build_data.dimensions_tiles = Vector2i(20, 20) 
	
	# 3. Find Spawn Points
	var player_spawn = _current_level_container.find_child("PlayerSpawn")
	if player_spawn:
		_current_build_data.player_spawn_pos = player_spawn.position
	else:
		push_warning("ArenaBuilder: No 'PlayerSpawn' marker found in level scene.")
		
	var boss_spawn = _current_level_container.find_child("BossSpawn")
	if boss_spawn:
		_current_build_data.boss_spawn_pos = boss_spawn.position
	
	_current_level_container.set_meta("build_data", _current_build_data)

	# 4. Inject Dependencies into Pre-placed Entities (Minions)
	_inject_dependencies_recursive(_current_level_container)

	# 5. Spawn Dynamic Entities (Player, HUD)
	await get_tree().process_frame
	await _spawn_player_async()
	await _spawn_hud_async()
	
	return _current_level_container


## Spawns the boss defined in the encounter data.
func spawn_boss_async() -> Node:
	if not is_instance_valid(_current_build_data) or not is_instance_valid(_current_build_data.encounter_data_resource):
		return null
		
	var boss_scene: PackedScene = _current_build_data.encounter_data_resource.boss_scene
	if not boss_scene:
		return null
		
	var instance: Node = boss_scene.instantiate()
	if instance is Node2D:
		instance.global_position = _current_build_data.boss_spawn_pos
	
	if instance is BaseEntity:
		instance.inject_dependencies(ServiceLocator)
	
	_current_level_container.add_child(instance)
	await get_tree().process_frame

	if is_instance_valid(BossSpawnShake):
		ServiceLocator.fx_manager.request_screen_shake(BossSpawnShake)

	return instance


# --- Private Methods ---

func _create_empty_container() -> Node:
	var n = Node.new()
	n.name = "EmptyLevel"
	return n

func _spawn_player_async() -> void:
	var instance: Node = load(AssetPaths.SCENE_PLAYER).instantiate()
	if instance is Node2D:
		instance.global_position = _current_build_data.player_spawn_pos
	
	if instance is BaseEntity:
		instance.inject_dependencies(ServiceLocator)
	
	_current_level_container.add_child(instance)
	await get_tree().process_frame

func _spawn_hud_async() -> void:
	var instance: CanvasLayer = load(AssetPaths.SCENE_GAME_HUD).instantiate()
	_current_level_container.add_child(instance)
	await get_tree().process_frame

func _inject_dependencies_recursive(node: Node) -> void:
	if node is BaseEntity:
		node.inject_dependencies(ServiceLocator)
	
	for child in node.get_children():
		_inject_dependencies_recursive(child)
