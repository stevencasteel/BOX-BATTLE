# src/core/data/config/state_definition.gd
@tool
## A simple mapping between a State Key (StringName) and its logic Script.
class_name StateDefinition
extends Resource

@export var key: StringName
@export var state_script: Script
