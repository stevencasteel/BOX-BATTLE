# src/entities/player/components/player_jump_helper.gd
## A stateless helper class that centralizes all jump-related logic for the Player.
class_name PlayerJumpHelper
extends RefCounted

# --- Public Methods ---

## Checks all possible jump conditions in a prioritized order and executes one if valid.
static func try_jump(owner: Node, p_data: Resource) -> bool:
	if not is_instance_valid(owner):
		return false

	var physics = owner.get_component(PlayerPhysicsComponent)
	var sm = owner.get_component(BaseStateMachine)

	if not is_instance_valid(physics) or not is_instance_valid(sm):
		return false

	# 1. Wall Jump (Highest Priority)
	if p_data.physics.wall_coyote_timer > 0:
		physics.perform_wall_jump()
		sm.change_state(Identifiers.PlayerStates.JUMP)
		return true

	# 2. Ground Jump (includes coyote time)
	if owner.is_on_floor() or p_data.physics.coyote_timer > 0:
		sm.change_state(Identifiers.PlayerStates.JUMP)
		return true

	# 3. Air Jump
	if p_data.physics.air_jumps_left > 0:
		sm.change_state(Identifiers.PlayerStates.JUMP, {"is_air_jump": true})
		return true

	return false


## Checks if the player is standing on a one-way platform.
## Useful for other components to avoid conflicting with drop logic.
static func is_standing_on_platform(owner: Node) -> bool:
	if not is_instance_valid(owner) or not owner is CharacterBody2D:
		return false

	for i in range(owner.get_slide_collision_count()):
		var collision = owner.get_slide_collision(i)
		var collider = collision.get_collider()
		
		if not is_instance_valid(collider):
			continue

		# Must be standing ON it (Normal pointing up)
		if collision.get_normal().dot(Vector2.UP) < 0.5:
			continue 
		
		# Check Layer
		if collider is CollisionObject2D:
			if (collider.collision_layer & PhysicsLayers.PLATFORMS) != 0:
				return true
		
		# Check Group (Legacy Fallback)
		if collider.is_in_group(Identifiers.Groups.ONEWAY_PLATFORMS):
			return true
			
	return false


## Checks if the player is attempting to drop through a one-way platform.
static func try_platform_drop(owner: Node) -> bool:
	if not is_instance_valid(owner) or not owner is CharacterBody2D:
		return false

	for i in range(owner.get_slide_collision_count()):
		var collision = owner.get_slide_collision(i)
		var collider = collision.get_collider()
		
		if not is_instance_valid(collider):
			continue

		if collision.get_normal().dot(Vector2.UP) < 0.5:
			continue 
		
		var is_platform = false
		
		if collider is CollisionObject2D:
			if (collider.collision_layer & PhysicsLayers.PLATFORMS) != 0:
				is_platform = true
		
		if not is_platform and collider.is_in_group(Identifiers.Groups.ONEWAY_PLATFORMS):
			is_platform = true
			
		if is_platform:
			# Nudge down to bypass the one-way threshold
			owner.position.y += 2 
			
			var sm = owner.get_component(BaseStateMachine)
			if sm:
				sm.change_state(Identifiers.PlayerStates.FALL)
			return true

	return false
