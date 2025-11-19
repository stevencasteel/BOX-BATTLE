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
		# Passing null shape reuses the one defined in the scene
		_player.pogo_hitbox.activate(null, Vector2(0, 40))


func exit() -> void:
	state_data.combat.is_pogo_attack = false
	if is_instance_valid(_player) and is_instance_valid(_player.pogo_hitbox):
		_player.pogo_hitbox.deactivate()


func process_physics(delta: float) -> void:
	_physics.apply_gravity(delta)

	if owner.is_on_floor():
		# FIX: Manually check for ground overlap to ensure bounce triggers
		# before we transition to MOVE state (Landing).
		if _check_pogo_ground_bounce():
			return

		state_machine.change_state(Identifiers.PlayerStates.MOVE)
		return

	if state_data.combat.attack_duration_timer <= 0:
		state_machine.change_state(Identifiers.PlayerStates.FALL)


func _check_pogo_ground_bounce() -> bool:
	if not is_instance_valid(_player) or not is_instance_valid(_player.pogo_hitbox):
		return false
		
	var bodies = _player.pogo_hitbox.get_overlapping_bodies()
	for body in bodies:
		if body == owner: continue
		
		if body is PhysicsBody2D:
			var layer = body.collision_layer
			# Check for World(128) or Platform(2)
			if (layer & (PhysicsLayers.SOLID_WORLD | PhysicsLayers.PLATFORMS)) != 0:
				# Valid ground hit found!
				# We manually trigger the bounce logic on the player.
				if _player.has_method("_on_pogo_bounce_requested"):
					_player._on_pogo_bounce_requested()
				return true
				
	return false
