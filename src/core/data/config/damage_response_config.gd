# src/core/data/config/damage_response_config.gd
@tool
## A standard configuration resource defining how an entity reacts to damage.
class_name DamageResponseConfig
extends Resource

# Prevent cyclic dependency parse errors by using the raw resource type in signature if needed,
# but here we will rely on the global class_name 'AudioCue'.
@export_group("Feedback")
## The sound to play when damage is taken.
@export var audio_cue: AudioCue

@export_group("Invincibility")
@export_range(0.0, 5.0, 0.1) var invincibility_duration: float = 0.0

@export_group("Knockback")
@export_range(0.0, 2000.0, 10.0) var knockback_speed: float = 0.0
@export_range(0.0, 2000.0, 10.0) var hazard_knockback_speed: float = 0.0
