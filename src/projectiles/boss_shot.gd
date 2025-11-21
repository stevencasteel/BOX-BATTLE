# res://src/projectiles/boss_shot.gd
class_name BossShot
extends BaseProjectile


func _ready() -> void:
	super._ready()
	add_to_group(Identifiers.Groups.ENEMY_PROJECTILE)
