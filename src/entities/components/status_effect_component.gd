# src/entities/components/status_effect_component.gd
@tool
## Manages temporary status effects (buffs/debuffs) and queryable tags.
## Example: Tracks "Invincibility", "Stun", "DoT".
class_name StatusEffectComponent
extends IComponent

# --- Inner Class for Runtime Tracking ---
class ActiveEffect:
	var source_resource: StatusEffect
	var time_remaining: float
	
	func _init(res: StatusEffect) -> void:
		source_resource = res
		time_remaining = res.duration

# --- Member Variables ---
var _owner_node: Node
var _active_effects: Array[ActiveEffect] = []
var _tags: Dictionary = {} # Map<StringName, int> (Tag -> Count)

# --- Godot Lifecycle ---
func _process(delta: float) -> void:
	if _active_effects.is_empty():
		return
	
	# Iterate backwards to allow safe removal during iteration
	for i in range(_active_effects.size() - 1, -1, -1):
		var active = _active_effects[i]
		
		# Execute Tick Logic (for DoTs/HoTs)
		if active.source_resource.has_method("on_tick"):
			active.source_resource.on_tick(delta, _owner_node, self)
		
		# Handle Duration
		if active.source_resource.duration > 0:
			active.time_remaining -= delta
			if active.time_remaining <= 0:
				_remove_active_effect_at(i)

# --- IComponent Contract ---
func setup(p_owner: Node, _p_dependencies: Dictionary = {}) -> void:
	_owner_node = p_owner

func teardown() -> void:
	# Cleanly remove all effects so they can execute their on_remove logic (cleanup tags)
	for i in range(_active_effects.size() - 1, -1, -1):
		_remove_active_effect_at(i)
	_active_effects.clear()
	_tags.clear()
	_owner_node = null

# --- Public API ---

## Applies a new status effect to the entity.
func apply_effect(effect_res: StatusEffect) -> void:
	if not is_instance_valid(effect_res):
		return
		
	var active = ActiveEffect.new(effect_res)
	_active_effects.append(active)
	
	# Trigger application logic (e.g., adding tags)
	effect_res.on_apply(_owner_node, self)


## Manually removes a specific effect instance.
func remove_effect_instance(effect_res: StatusEffect) -> void:
	for i in range(_active_effects.size() - 1, -1, -1):
		if _active_effects[i].source_resource == effect_res:
			_remove_active_effect_at(i)
			return


## Checks if a specific tag is currently active (Count > 0).
## e.g. has_tag("invincible")
func has_tag(tag: StringName) -> bool:
	return _tags.get(tag, 0) > 0


# --- Tag Management (Called by StatusEffect resources) ---

func add_tag(tag: StringName) -> void:
	if tag == &"": return
	_tags[tag] = _tags.get(tag, 0) + 1

func remove_tag(tag: StringName) -> void:
	if not _tags.has(tag): return
	_tags[tag] -= 1
	if _tags[tag] <= 0:
		_tags.erase(tag)

# --- Private ---

func _remove_active_effect_at(index: int) -> void:
	var active = _active_effects[index]
	if is_instance_valid(active.source_resource):
		active.source_resource.on_remove(_owner_node, self)
	_active_effects.remove_at(index)
