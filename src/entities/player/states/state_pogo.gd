# src/entities/player/states/state_pogo.gd
## Handles the player's downward pogo attack state.
class_name PlayerStatePogo
extends BaseState

var _physics: PlayerPhysicsComponent
var _player: Player

# --- State Lifecycle ---

func enter(_msg := {}) -> void:
	_player = owner as Player
	_physics = owner.get_component(PlayerPhysicsComponent)
	
	state_data.combat.is_pogo_attack = true
	state_data.combat.attack_duration_timer = state_data.config.attack_duration
	
	# Direct Actuation
	if is_instance_valid(_player) and is_instance_valid(_player.pogo_hitbox):
		# Passing null shape reuses the one defined in the scene.
		# Offset (0, 40) places it below the player.
		_player.pogo_hitbox.activate(null, Vector2(0, 40))
	
	# IMMEDIATE CHECK:
	# If we entered this state while already on the ground (e.g. standing pogo),
	# we must perform an immediate synchronous check.
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
		# If we landed this frame, check if it's valid pogo terrain.
		if _check_pogo_ground_bounce():
			return

		# If not a pogo surface, land normally.
		state_machine.change_state(Identifiers.PlayerStates.MOVE)
		return

	if state_data.combat.attack_duration_timer <= 0:
		state_machine.change_state(Identifiers.PlayerStates.FALL)


func _check_pogo_ground_bounce() -> bool:
	if not is_instance_valid(_player) or not is_instance_valid(_player.pogo_hitbox):
		return false

	# 1. Check Area2D overlaps (Fastest, handles continuous overlaps)
	# GUARD: We must check if monitoring is actually active. HitboxComponent uses
	# set_deferred to enable it, so it will be false on the first frame (enter).
	if _player.pogo_hitbox.monitoring:
		var bodies = _player.pogo_hitbox.get_overlapping_bodies()
		for body in bodies:
			if body == owner: continue
			if _is_valid_bounce_surface(body):
				_trigger_bounce()
				return true

	# 2. Synchronous Physics Query (Fallback)
	# Required for frame-perfect inputs where Area2D monitoring hasn't started yet.
	var space_state = _player.get_world_2d().direct_space_state
	var query = PhysicsShapeQueryParameters2D.new()
	
	var shape_node = _player.pogo_hitbox.get_node_or_null("CollisionShape2D")
	if not is_instance_valid(shape_node):
		return false
		
	query.shape = shape_node.shape
	# Must match the offset used in activate()
	var offset = Vector2(0, 40) 
	query.transform = Transform2D(0.0, _player.global_position + offset)
	# Check Solid World (128) and Platforms (2)
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
