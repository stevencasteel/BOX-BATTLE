# src/entities/player/components/heal_component.gd
@tool
class_name HealComponent
extends IComponent

# --- Signals ---
## Emitted when the healing channel completes successfully.
signal healing_complete

# --- Constants ---
const JumpHelper = preload("res://src/entities/player/components/player_jump_helper.gd")

# --- Dependencies ---
var _owner_node: CharacterBody2D
var _p_data: PlayerStateData
var _resource_component: PlayerResourceComponent
var _event_bus: EventBus
var _input_component: InputComponent
var _state_machine: BaseStateMachine

# --- Internals ---
var _timer: Timer

func _ready() -> void:
	# Run before JumpComponent (0) to intercept Down+Jump
	process_priority = -1

func setup(p_owner: Node, p_dependencies: Dictionary = {}) -> void:
	_owner_node = p_owner as CharacterBody2D
	_p_data = p_dependencies.get("data_resource")
	_resource_component = p_dependencies.get("resource_component")
	_event_bus = p_dependencies.get("event_bus")
	
	# Resolve sibling components via Owner (standard pattern)
	if _owner_node.has_method("get_component"):
		_input_component = _owner_node.get_component(InputComponent)
		_state_machine = _owner_node.get_component(BaseStateMachine)
	
	# Create the timer dynamically
	_timer = Timer.new()
	_timer.name = "InternalHealingTimer"
	_timer.one_shot = true
	_timer.timeout.connect(_on_timeout)
	add_child(_timer)

func teardown() -> void:
	if is_instance_valid(_timer):
		_timer.stop()
		_timer.queue_free()
	_owner_node = null
	_p_data = null
	_resource_component = null
	_event_bus = null
	_input_component = null
	_state_machine = null

# --- Physics Process (Input Polling) ---

func _physics_process(_delta: float) -> void:
	if Engine.is_editor_hint() or not is_instance_valid(_owner_node):
		return
		
	# Only allow starting heal from Move/Idle/Fall states (mostly Grounded check covers it)
	# But we specifically check state to avoid re-triggering while already healing or hurting
	var current_state = _state_machine.get_current_state_key()
	if current_state == Identifiers.PlayerStates.HEAL or current_state == Identifiers.PlayerStates.HURT:
		return

	if _input_component.input.jump_just_pressed and _input_component.input.down:
		_try_start_heal()

# --- Public API ---

func start_healing() -> void:
	if not is_instance_valid(_p_data): return
	_timer.start(_p_data.config.heal_duration)

func cancel_healing() -> void:
	if is_instance_valid(_timer):
		_timer.stop()

func is_healing() -> bool:
	return is_instance_valid(_timer) and not _timer.is_stopped()

# --- Private Methods ---

func _try_start_heal() -> void:
	# 1. Check Resources
	if _p_data.combat.healing_charges <= 0:
		return
		
	# 2. Check Physical State (Must be grounded and still)
	if not _owner_node.is_on_floor():
		return
		
	# 3. Check Platform Conflict
	# If we are standing on a one-way platform, Down+Jump means DROP, not HEAL.
	if JumpHelper.is_standing_on_platform(_owner_node):
		return
		
	# 4. Transition
	# Stop momentum
	_owner_node.velocity.x = 0
	_state_machine.change_state(Identifiers.PlayerStates.HEAL)


func _on_timeout() -> void:
	if not is_instance_valid(_p_data):
		return

	# 1. Increment Health
	_p_data.health = min(_p_data.health + 1, _p_data.max_health)
	
	# 2. Consume Resource
	if is_instance_valid(_resource_component):
		_resource_component.consume_healing_charge()
	
	# 3. Emit Global Event (Update HUD)
	if is_instance_valid(_event_bus):
		var ev = PlayerHealthChangedEvent.new()
		ev.current_health = _p_data.health
		ev.max_health = _p_data.max_health
		_event_bus.emit(EventCatalog.PLAYER_HEALTH_CHANGED, ev)
	
	# 4. Spawn VFX
	_spawn_heal_splash()
	
	# 5. Notify State Machine
	healing_complete.emit()

func _spawn_heal_splash() -> void:
	if not is_instance_valid(_owner_node) or not _p_data.config.vfx_heal_splash:
		return
		
	var splash = _p_data.config.vfx_heal_splash.instantiate()
	splash.global_position = _owner_node.global_position
	splash.emitting = true
	
	# Add to the world container (sibling of player)
	_owner_node.add_sibling(splash)
