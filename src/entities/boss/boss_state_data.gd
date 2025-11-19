# src/entities/boss/boss_state_data.gd
@tool
## A Resource that holds all shared runtime state data for the Boss.
class_name BossStateData
extends BaseEntityData

# --- Configuration References ---
var behavior: BossBehavior

# --- Combat ---
var projectile_pool_key: StringName = &""

# --- Targeting ---
var is_player_in_close_range: bool = false
