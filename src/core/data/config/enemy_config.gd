# src/core/data/config/enemy_config.gd
@tool
## A configuration resource for Enemy stats (Bosses, Minions, Projectiles).
class_name EnemyConfig
extends Resource

@export_group("Boss - General")
@export_range(10, 500, 5) var boss_health: int = 30
@export_range(50, 500, 5) var boss_patrol_speed: float = 100.0

## Configuration for how the enemy reacts to taking damage.
@export var damage_response: DamageResponseConfig

@export_group("Boss - Attacks")
@export_range(500, 3000, 50) var boss_lunge_speed: float = 1200.0

@export_group("Projectiles")
@export_range(1, 20, 1) var homing_shot_damage: int = 1
@export_range(100, 1000, 10) var homing_shot_speed: float = 250.0
@export_range(1.0, 20.0, 0.5) var homing_shot_lifespan: float = 10.0
@export var projectile_muzzle_vfx: VFXEffect
