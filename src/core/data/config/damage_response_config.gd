# src/core/data/config/damage_response_config.gd
@tool
## A standard configuration resource defining how an entity reacts to damage.
## This decouples the HealthComponent from specific Entity types.
class_name DamageResponseConfig
extends Resource

@export_group("Invincibility")
## Duration in seconds the entity is immune to damage after being hit.
@export_range(0.0, 5.0, 0.1) var invincibility_duration: float = 0.0

@export_group("Knockback")
## The speed of the knockback applied when hit by a standard enemy or projectile.
@export_range(0.0, 2000.0, 10.0) var knockback_speed: float = 0.0
## The speed of the knockback applied when hit by a hazard (spikes, etc.).
@export_range(0.0, 2000.0, 10.0) var hazard_knockback_speed: float = 0.0
