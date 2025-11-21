# res/src/projectiles/player_shot.gd
class_name PlayerShot
extends BaseProjectile

# Per-projectile tuneable default (Inspector-friendly).
@export var default_speed: float = 1000.0

@onready var flame_trail: GPUParticles2D = %FlameTrail

var _hit_instances: Dictionary = {}

func _ready() -> void:
	super._ready()


# Ensure the speed is set every time this instance is (re)activated by the pool.
func activate(p_dependencies: Dictionary) -> void:
	# First let the base class do its activation
	super.activate(p_dependencies)
	# Then apply player-shot-specific runtime defaults so they apply on reuse.
	speed = default_speed
	
	_hit_instances.clear()
	
	if is_instance_valid(flame_trail):
		flame_trail.restart()
		flame_trail.emitting = true


func deactivate() -> void:
	if is_instance_valid(flame_trail):
		flame_trail.emitting = false
	_hit_instances.clear()
	super.deactivate()


func _on_area_entered(area: Area2D) -> void:
	if not _is_active:
		return
	
	# Prevent double-processing the same target (e.g. if physics flushes strangely)
	var id = area.get_instance_id()
	if _hit_instances.has(id):
		return
	_hit_instances[id] = true
	
	# CLASH LOGIC: Player shots can destroy enemy projectiles.
	# If we have enough damage (health), we survive the hit.
	if area.is_in_group(Identifiers.Groups.ENEMY_PROJECTILE):
		_handle_projectile_clash(area)
		return # Do NOT call super, as base class would destroy us immediately.

	# Then proceed with the base collision handling for anything else.
	super._on_area_entered(area)


func _handle_projectile_clash(enemy_shot: Area2D) -> void:
	# 1. Determine incoming damage
	var incoming_dmg = 1
	if "damage" in enemy_shot:
		incoming_dmg = enemy_shot.damage
	
	# 2. Spawn Splash Visuals (Clash)
	_spawn_impact_vfx()
	
	# 3. Destroy Enemy Shot (It is consumed by the blast)
	if enemy_shot.has_method("destroy_with_impact"):
		enemy_shot.destroy_with_impact()
	elif enemy_shot.has_method("deactivate") and is_instance_valid(_object_pool):
		_object_pool.return_instance.call_deferred(enemy_shot)
	else:
		enemy_shot.queue_free()
	
	# 4. Apply Damage to Self (Durability)
	damage -= incoming_dmg
	
	# 5. Check Survival
	if damage <= 0:
		if is_instance_valid(_object_pool):
			_object_pool.return_instance.call_deferred(self)
		else:
			queue_free()
	else:
		# Survived with reduced damage
		pass


# Override base collision to ensure VFX spawn before destruction
func _handle_collision(target: Node) -> void:
	# BaseProjectile._handle_collision now handles _spawn_impact_vfx() automatically!
	super._handle_collision(target)
