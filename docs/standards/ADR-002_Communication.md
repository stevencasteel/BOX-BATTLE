# ADR-002: Communication Patterns

**Decision:** Strict separation between Local (Signal) and Global (EventBus) communication.

## 1. Local: Godot Signals
**Scope:** Inside a single scene (`.tscn`) or Parent-Child relationship.
*   **Child -> Parent:** Component emits signal (`hit_confirmed`), Parent listens.
*   **Parent -> Child:** Parent calls method on Child (`component.activate()`).
*   **Rule:** If they share a scene file, use Signals.

## 2. Global: EventBus
**Scope:** Between decoupled systems that should not reference each other.
*   **Entity -> UI:** Player emits `health_changed`, HUD listens.
*   **System -> System:** Encounter emits `boss_spawned`, MusicManager listens.
*   **Rule:** If the sender doesn't know the receiver exists, use EventBus.

## Litmus Test
*   Is `node_a` a child of `node_b`? -> **Signal/Method Call**.
*   Is `node_a` communicating with a singleton or a totally different scene? -> **EventBus**.