# src/entities/minions/minion_state_data.gd
@tool
## A Resource that holds all shared runtime state data for a Minion.
class_name MinionStateData
extends BaseEntityData

# --- Configuration References ---
var behavior: MinionBehavior

# --- Combat ---
var is_invincible: bool = false
var projectile_pool_key: StringName = &""

# --- Targeting ---
var is_player_in_range: bool = false
var is_player_in_melee_range: bool = false
