# res://src/projectiles/turret_shot.gd
class_name TurretShot
extends BaseProjectile


func _ready() -> void:
	super._ready()
	add_to_group(Identifiers.Groups.ENEMY_PROJECTILE)
