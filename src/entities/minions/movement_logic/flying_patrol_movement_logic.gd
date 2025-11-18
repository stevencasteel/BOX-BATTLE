# src/entities/minions/movement_logic/flying_patrol_movement_logic.gd
@tool
## A concrete movement strategy for an entity that moves vertically between
## two explicit waypoints, ignoring gravity.
class_name FlyingPatrolMovementLogic
extends MovementLogic

@export var patrol_speed: float = 150.0

# Store the patrol points on a per-instance basis to support multiple entities.
var _patrol_points: Dictionary = {}


func execute(delta: float, entity: BaseEntity, _data: Resource) -> Vector2:
	var instance_id = entity.get_instance_id()
	
	# Initialize patrol points on the first run for this specific instance.
	if not _patrol_points.has(instance_id):
		# Define patrol points using our clear Grid Coordinate system.
		var top_patrol_grid_pos = Vector2i(16, 10)
		var top_point = GridUtils.grid_to_world(top_patrol_grid_pos)
		var bottom_point = entity.global_position
		
		_patrol_points[instance_id] = {
			"top": top_point,
			"bottom": bottom_point,
			"target": top_point
		}
	
	var patrol_data = _patrol_points[instance_id]
	var target_position = patrol_data.target
	
	# This is a kinematic movement. We directly manipulate the position.
	entity.global_position = entity.global_position.move_toward(target_position, patrol_speed * delta)
	
	# If the target is reached, switch to the other point.
	if entity.global_position.distance_to(target_position) < 1.0:
		if target_position == patrol_data.top:
			patrol_data.target = patrol_data.bottom
		else:
			patrol_data.target = patrol_data.top
	
	return Vector2.ZERO
