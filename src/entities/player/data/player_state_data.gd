# src/entities/player/data/player_state_data.gd
@tool
## A Resource that holds all shared runtime state data for the Player.
## Acts as a container for domain-specific data chunks.
class_name PlayerStateData
extends BaseEntityData

# --- Sub-Data Containers ---
var physics: PlayerPhysicsData = PlayerPhysicsData.new()
var combat: PlayerCombatData = PlayerCombatData.new()

# --- Configuration References ---
# Note: 'config' and 'world_config' are inherited from BaseEntityData.
# 'config' is typed as Resource in the base, but holds PlayerConfig at runtime.
