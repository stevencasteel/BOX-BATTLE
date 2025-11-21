# src/game/combat/attack_logic/lunge_logic.gd
@tool
## Concrete AttackLogic for executing a high-speed, invulnerable dash.
class_name LungeLogic
extends AttackLogic


func get_telegraph_info(owner: BaseEntity, _pattern: AttackPattern) -> Dictionary:
	# WYSIWYG: Look for the visual definition in the scene
	var lunge_rect_node = owner.get_node_or_null("Telegraphs/LungeArea")
	
	var size = Vector2(800, 50) # Fallback default
	var offset = Vector2(430, 0) # Fallback default
	
	if lunge_rect_node and lunge_rect_node is Control:
		size = lunge_rect_node.size
		# Center the offset based on the Rect's position relative to the Boss (0,0)
		# Rect position is top-left corner.
		# Center X = position.x + size.x / 2
		var center_x = lunge_rect_node.position.x + (size.x / 2.0)
		var center_y = lunge_rect_node.position.y + (size.y / 2.0)
		offset = Vector2(center_x, center_y)
	
	return {"size": size, "offset": offset}


func execute(owner: BaseEntity, pattern: AttackPattern) -> Callable:
	if not owner.is_in_group(Identifiers.Groups.ENEMY):
		push_warning("LungeLogic can only be executed by an Enemy.")
		return Callable()

	var lunge_params = {"pattern": pattern}
	var sm: BaseStateMachine = owner.get_component(BaseStateMachine)
	return sm.change_state.bind(Identifiers.BossStates.LUNGE, lunge_params)
