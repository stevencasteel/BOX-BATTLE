# src/combat/attack_logic/projectile_logic.gd
@tool
## Concrete AttackLogic for firing one or more projectiles via the ProjectileShooterComponent.
class_name ProjectileLogic
extends AttackLogic


func get_telegraph_info(owner: BaseEntity, _pattern: AttackPattern) -> Dictionary:
	var facing_direction: float = owner.entity_data.facing_direction if "facing_direction" in owner.entity_data else 1.0
	return {"size": Vector2(100, 100), "offset": Vector2(facing_direction * 75, 0)}


func execute(owner: BaseEntity, pattern: AttackPattern) -> Callable:
	# Fetch the new component
	var shooter: ProjectileShooterComponent = owner.get_component(ProjectileShooterComponent)
	
	if not is_instance_valid(shooter):
		push_warning("ProjectileLogic: Entity '%s' lacks a ProjectileShooterComponent." % owner.name)
		return Callable()

	if pattern.projectile_count <= 1:
		return shooter.fire_shot_at_player.bind()
	else:
		return shooter.fire_volley.bind(pattern.projectile_count, pattern.volley_delay)
