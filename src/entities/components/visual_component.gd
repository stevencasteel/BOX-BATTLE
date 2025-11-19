# src/entities/components/visual_component.gd
@tool
## Manages the entity's main visual sprite/rect state and high-level VFX sequences (Death).
class_name VisualComponent
extends IComponent

var _visual_node: CanvasItem
var _fx_component: FXComponent
var _config: PlayerConfig

func setup(p_owner: Node, p_dependencies: Dictionary = {}) -> void:
	_visual_node = p_dependencies.get("visual_node")
	_config = p_dependencies.get("config")
	
	# We can find FXComponent via the owner directly or pass it.
	# Using owner lookup is safe here as it's a sibling component.
	if p_owner.has_method("get_component"):
		_fx_component = p_owner.get_component(FXComponent)
	
	# Set initial color if applicable
	if is_instance_valid(_visual_node) and _visual_node is ColorRect:
		_visual_node.color = Palette.COLOR_PLAYER


func play_death_sequence() -> Tween:
	if not is_instance_valid(_fx_component):
		return null
	
	if not is_instance_valid(_config) or not is_instance_valid(_config.vfx_dissolve):
		push_warning("VisualComponent: No dissolve effect configured.")
		return null
		
	return _fx_component.play_effect(
		_config.vfx_dissolve, 
		{}, 
		{"preserve_final_state": true}
	)
