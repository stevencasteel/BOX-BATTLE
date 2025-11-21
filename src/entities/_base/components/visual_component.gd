# src/entities/components/visual_component.gd
@tool
## Manages the entity's main visual sprite/rect state and high-level VFX sequences (Death).
## Acts as an abstraction layer so logic doesn't need to know if the visual is a Sprite, ColorRect, etc.
class_name VisualComponent
extends IComponent

var _visual_node: CanvasItem
var _fx_component: FXComponent
var _config: Resource

func setup(p_owner: Node, p_dependencies: Dictionary = {}) -> void:
	_visual_node = p_dependencies.get("visual_node")
	_config = p_dependencies.get("config")
	
	# Link to sibling FXComponent if available
	if p_owner.has_method("get_component"):
		_fx_component = p_owner.get_component(FXComponent)
	
	# Initialize default color if it's a primitive shape
	if _visual_node is ColorRect or _visual_node is Polygon2D:
		# Use the Palette constant for Player if this is the Player
		if p_owner.is_in_group(Identifiers.Groups.PLAYER):
			set_color(Palette.COLOR_PLAYER)
		elif p_owner.is_in_group(Identifiers.Groups.ENEMY):
			# Bosses might override this later, but defaults are safe
			pass


## Sets the visual facing direction.
## [param direction]: Non-zero float. Positive = Right, Negative = Left.
func set_facing(direction: float) -> void:
	if not is_instance_valid(_visual_node) or is_zero_approx(direction):
		return
	
	# Only flip if the sign differs (simple optimization)
	var new_scale_x = abs(_visual_node.scale.x) * sign(direction)
	if not is_equal_approx(_visual_node.scale.x, new_scale_x):
		_visual_node.scale.x = new_scale_x


## Sets the base color of the visual node.
## Handles ColorRect, Polygon2D, and generic CanvasItems (via modulate).
func set_color(color: Color) -> void:
	if not is_instance_valid(_visual_node):
		return
		
	if "color" in _visual_node:
		_visual_node.color = color
	else:
		_visual_node.modulate = color


## Orchestrates the death visual sequence (e.g., dissolve shader).
func play_death_sequence() -> Tween:
	if not is_instance_valid(_fx_component):
		return null
	
	# Fallback to config if available, or allow manual injection later
	var effect = _config.vfx_dissolve if (_config and "vfx_dissolve" in _config) else null
	
	if not is_instance_valid(effect):
		push_warning("VisualComponent: No dissolve effect configured for death sequence.")
		return null
		
	return _fx_component.play_effect(
		effect, 
		{}, 
		{"preserve_final_state": true}
	)
