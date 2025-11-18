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

## Enables the hitbox with specific shape parameters.
func activate(shape: Shape2D, position_offset: Vector2) -> void:
	if is_instance_valid(_shape_node):
		if shape:
			_shape_node.shape = shape
		_shape_node.position = position_offset
		_shape_node.set_deferred("disabled", false)
	
	monitoring = true


## Disables the hitbox.
func deactivate() -> void:
	monitoring = false
	if is_instance_valid(_shape_node):
		_shape_node.set_deferred("disabled", true)


# --- Private Logic ---

func _on_contact(target: Node) -> void:
	hit_detected.emit(target)
