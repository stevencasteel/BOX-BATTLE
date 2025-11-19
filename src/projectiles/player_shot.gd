# res://src/projectiles/player_shot.gd
class_name PlayerShot
extends BaseProjectile

# Per-projectile tuneable default (Inspector-friendly).
@export var default_speed: float = 1000.0

@onready var flame_trail: GPUParticles2D = %FlameTrail

func _ready() -> void:
	super._ready()


# Ensure the speed is set every time this instance is (re)activated by the pool.
func activate(p_dependencies: Dictionary) -> void:
	# First let the base class do its activation
	super.activate(p_dependencies)
	# Then apply player-shot-specific runtime defaults so they apply on reuse.
	speed = default_speed
	
	if is_instance_valid(flame_trail):
		flame_trail.restart()
		flame_trail.emitting = true


func deactivate() -> void:
	if is_instance_valid(flame_trail):
		flame_trail.emitting = false
	super.deactivate()


func _on_area_entered(area: Area2D) -> void:
	if not _is_active:
		return
	# Player shots can destroy enemy projectiles on contact.
	if area.is_in_group(Identifiers.Groups.ENEMY_PROJECTILE):
		if is_instance_valid(_object_pool):
			_object_pool.return_instance.call_deferred(area)

	# Then proceed with the base collision handling.
	super._on_area_entered(area)
