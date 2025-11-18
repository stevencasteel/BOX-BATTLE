# src/entities/minions/movement_logic/movement_logic.gd
@tool
## The abstract base class for all entity movement strategies.
## Defines the contract for how an entity's velocity is calculated each frame.
class_name MovementLogic
extends Resource

## Calculates and returns the entity's velocity for the current physics frame.
## @param delta: The time elapsed since the last physics frame.
## @param entity: A reference to the BaseEntity executing this logic.
## @param data: The shared state data resource (BossStateData or MinionStateData).
## @return: The calculated velocity vector for the current frame.
func execute(_delta: float, _entity: BaseEntity, _data: Resource) -> Vector2:
	push_warning("MovementLogic.execute() was called but not overridden by the implementer.")
	return Vector2.ZERO