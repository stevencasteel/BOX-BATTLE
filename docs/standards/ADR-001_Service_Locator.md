# ADR-001: Global Service Access

**Decision:** Use Godot **Autoloads** as a Service Locator for global systems.

## The Pattern
1.  **Global Registry:** Core systems (`EventBus`, `ObjectPool`, `FXManager`) are registered as Autoloads in `project.godot`.
2.  **Central Access:** A `ServiceLocator` autoload provides typed access to these systems.
3.  **Injection:** Entities and Components **MUST NOT** call autoloads directly (e.g., `EventBus.emit`).
    *   **Entities** receive the `ServiceLocator` via `EntityBuilder` or `Spawner`.
    *   **Components** receive dependencies via `setup(owner, dependencies)`.

## Rationale
*   **Pros:** Idiomatic to Godot, performant, avoids complex DI frameworks.
*   **Cons:** Hidden dependencies if not injected.
*   **Mitigation:** Strict adherence to the "Owner-Driven Injection" pattern.