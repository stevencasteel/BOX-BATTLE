# src/core/data/base_entity_data.gd
@tool
## The base data container for all entities in the game.
## Enforces the Liskov Substitution Principle for shared logic.
class_name BaseEntityData
extends Resource

# --- Dependencies ---
var services: ServiceLocator
## The specific configuration (PlayerConfig or EnemyConfig).
var config: Resource 
var world_config: WorldConfig

# --- Core State ---
var max_health: int = 1
var health: int = 1:
	set(value):
		health = clamp(value, 0, max_health)

var facing_direction: float = 1.0
