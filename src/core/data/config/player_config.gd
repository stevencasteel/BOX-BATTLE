# src/core/data/config/player_config.gd
@tool
## A configuration resource for Player-specific stats and tuning.
class_name PlayerConfig
extends Resource

@export_group("Health & Resources")
@export_range(1, 20, 1) var max_health: int = 5
@export_range(1, 10, 1) var max_healing_charges: int = 1
@export_range(0.1, 5.0, 0.1) var heal_duration: float = 2.0
@export_range(1, 100, 1) var determination_per_charge: int = 10

## Configuration for how the player reacts to taking damage (Invincibility, Knockback force).
@export var damage_response: DamageResponseConfig

## How long the player loses control when hurt (StateHurt duration).
@export_range(0.05, 0.5, 0.01) var knockback_duration: float = 0.1

@export_group("Movement & Physics")
@export_range(100, 1000, 5) var move_speed: float = 450.0
@export_range(200, 1500, 10) var jump_force: float = 680.0
@export_range(0.1, 1.0, 0.05) var jump_release_dampener: float = 0.4
@export_range(0.0, 0.5, 0.01) var coyote_time: float = 0.1
@export_range(0.0, 0.5, 0.01) var jump_buffer: float = 0.1
@export_range(1.0, 3.0, 0.1) var fast_fall_gravity_multiplier: float = 1.4
@export var max_air_jumps: int = 1

@export_group("Wall Interaction")
@export_range(50, 500, 5) var wall_slide_speed: float = 120.0
@export_range(0.0, 0.5, 0.01) var wall_coyote_time: float = 0.05
@export_range(500, 2500, 50) var wall_jump_force_x: float = 1650.0
@export_range(200, 1500, 10) var wall_jump_force_y: float = 680.0

@export_group("Dash")
@export_range(500, 2500, 50) var dash_speed: float = 1400.0
@export_range(0.05, 0.5, 0.01) var dash_duration: float = 0.15
@export_range(0.1, 2.0, 0.05) var dash_cooldown: float = 0.5

@export_group("Combat")
@export var forward_attack_shape: Shape2D
@export var upward_attack_shape: Shape2D
@export_range(0.05, 1.0, 0.01) var attack_cooldown: float = 0.12
@export_range(0.05, 0.5, 0.01) var attack_duration: float = 0.1
@export_range(100, 5000, 100) var attack_friction: float = 2000.0
@export_range(0.1, 1.0, 0.01) var charge_time: float = 0.35
@export_range(200, 1000, 10) var pogo_force: float = 450.0
@export_range(10, 200, 5) var close_range_threshold: float = 75.0
