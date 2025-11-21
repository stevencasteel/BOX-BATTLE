# src/entities/minions/data/minion_behavior.gd
@tool
## A data resource that defines a minion's complete combat behavior.
##
## This combines base stats with swappable logic resources for movement and
## attacks, allowing for the creation of varied minion types from a single
## generic Minion scene.
class_name MinionBehavior
extends Resource

@export_group("Stats")
@export_range(1, 100, 1) var max_health: int = 3

@export_group("State & Movement")
@export var initial_state_key: StringName = &"fall"
# A flag to determine if the entity should be immune to physics pushback.
@export var is_anchored: bool = false
@export var movement_logic: MovementLogic

@export_group("Combat")
# DEPRECATED: Range is now defined by the CollisionShape2D in the scene editor.
# This value is kept for backward compatibility but ignored by updated Minion.gd.
@export_range(50, 1000, 10) var detection_radius: float = 400.0

@export var projectile_pool_key: StringName = &"turret_shots"
@export var attack_patterns: Array[AttackPattern] = []
