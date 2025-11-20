# src/data/encounters/encounter_data.gd
@tool
## A custom Resource that defines a complete encounter or stage.
class_name EncounterData
extends Resource

# --- Editor Properties ---
@export_group("Scene")
## The pre-built level scene (.tscn) to instantiate.
## Replaces the legacy LevelLayout.
@export var level_scene: PackedScene

@export_group("Legacy Layout")
# Deprecated, kept temporarily to prevent load errors until fully cleaned
@export var level_layout: Resource 
@export var player_spawn_marker: String = "@"

@export_group("Boss")
@export var boss_scene: PackedScene
@export var boss_spawn_marker: String = "&"

@export_group("Minions")
@export var minion_spawns: Dictionary = {}

@export_group("Sequencing")
## An array of SequenceStep resources that run when the encounter begins.
@export var intro_sequence: Array[SequenceStep] = []
