# src/core/util/combat_utils.gd
## An autoloaded singleton containing static helper functions for combat logic.
extends Node

## Traverses up the scene tree from a given node to find its root BaseEntity.
func find_entity_root(from_node: Node) -> BaseEntity:
	if not is_instance_valid(from_node):
		return null
	
	var current_node = from_node
	while is_instance_valid(current_node):
		if current_node is BaseEntity:
			return current_node
		current_node = current_node.get_parent()
		
	return null


## Finds the IDamageable component on a target node by first finding the
## target's entity root, then asking for the component.
func find_damageable(from_node: Node) -> IDamageable:
	if not is_instance_valid(from_node):
		return null
	
	# If the collision starts on a sensor, we should never treat it as damageable.
	# This prevents projectiles that pass through a sensor from damaging the owner.
	if from_node.is_in_group(Identifiers.Groups.SENSORS):
		return null

	var entity: BaseEntity = find_entity_root(from_node)
	if is_instance_valid(entity):
		return entity.get_component(IDamageable)
	
	# Fallback for non-entity damageable nodes (e.g., a simple damageable prop)
	if from_node is IDamageable:
		return from_node
		
	return null


## Factory method to create a standard DamageInfo resource.
func create_damage_info(
	amount: int, 
	source: Node, 
	position: Vector2 = Vector2.ZERO, 
	normal: Vector2 = Vector2.ZERO,
	bypass_iframe: bool = false
) -> DamageInfo:
	var info = DamageInfo.new()
	info.amount = amount
	info.source_node = source
	info.impact_position = position
	info.impact_normal = normal
	info.bypass_invincibility = bypass_iframe
	return info
