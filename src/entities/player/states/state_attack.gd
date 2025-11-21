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
	
	var target_hitbox: HitboxComponent = null
	var visual_rot = 0.0
	
	if is_up_attack and is_instance_valid(_player.up_hitbox):
		target_hitbox = _player.up_hitbox
		visual_rot = deg_to_rad(-90)
	elif is_instance_valid(_player.melee_hitbox):
		target_hitbox = _player.melee_hitbox
		visual_rot = 0.0 if facing > 0 else deg_to_rad(180)
	
	if is_instance_valid(target_hitbox):
		# Activate logic using Editor values
		target_hitbox.activate(null, null)
		
		# VISUAL FIX:
		# Use shape offset + node position to get the exact center of the collider
		# relative to the player.
		var shape_offset = target_hitbox.get_shape_offset()
		var total_offset = target_hitbox.position + shape_offset
		
		_spawn_visual(target_hitbox.get_shape_size(), total_offset, visual_rot)


func exit() -> void:
	state_data.combat.hit_targets_this_swing.clear()
	if is_instance_valid(_player):
		if is_instance_valid(_player.melee_hitbox):
			_player.melee_hitbox.deactivate()
		if is_instance_valid(_player.up_hitbox):
			_player.up_hitbox.deactivate()


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
	_player.add_child(visual) 
	
	if visual.has_method("setup"):
		# Handle rotation for visuals
		var visual_size = size
		if abs(rot) > 0.1 and abs(rot) < 3.0: # Roughly -90 or 90 deg
			visual_size = Vector2(size.y, size.x)
			
		visual.setup(visual_size, state_data.config.attack_duration)
