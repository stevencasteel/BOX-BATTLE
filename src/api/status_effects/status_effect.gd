# src/api/status_effects/status_effect.gd
@tool
## Base configuration resource for a temporary status effect (buff/debuff).
## Defines logic for application, removal, and per-frame updates.
class_name StatusEffect
extends Resource

@export var effect_id: StringName
@export_range(0.0, 60.0, 0.1) var duration: float = 0.0

## Called when the effect is first applied to the entity.
## [param target]: The Entity (CharacterBody2D).
## [param manager]: The StatusEffectComponent managing this effect.
func on_apply(_target: Node, _manager: Node) -> void:
	pass

## Called when the effect expires or is cleansed.
func on_remove(_target: Node, _manager: Node) -> void:
	pass

## Called every frame while active. Useful for DoTs or HoTs.
func on_tick(_delta: float, _target: Node, _manager: Node) -> void:
	pass
