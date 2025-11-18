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
	
	state_data.is_pogo_attack = true
	state_data.attack_duration_timer = state_data.config.attack_duration
	
	# Direct Actuation
	if is_instance_valid(_player) and is_instance_valid(_player.pogo_hitbox):
		# Passing null shape reuses the one defined in the scene (if specific logic isn't needed)
		# or we could define a pogo_shape in PlayerConfig.
		_player.pogo_hitbox.activate(null, Vector2(0, 40))


func exit() -> void:
	state_data.is_pogo_attack = false
	if is_instance_valid(_player) and is_instance_valid(_player.pogo_hitbox):
		_player.pogo_hitbox.deactivate()


func process_physics(delta: float) -> void:
	_physics.apply_gravity(delta)

	if owner.is_on_floor():
		state_machine.change_state(Identifiers.PlayerStates.MOVE)
		return

	if state_data.attack_duration_timer <= 0:
		state_machine.change_state(Identifiers.PlayerStates.FALL)
