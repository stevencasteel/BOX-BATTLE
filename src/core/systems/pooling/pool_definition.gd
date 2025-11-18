# src/core/systems/pooling/pool_definition.gd
@tool
class_name PoolDefinition
extends Resource

@export var pool_key: StringName
@export var scene: PackedScene
@export var initial_size: int = 10
