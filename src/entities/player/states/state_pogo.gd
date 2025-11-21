# src/entities/player/states/state_pogo.gd
## Handles the player's downward pogo attack state.
class_name PlayerStatePogo
extends BaseState

var _physics: PlayerPhysicsComponent
var _player # Untyped

# --- State Lifecycle ---

func enter(_msg := {}) -> void:
	_player = owner
	_physics = owner.get_component(PlayerPhysicsComponent)
	
	state_data.combat.is_pogo_attack = true
	state_data.combat.attack_duration_timer = state_data.config.attack_duration
	
	# --- Hitbox Activation ---
	# Pass null to force it to use the shape and position ALREADY set in the Editor.
	if is_instance_valid(_player) and is_instance_valid(_player.pogo_hitbox):
		_player.pogo_hitbox.activate(null, null) 
	
	# --- Visuals ---
	var offset = Vector2.ZERO
	var size = Vector2.ONE * 50
	
	if is_instance_valid(_player.pogo_hitbox):
		offset = _player.pogo_hitbox.get_shape_offset()
		size = _player.pogo_hitbox.get_shape_size()
	
	# Swap X/Y for the visual because we rotate it 90 degrees (horizontal slash texture -> vertical)
	_spawn_visual(Vector2(size.y, size.x), offset)
	
	# IMMEDIATE CHECK:
	if _player.is_on_floor():
		if _check_pogo_ground_bounce():
			return


func exit() -> void:
	state_data.combat.is_pogo_attack = false
	if is_instance_valid(_player) and is_instance_valid(_player.pogo_hitbox):
		_player.pogo_hitbox.deactivate()


func process_physics(delta: float) -> void:
	_physics.apply_gravity(delta)

	if owner.is_on_floor():
		if _check_pogo_ground_bounce():
			return
		state_machine.change_state(Identifiers.PlayerStates.MOVE)
		return

	if state_data.combat.attack_duration_timer <= 0:
		state_machine.change_state(Identifiers.PlayerStates.FALL)


func _check_pogo_ground_bounce() -> bool:
	if not is_instance_valid(_player) or not is_instance_valid(_player.pogo_hitbox):
		return false

	# 1. Check active overlaps (if monitoring is working)
	if _player.pogo_hitbox.monitoring:
		var bodies = _player.pogo_hitbox.get_overlapping_bodies()
		for body in bodies:
			if body == owner: continue
			if _is_valid_bounce_surface(body):
				_trigger_bounce()
				return true

	# 2. Manual Physics Query (Fallback/Frame-Perfect check)
	var shape_node = _player.pogo_hitbox.get_node_or_null("CollisionShape2D")
	if not is_instance_valid(shape_node):
		return false

	var space_state = _player.get_world_2d().direct_space_state
	var query = PhysicsShapeQueryParameters2D.new()
	
	# STRICTLY use the Editor's shape and transform.
	query.shape = shape_node.shape
	query.transform = shape_node.global_transform 
	query.collision_mask = PhysicsLayers.SOLID_WORLD | PhysicsLayers.PLATFORMS
	query.exclude = [_player.get_rid()]
	
	var result = space_state.intersect_shape(query, 1)
	if not result.is_empty():
		_trigger_bounce()
		return true
				
	return false


func _is_valid_bounce_surface(body: Node) -> bool:
	if body is PhysicsBody2D:
		var layer = body.collision_layer
		if (layer & (PhysicsLayers.SOLID_WORLD | PhysicsLayers.PLATFORMS)) != 0:
			return true
	if body.is_in_group(Identifiers.Groups.WORLD):
		return true
	return false


func _trigger_bounce() -> void:
	if _player.has_method("_on_pogo_bounce_requested"):
		_player._on_pogo_bounce_requested()


func _spawn_visual(size: Vector2, offset: Vector2) -> void:
	var scene = state_data.config.vfx_melee_slash
	if not is_instance_valid(scene) or not is_instance_valid(_player):
		return
		
	var visual = scene.instantiate()
	visual.position = offset
	visual.rotation = deg_to_rad(90)
	_player.add_child(visual)
	
	if visual.has_method("setup"):
		visual.setup(size, state_data.config.attack_duration)
