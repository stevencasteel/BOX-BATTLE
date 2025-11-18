# src/core/data/config/world_config.gd
@tool
## A configuration resource for Global World settings (Physics, Time, Juice).
class_name WorldConfig
extends Resource

@export_group("Physics")
@export_range(500, 3000, 10) var gravity: float = 1200.0

@export_group("Juice & Feedback (Hit-Stop)")
@export_range(0.0, 0.5, 0.01) var hit_stop_player_melee_close: float = 0.025
@export_range(0.0, 0.5, 0.01) var hit_stop_player_hurt: float = 0.04
@export_range(0.0, 1.0, 0.01) var hit_stop_boss_phase_change: float = 0.1
@export_range(0.0, 1.0, 0.01) var hit_stop_boss_death: float = 0.2
