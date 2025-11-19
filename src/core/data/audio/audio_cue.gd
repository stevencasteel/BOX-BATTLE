# src/core/data/audio/audio_cue.gd
@tool
## A wrapper resource for AudioStreams that adds randomization and mixing data.
## Allows sound designers to tune pitch/volume without modifying code.
class_name AudioCue
extends Resource

@export_group("Sound Source")
## The raw audio file or Randomizer to play.
@export var stream: AudioStream

@export_group("Mixing")
## Base volume offset in decibels.
@export_range(-80.0, 24.0, 0.1) var volume_db: float = 0.0
## Base pitch scale (1.0 is normal speed).
@export_range(0.1, 4.0, 0.01) var pitch_scale: float = 1.0
## Target AudioBus (e.g., "SFX", "Music", "UI").
@export var bus: StringName = &"SFX"

@export_group("Randomization")
## Random variance applied to pitch. A value of 0.1 means +/- 0.1.
@export_range(0.0, 1.0, 0.01) var pitch_randomness: float = 0.0


## Returns the final pitch value with randomization applied.
func get_pitch() -> float:
	if pitch_randomness > 0:
		return pitch_scale + randf_range(-pitch_randomness, pitch_randomness)
	return pitch_scale
