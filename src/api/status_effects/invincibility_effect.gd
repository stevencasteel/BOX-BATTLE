# src/api/status_effects/invincibility_effect.gd
@tool
## A concrete status effect that grants immunity to damage.
class_name InvincibilityEffect
extends StatusEffect

func _init() -> void:
	effect_id = &"invincibility"

func on_apply(_target: Node, manager: Node) -> void:
	# We use the manager's tagging system to register immunity.
	if manager.has_method("add_tag"):
		manager.add_tag(&"invincible")

func on_remove(_target: Node, manager: Node) -> void:
	if manager.has_method("remove_tag"):
		manager.remove_tag(&"invincible")
