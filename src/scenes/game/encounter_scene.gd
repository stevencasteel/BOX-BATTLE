# src/scenes/game/encounter_scene.gd
## The main game scene controller.
class_name EncounterScene
extends ISceneController

# --- Editor Properties ---
@export var _boss_death_shockwave: ShaderEffect

# --- Constants ---
const GameViewportScene = preload("res://src/scenes/game/game_viewport.tscn")
const TestConversation = preload("res://src/data/dialogue/test_conversation.tres")

# --- Node References ---
@onready var post_process_manager = $PostProcessLayer

# --- Private Member Variables ---
var _game_viewport: GameViewport = null
var _level_container: Node = null
var _debug_overlay: CanvasLayer = null
var _boss_died_token: int = 0
var _spawn_boss_token: int = 0
var _sequence_handle: SequenceHandle
var _camera_shaker: CameraShaker = null

# --- Debug Inspector ---
var _inspectable_entities: Array[Node] = []
var _current_inspect_index: int = 0

# --- Godot Lifecycle Methods ---
func _ready() -> void:
	_boss_died_token = EventBus.on(EventCatalog.BOSS_DIED, _on_boss_died)
	_spawn_boss_token = EventBus.on(EventCatalog.SPAWN_BOSS_REQUESTED, _on_spawn_boss_requested)

	# 1. Setup GameViewport
	_game_viewport = GameViewportScene.instantiate()
	add_child(_game_viewport)
	move_child(_game_viewport, 0)

	# 2. Load Level
	if is_instance_valid(GameManager.state.prebuilt_level):
		_level_container = GameManager.state.prebuilt_level
		GameManager.state.prebuilt_level = null
	else:
		_level_container = await ArenaBuilder.build_level_async()

	if not is_instance_valid(_level_container):
		push_error("EncounterScene: Failed to get a valid level container.")
		return
		
	# 3. Place Level in Viewport
	_game_viewport.add_level(_level_container)
	ObjectPool.register_world_container(_level_container)
	
	await get_tree().process_frame

	# 4. Setup Camera
	var cam = _game_viewport.get_camera()
	var bounds_node = _level_container.get_node_or_null("CameraBounds")
	
	if bounds_node and bounds_node is Control:
		# WYSIWYG Path
		CameraManager.setup_camera_from_bounds(cam, bounds_node)
	else:
		# Legacy Path (Fall back to build data tiles)
		var build_data: LevelBuildData = _level_container.get_meta("build_data")
		if build_data:
			CameraManager.center_camera_on_arena(cam, build_data.dimensions_tiles)
	
	# 5. Intro Sequence
	var b_data: LevelBuildData = _level_container.get_meta("build_data")
	if b_data and not b_data.encounter_data_resource.intro_sequence.is_empty():
		_sequence_handle = Sequencer.run_sequence(b_data.encounter_data_resource.intro_sequence)
		await _sequence_handle.finished

	_initialize_camera_shaker()
	_initialize_debug_inspector()

	var player_node: Node = ServiceLocator.targeting_system.get_first(Identifiers.Groups.PLAYER)
	if is_instance_valid(player_node):
		player_node.died.connect(_on_player_died)


func _unhandled_input(_event: InputEvent) -> void:
	if Input.is_action_just_pressed(Identifiers.Actions.DEBUG_OVERLAY):
		if is_instance_valid(_debug_overlay):
			_debug_overlay.visible = not _debug_overlay.visible

	if Input.is_action_just_pressed(Identifiers.Actions.DEBUG_DIALOGUE):
		if DialogueManager.is_conversation_active():
			DialogueManager.end_conversation()
		else:
			DialogueManager.start_conversation(TestConversation)

	if Input.is_action_just_pressed(Identifiers.Actions.DEBUG_CYCLE_TARGET):
		if is_instance_valid(_debug_overlay) and _debug_overlay.visible:
			_cycle_debug_target()


func _exit_tree() -> void:
	_cleanup_entities()
	EventBus.off(_boss_died_token)
	EventBus.off(_spawn_boss_token)
	FXManager.unregister_camera_shaker()
	if is_instance_valid(_sequence_handle):
		_sequence_handle.cancel()
	
	var cam = _game_viewport.get_camera() if is_instance_valid(_game_viewport) else null
	if is_instance_valid(cam):
		cam.offset = Vector2.ZERO
		
	get_tree().paused = false
	ObjectPool.register_world_container(null)


