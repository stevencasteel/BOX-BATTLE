# src/entities/components/hitbox_component.gd
@tool
## A component that wraps an Area2D to handle attack collision detection.
##
## It abstracts collision masking and signal reporting for melee/pogo attacks.
class_name HitboxComponent
extends Area2D

# --- Signals ---
signal hit_detected(target: Node)

# --- Exported Properties ---
## If true, configures masks to hit the Player. If false, hits Enemies.
@export var target_player: bool = false

# --- Node References ---
# We assume a CollisionShape2D is a direct child, standard for Area2D.
@onready var _shape_node: CollisionShape2D = $CollisionShape2D

# --- Godot Lifecycle ---
func _ready() -> void:
	# Hitboxes are "active" zones, not physical obstacles.
	monitorable = false
	monitoring = false
	
	# Standardize collision layer for hitboxes (Layer 9)
	collision_layer = PhysicsLayers.HITBOX
	
	# Configure masks based on intended target
	if target_player:
		collision_mask = PhysicsLayers.PLAYER_HURTBOX
	else:
		# Hit Enemies (4), Projectiles (16), and Hazards (8)
		collision_mask = PhysicsLayers.ENEMY | PhysicsLayers.ENEMY_PROJECTILE | PhysicsLayers.HAZARD

	if not body_entered.is_connected(_on_contact):
		body_entered.connect(_on_contact)
	if not area_entered.is_connected(_on_contact):
		area_entered.connect(_on_contact)


# --- Public API ---

## Enables the hitbox. 
## If [param shape] is null, it keeps the current shape.
## If [param position_offset] is null, it keeps the current position (Editor Position).
func activate(shape: Shape2D = null, position_offset = null) -> void:
	if is_instance_valid(_shape_node):
		if shape:
			_shape_node.shape = shape
		
		# Only overwrite position if an explicit offset is provided
		if position_offset != null and position_offset is Vector2:
			_shape_node.position = position_offset
			
		_shape_node.set_deferred("disabled", false)
	
	set_deferred("monitoring", true)


## Disables the hitbox.
func deactivate() -> void:
	set_deferred("monitoring", false)
	if is_instance_valid(_shape_node):
		_shape_node.set_deferred("disabled", true)


## Manually sets the visual/logical offset of the shape (useful for debug/sync).
func set_shape_offset(offset: Vector2) -> void:
	if is_instance_valid(_shape_node):
		_shape_node.position = offset

## Returns the current local position of the collision shape.
func get_shape_offset() -> Vector2:
	if is_instance_valid(_shape_node):
		return _shape_node.position
	return Vector2.ZERO

## Returns the current size of the shape (if it's a Rectangle or Circle).
func get_shape_size() -> Vector2:
	if is_instance_valid(_shape_node) and _shape_node.shape:
		var s = _shape_node.shape
		if s is RectangleShape2D:
			return s.size
		elif s is CircleShape2D:
			return Vector2(s.radius * 2, s.radius * 2)
	return Vector2.ZERO


# --- Private Logic ---

func _on_contact(target: Node) -> void:
	hit_detected.emit(target)
