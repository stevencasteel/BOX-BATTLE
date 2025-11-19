# src/entities/player/data/player_combat_data.gd
@tool
class_name PlayerCombatData
extends Resource

# --- Resources ---
var max_healing_charges: int = 1
var healing_charges: int = 0:
	set(value):
		healing_charges = clamp(value, 0, max_healing_charges)
var determination_counter: int = 0

# --- State ---
var hit_targets_this_swing: Dictionary = {}
var is_charging: bool = false
var is_pogo_attack: bool = false

# --- Timers ---
var attack_duration_timer: float = 0.0
var attack_cooldown_timer: float = 0.0
var charge_timer: float = 0.0
var pogo_fall_prevention_timer: float = 0.0
