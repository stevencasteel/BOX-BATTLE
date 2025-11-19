# src/entities/player/data/player_physics_data.gd
@tool
class_name PlayerPhysicsData
extends Resource

# --- State ---
var facing_direction: int = 1
var air_jumps_left: int = 0
var last_wall_normal: Vector2 = Vector2.ZERO
var velocity: Vector2 = Vector2.ZERO # Cached velocity for some state calculations

# --- Flags ---
var can_dash: bool = true

# --- Timers ---
var coyote_timer: float = 0.0
var wall_coyote_timer: float = 0.0
var dash_duration_timer: float = 0.0
var dash_cooldown_timer: float = 0.0
var knockback_timer: float = 0.0
