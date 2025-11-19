# src/core/systems/targeting_system.gd
## An autoloaded singleton that acts as a registry for active game entities.
##
## This decouples logic from the SceneTree group system, allowing for faster
## lookups and easier dependency mocking in tests.
extends Node

# Map<group_id, Array[Node]>
var _targets: Dictionary = {}

# --- Public API ---

## Registers a node as a target within a specific group.
func register(node: Node, group_id: String) -> void:
	if not is_instance_valid(node):
		return
		
	if not _targets.has(group_id):
		_targets[group_id] = []
		
	if not _targets[group_id].has(node):
		_targets[group_id].append(node)


## Unregisters a node from a specific group.
func unregister(node: Node, group_id: String) -> void:
	if _targets.has(group_id):
		_targets[group_id].erase(node)


## Returns the first registered node in a group, or null if empty.
func get_first(group_id: String) -> Node:
	if _targets.has(group_id) and not _targets[group_id].is_empty():
		# Return the first valid instance
		for node in _targets[group_id]:
			if is_instance_valid(node):
				return node
	return null


## Returns all registered nodes in a group.
func get_all(group_id: String) -> Array:
	if _targets.has(group_id):
		# Filter out any invalid references on the fly
		_targets[group_id] = _targets[group_id].filter(func(n): return is_instance_valid(n))
		return _targets[group_id]
	return []
