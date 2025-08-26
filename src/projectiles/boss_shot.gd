# res://src/projectiles/boss_shot.gd
class_name BossShot
extends "res://src/projectiles/base_projectile.gd"


func _ready() -> void:
	visual.color = Palette.COLOR_HAZARD_PRIMARY
	add_to_group(Identifiers.Groups.ENEMY_PROJECTILE)


# --- Overridden Signal Handlers ---

# By removing the _on_body_entered and _on_area_entered functions from this script,
# we allow the parent BaseProjectile class to handle them. The parent class now contains
# the correct logic that uses the new dependency injection system.
