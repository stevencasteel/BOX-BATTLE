# src/entities/minions/movement_logic/patrol_movement_logic.gd
@tool
## A concrete movement strategy where the entity moves back and forth,
## reversing direction when it hits a wall.
class_name PatrolMovementLogic
extends MovementLogic

## Moves the entity horizontally. Preserves vertical velocity (gravity).
func execute(_delta: float, entity: BaseEntity, data: Resource) -> Vector2:
	var new_velocity := entity.velocity
	
	# Note: Gravity is handled by the BaseEntity's _physics_process.
	# We just handle the horizontal patrol logic here.
	
	if entity.is_on_wall():
		data.facing_direction *= -1.0

	new_velocity.x = data.facing_direction * data.config.boss_patrol_speed
	return new_velocity