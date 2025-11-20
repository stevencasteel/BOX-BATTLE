# src/entities/boss/data/boss_behavior.gd
@tool
## A data resource that defines a boss's complete combat behavior.
class_name BossBehavior
extends Resource

@export_group("Phase Configuration")
@export_range(0.0, 1.0, 0.01) var phase_2_threshold: float = 0.7
@export_range(0.0, 1.0, 0.01) var phase_3_threshold: float = 0.4

@export_group("Movement")
## Defines how the boss moves during the Patrol state.
@export var movement_logic: MovementLogic

@export_group("Attack Patterns")
@export var projectile_pool_key: StringName = &"boss_shots"
@export var phase_1_patterns: Array[AttackPattern] = []
@export var phase_2_patterns: Array[AttackPattern] = []
@export var phase_3_patterns: Array[AttackPattern] = []
