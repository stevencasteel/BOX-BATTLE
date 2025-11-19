# src/core/data/save_data.gd
@tool
## A resource container for persistent player progression stats.
class_name SaveData
extends Resource

@export var total_wins: int = 0
@export var total_losses: int = 0
