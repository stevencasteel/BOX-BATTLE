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
	
	var is_up_attack = _input.input.up
	var facing = state_data.physics.facing_direction
	
	if is_instance_valid(_player) and is_instance_valid(_player.melee_hitbox):
		var shape = state_data.config.forward_attack_shape
		var offset = Vector2(facing * 60, 0)
		var rotation_angle = 0.0
		
		if is_up_attack:
			shape = state_data.config.upward_attack_shape
			offset = Vector2(0, -40)
			rotation_angle = deg_to_rad(-90)
		elif facing < 0:
			rotation_angle = deg_to_rad(180)
			
		_player.melee_hitbox.activate(shape, offset)
		
		# Spawn Visual
		_spawn_visual(shape.get_rect().size, offset, rotation_angle)


func exit() -> void:
	state_data.combat.hit_targets_this_swing.clear()
	if is_instance_valid(_player) and is_instance_valid(_player.melee_hitbox):
		_player.melee_hitbox.deactivate()


func process_physics(delta: float) -> void:
	if is_instance_valid(_physics):
		# Apply gravity so the player falls during the attack
		_physics.apply_gravity(delta)
		# Apply friction only to horizontal movement to stop forward momentum
		_physics.apply_horizontal_friction(state_data.config.attack_friction, delta)

	if state_data.combat.attack_duration_timer <= 0:
		state_machine.change_state(Identifiers.PlayerStates.FALL)


func _spawn_visual(size: Vector2, offset: Vector2, rot: float) -> void:
	var scene = state_data.config.vfx_melee_slash
	if not is_instance_valid(scene) or not is_instance_valid(_player):
		return
		
	var visual = scene.instantiate()
	visual.position = offset
	visual.rotation = rot
	_player.add_child(visual) # Add as child so it follows player during the swing
	
	if visual.has_method("setup"):
		visual.setup(size, state_data.config.attack_duration)
