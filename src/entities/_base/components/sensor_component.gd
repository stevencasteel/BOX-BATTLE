# src/entities/components/sensor_component.gd
@tool
## A component that wraps an Area2D to detect specific entities (e.g., Player).
##
## It can automatically update a boolean property on a data resource when
## the target enters or exits the area, removing boilerplate from the entity.
class_name SensorComponent
extends Area2D

# --- Signals ---
signal target_entered(body: Node)
signal target_exited(body: Node)

# --- Configuration ---
## The physics group to detect (e.g., "player").
@export var target_group: String = "player"

## Optional: The name of the boolean property to toggle on the entity's state data.
## Example: "is_player_in_range"
@export var state_property_name: StringName = &""

# --- Private Variables ---
var _data_resource: Resource
var _active_targets: Array[Node] = []

# --- Godot Lifecycle ---

func _ready() -> void:
	# Sensors are detectors, so they monitor but are not monitorable themselves.
	monitoring = true
	monitorable = false
	
	# Standard sensor configuration:
	# Layer 10 (512) = Sensors
	# Mask 1 (1) = Player (default, can be changed in editor)
	collision_layer = 512
	collision_mask = 1 
	
	if not body_entered.is_connected(_on_body_entered):
		body_entered.connect(_on_body_entered)
	if not body_exited.is_connected(_on_body_exited):
		body_exited.connect(_on_body_exited)


# --- Public API ---

## Sets up the component with the entity's data resource.
## This allows the sensor to write directly to the state data.
func setup(_p_owner: Node, p_dependencies: Dictionary = {}) -> void:
	if p_dependencies.has("data_resource"):
		_data_resource = p_dependencies["data_resource"]


# --- Private Logic ---

func _update_state_property() -> void:
	if not _data_resource or state_property_name == &"":
		return
	
	# If we have at least one valid target in the area, the property is true.
	var is_active = not _active_targets.is_empty()
	# Only update if the property actually exists to prevent runtime errors
	if _data_resource.get(state_property_name) != null:
		_data_resource.set(state_property_name, is_active)


# --- Signal Handlers ---

func _on_body_entered(body: Node) -> void:
	if target_group != "" and not body.is_in_group(target_group):
		return
	
	if not _active_targets.has(body):
		_active_targets.append(body)
		_update_state_property()
		target_entered.emit(body)


func _on_body_exited(body: Node) -> void:
	if _active_targets.has(body):
		_active_targets.erase(body)
		_update_state_property()
		target_exited.emit(body)