# --- Public Methods ---
func scene_exiting() -> void:
	_cleanup_entities()


# --- Private Methods ---
func _cleanup_entities() -> void:
	var player_node = ServiceLocator.targeting_system.get_first(Identifiers.Groups.PLAYER)
	if is_instance_valid(player_node) and player_node.has_method("teardown"):
		player_node.teardown()

	var enemy_nodes: Array = ServiceLocator.targeting_system.get_all(Identifiers.Groups.ENEMY)
	for enemy in enemy_nodes:
		if is_instance_valid(enemy) and enemy.has_method("teardown"):
			enemy.teardown()


func _initialize_camera_shaker() -> void:
	var shaker_scene: PackedScene = load("res://src/game/vfx/camera_shaker.tscn")
	if shaker_scene:
		_camera_shaker = shaker_scene.instantiate() as CameraShaker
		add_child(_camera_shaker)
		_camera_shaker.target_camera = _game_viewport.get_camera()
		FXManager.register_camera_shaker(_camera_shaker)


func _initialize_debug_inspector() -> void:
	_debug_overlay = load(AssetPaths.SCENE_DEBUG_OVERLAY).instantiate()
	_debug_overlay.inject_dependencies(ServiceLocator)
	add_child(_debug_overlay)
	_debug_overlay.visible = false

	_inspectable_entities.append(ServiceLocator.targeting_system.get_first(Identifiers.Groups.PLAYER))
	_inspectable_entities.append_array(ServiceLocator.targeting_system.get_all(Identifiers.Groups.ENEMY))

	if not _inspectable_entities.is_empty():
		_debug_overlay.set_target(_inspectable_entities[0])


func _cycle_debug_target() -> void:
	_inspectable_entities.clear()
	_inspectable_entities.append(ServiceLocator.targeting_system.get_first(Identifiers.Groups.PLAYER))
	_inspectable_entities.append_array(ServiceLocator.targeting_system.get_all(Identifiers.Groups.ENEMY))
	_inspectable_entities = _inspectable_entities.filter(func(e): return is_instance_valid(e))

	if _inspectable_entities.is_empty():
		_debug_overlay.set_target(null)
		return

	_current_inspect_index = (_current_inspect_index + 1) % _inspectable_entities.size()
	var new_target: Node = _inspectable_entities[_current_inspect_index]
	_debug_overlay.set_target(new_target)


func _deactivate_all_minions() -> void:
	var minions = ServiceLocator.targeting_system.get_all(Identifiers.Groups.ENEMY)
	for minion in minions:
		if minion.has_method("deactivate"):
			minion.deactivate()


# --- Signal Handlers ---

func _on_spawn_boss_requested(_payload) -> void:
	ArenaBuilder.spawn_boss_async()


func _on_player_died() -> void:
	SaveManager.record_loss()
	Engine.time_scale = 0.2
	await get_tree().create_timer(0.5, true, false, true).timeout
	SceneManager.go_to_game_over()


func _on_boss_died(payload: BossDiedEvent) -> void:
	var player_node = ServiceLocator.targeting_system.get_first(Identifiers.Groups.PLAYER)
	if is_instance_valid(player_node):
		player_node.set_physics_process(false)
	
	var boss_node: Node = payload.boss_node
	var rect = post_process_manager.get_shockwave_rect()

	if is_instance_valid(_boss_death_shockwave) and is_instance_valid(boss_node) and is_instance_valid(rect):
		# Correctly calculate position using helper
		var screen_pos = _game_viewport.world_to_screen_pos(boss_node.global_position)
		var viewport_size = get_viewport().get_visible_rect().size # Main Window Size (2560x1440)
		var uv_center = screen_pos / viewport_size
		
		FXManager.apply_shader_effect(
			rect, 
			_boss_death_shockwave, 
			{"center": uv_center},
			{}
		)

	Engine.time_scale = 0.15
	
	_deactivate_all_minions()

	await get_tree().create_timer(1.0, true, false, true).timeout 
	
	if is_instance_valid(boss_node):
		boss_node.queue_free()

	Engine.time_scale = 1.0
	SaveManager.record_win()
	SceneManager.go_to_victory()
