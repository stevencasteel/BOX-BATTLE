# src/entities/player/data/player_state_data.gd
@tool
## A Resource that holds all shared runtime state data for the Player.
## Acts as a container for domain-specific data chunks.
class_name PlayerStateData
extends Resource

# --- Sub-Data Containers ---
var physics: PlayerPhysicsData = PlayerPhysicsData.new()
var combat: PlayerCombatData = PlayerCombatData.new()

# --- Configuration References ---
# These remain global as they are read-only configs used by everything.
var config: PlayerConfig
var world_config: WorldConfig

# --- Health ---
# Health is core enough to remain on the root or move to a HealthData.
# For now, we keep basic health stats here to avoid over-fragmentation,
# as HealthComponent manages these directly.
var max_health: int = 5
var health: int = 5:
	set(value):
		health = clamp(value, 0, max_health)
