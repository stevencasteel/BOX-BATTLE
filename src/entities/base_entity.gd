# src/entities/base_entity.gd
@tool
## The generic base class for all component-based entities in the game.
class_name BaseEntity
extends CharacterBody2D

# --- Editor Properties ---
@export var archetype: EntityArchetype

# --- Public Member Variables ---
@warning_ignore("unused_private_class_variable")
var _is_dead: bool = false

# --- Private Member Variables ---
var _components_initialized: bool = false
var _services
var _components: Dictionary = {}
var _components_by_interface: Dictionary = {}
var _player: CharacterBody2D


# --- Godot Lifecycle Methods ---
func _ready() -> void:
	if Engine.is_editor_hint():
		return
	_build_from_archetype()
	if not Engine.is_editor_hint():
		_player = get_tree().get_first_node_in_group(Identifiers.Groups.PLAYER)

func _notification(what: int) -> void:
	if what == NOTIFICATION_PREDELETE:
		teardown()


# --- Public Methods ---

## The main entry point for self-construction.
func build_entity() -> void:
	_services = ServiceLocator
	_on_build() 


## Retrieves a component from this entity by its script type or an interface it implements.
func get_component(type: Script) -> IComponent:
	if _components.has(type):
		return _components.get(type)

	if _components_by_interface.has(type):
		return _components_by_interface.get(type)

	return null


## Helper that asserts and provides a clear error if a required component is missing.
func require_component(type: Script) -> IComponent:
	var c = get_component(type)
	if not is_instance_valid(c):
		push_error("Missing required component: %s on entity %s" % [type.resource_path, name])
	return c


func inject_dependencies(p_services) -> void:
	_services = p_services


func teardown() -> void:
	# Auto-disconnect HealthComponent signals to prevent memory leaks
	var hc = get_component(HealthComponent)
	if is_instance_valid(hc):
		if hc.died.is_connected(_on_entity_died):
			hc.died.disconnect(_on_entity_died)
		if hc.health_changed.is_connected(_on_health_changed):
			hc.health_changed.disconnect(_on_health_changed)

	for child in get_children():
		if child is IComponent:
			child.teardown()


func setup_components(
	shared_dependencies: Dictionary = {}, per_component_dependencies: Dictionary = {}
) -> void:
	if _components_initialized:
		return

	var base_shared_deps = shared_dependencies.duplicate()
	
	# ISP: Deconstruct ServiceLocator so components can request specific interfaces
	var s = _services if _services else ServiceLocator
	base_shared_deps["services"] = s # Legacy support
	base_shared_deps["event_bus"] = s.event_bus
	base_shared_deps["fx_manager"] = s.fx_manager
	base_shared_deps["object_pool"] = s.object_pool
	base_shared_deps["combat_utils"] = s.combat_utils
	base_shared_deps["grid_utils"] = s.grid_utils
	base_shared_deps["audio_manager"] = AudioManager # Autoload

	for child in get_children():
		if not (child is IComponent):
			continue

		var class_key: String = child.get_script().get_global_name()

		if child.has_meta("REQUIRED_DEPS"):
			var required = child.get_meta("REQUIRED_DEPS")
			var all_deps_for_check = base_shared_deps.duplicate()
			if per_component_dependencies.has(child):
				all_deps_for_check.merge(per_component_dependencies[child])
			
			if per_component_dependencies.has(class_key):
				all_deps_for_check.merge(per_component_dependencies[class_key])

			if not DependencyValidator.validate(child, all_deps_for_check, required):
				push_error("Dependency validation failed for %s. Aborting entity setup." % child.name)
				return

		var merged_deps := base_shared_deps.duplicate()

		if per_component_dependencies.has(child):
			merged_deps.merge(per_component_dependencies[child])

		if per_component_dependencies.has(class_key):
			merged_deps.merge(per_component_dependencies[class_key])

		if child.has_method("setup"):
			child.setup(self, merged_deps)

	# NEW: Auto-wire common components after setup
	var hc = get_component(HealthComponent)
	if is_instance_valid(hc):
		if not hc.died.is_connected(_on_entity_died):
			hc.died.connect(_on_entity_died)
		if not hc.health_changed.is_connected(_on_health_changed):
			hc.health_changed.connect(_on_health_changed)

	_components_initialized = true


# --- Protected Virtual Methods (for children to override) ---

func _on_build() -> void:
	pass

# Virtual signal handlers
func _on_entity_died() -> void:
	pass

func _on_health_changed(_current: int, _max: int) -> void:
	pass


# --- Private Methods ---
func _build_from_archetype() -> void:
	if not is_instance_valid(archetype):
		push_error("Entity '%s' is missing its Archetype resource." % name)
		return

	for component_scene in archetype.components:
		if is_instance_valid(component_scene):
			var component_instance = component_scene.instantiate()
			add_child(component_instance)
		else:
			push_warning("Archetype for '%s' contains an invalid component scene." % name)

	_cache_components_by_type()


func _cache_components_by_type() -> void:
	_components.clear()
	_components_by_interface.clear()
	
	for child in get_children():
		if not child is IComponent:
			continue

		var component_script: Script = child.get_script()
		_components[component_script] = child
		
		var base_script: Script = component_script.get_base_script()
		while is_instance_valid(base_script):
			if base_script.resource_path.is_empty() or base_script == IComponent:
				break
			_components_by_interface[base_script] = child
			base_script = base_script.get_base_script()
