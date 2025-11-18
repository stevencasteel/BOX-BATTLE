# STYLE-001: GDScript Style Guide

**Decision:** Strict adherence to Godot Style Guide + Static Typing + Docstrings.

## File Structure
1.  **Header:** `# res://path/to/script.gd`
2.  **Docstring:** `## High-level purpose of class.`
3.  **Definition:** `class_name MyClass extends BaseClass`
4.  **Members:**
    *   Signals
    *   Enums
    *   Constants (`UPPER_SNAKE_CASE`)
    *   Export Vars (`@export_group` required)
    *   Public Vars
    *   Private Vars (`_snake_case`)
5.  **Methods:**
    *   `_init` / `_ready` / `_process`
    *   Public Methods (`snake_case`)
    *   Private Methods (`_snake_case`)
    *   Signal Handlers (`_on_signal_name`)

## Rules
1.  **Static Typing:** ALL variables and functions must have types.
    *   `func my_func(a: int) -> void:`
    *   `var health: int = 10`
2.  **Private Prefix:** Internal variables/functions must start with `_`.
3.  **Documentation:** Use `##` for class and public function documentation (Tooltip support).
4.  **No Magic Numbers:** Move literals to `CombatConfig` or `Constants`.