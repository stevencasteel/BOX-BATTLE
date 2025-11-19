# src/core/data/config/state_machine_config.gd
@tool
## A configuration resource defining the structure of a Finite State Machine.
## Allows states to be injected via the Inspector/Resources rather than hardcoded.
class_name StateMachineConfig
extends Resource

@export var initial_state: StringName = &"idle"
@export var states: Array[StateDefinition] = []
