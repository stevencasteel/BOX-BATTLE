# src/entities/player/states/state_attack.gd
## This state handles the player's melee attack.
class_name PlayerStateAttack
extends BaseState

var _input: InputComponent
var _physics: PlayerPhysicsComponent
var _player # Untyped

# --- State Lifecycle ---

func enter(_msg := {}) -> void:
	_player = owner
	_input = owner.get_component(InputComponent)
	_physics = owner.get_component(PlayerPhysicsComponent)
	
	state_data.combat.hit_targets_this_swing.clear()
	
	state_data.combat.attack_duration_timer = state_data.config.attack_duration
	state_data.combat.attack_cooldown_timer = state_data.config.attack_cooldown
	
	var is_up_attack = _input.buffer.get("up", false)
	
	if is_instance_valid(_player) and is_instance_valid(_player.melee_hitbox):
		var shape = state_data.config.forward_attack_shape
		var offset = Vector2(state_data.physics.facing_direction * 60, 0)
		if is_up_attack:
			shape = state_data.config.upward_attack_shape
			offset = Vector2(0, -40)
		_player.melee_hitbox.activate(shape, offset)


func exit() -> void:
	state_data.combat.hit_targets_this_swing.clear()
	if is_instance_valid(_player) and is_instance_valid(_player.melee_hitbox):
		_player.melee_hitbox.deactivate()


func process_physics(delta: float) -> void:
	if is_instance_valid(_physics):
		_physics.apply_friction(state_data.config.attack_friction, delta)

	if state_data.combat.attack_duration_timer <= 0:
		state_machine.change_state(Identifiers.PlayerStates.FALL)
