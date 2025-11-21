# src/entities/minions/movement_logic/flying_patrol_movement_logic.gd
@tool
## A concrete movement strategy for an entity that moves between child markers.
class_name FlyingPatrolMovementLogic
extends MovementLogic

@export var patrol_speed: float = 150.0

# Store state per instance
var _patrol_data: Dictionary = {}

func execute(delta: float, entity: BaseEntity, _data: BaseEntityData) -> Vector2:
	var instance_id = entity.get_instance_id()
	
	# Initialize patrol points
	if not _patrol_data.has(instance_id):
		var point_a = entity.global_position
		var point_b = entity.global_position
		
		# Look for visual markers in the scene tree
		var marker_a = entity.get_node_or_null("PatrolPointA")
		var marker_b = entity.get_node_or_null("PatrolPointB")
		
		if marker_a: point_a = marker_a.global_position
		if marker_b: point_b = marker_b.global_position
		
		# If no markers, fallback to hovering in place (or hardcoded offset for testing)
		if not marker_a and not marker_b:
			# Fallback: Fly 200px up
			point_b = point_a + Vector2(0, -200)
			
		_patrol_data[instance_id] = {
			"target": point_b, # Start moving towards B
			"a": point_a,
			"b": point_b
		}
	
	var p_data = _patrol_data[instance_id]
	var target = p_data.target
	
	# Kinematic Movement
	var new_pos = entity.global_position.move_toward(target, patrol_speed * delta)
	var velocity_approx = (new_pos - entity.global_position) / delta
	
	entity.global_position = new_pos
	
	# Check arrival
	if entity.global_position.distance_to(target) < 1.0:
		if target == p_data.a:
			p_data.target = p_data.b
		else:
			p_data.target = p_data.a
			
	return velocity_approx
