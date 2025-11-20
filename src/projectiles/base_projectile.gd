# res/src/projectiles/base_projectile.gd
class_name BaseProjectile
extends Area2D

# --- Node References ---
@onready var collision_shape: CollisionShape2D = $CollisionShape2D
# Visual is now resolved dynamically to support Sprites or ColorRects
var visual: CanvasItem 

# --- Public Properties ---
@export var speed: float = 400.0
@export var damage: int = 1
@export var lifespan: float = 5.0 # Default max lifetime for all projectiles
@export var direction: Vector2 = Vector2.RIGHT

# --- Private Member Variables ---
var _object_pool: IObjectPool
var _fx_manager: IFXManager
var _combat_utils
var _is_active: bool = false
var _has_been_on_screen: bool = false
var _lifetime_timer: Timer
var _base_scale: Vector2 = Vector2.ONE

# --- Godot Lifecycle ---
func _ready() -> void:
	# Dynamic visual resolution
	if has_node("ColorRect"):
		visual = $ColorRect
	elif has_node("VisualSprite"):
		visual = $VisualSprite
	
	_base_scale = scale

	# Programmatically create a timer for every projectile instance.
	_lifetime_timer = Timer.new()
	_lifetime_timer.name = "LifetimeTimer"
	_lifetime_timer.one_shot = true
	add_child(_lifetime_timer)
	_lifetime_timer.timeout.connect(_on_lifetime_timer_timeout)


func _physics_process(delta: float) -> void:
	if not _is_active:
		return
	_move(delta)

# --- Virtual Hooks ---
func _move(delta: float) -> void:
	global_position += direction * speed * delta

## A safe "hook" for child classes to add logic without overriding the main function.
func _screen_entered_hook() -> void:
	pass

# --- IPoolable Contract ---
func activate(p_dependencies: Dictionary) -> void:
	_object_pool = p_dependencies.get("object_pool")
	_combat_utils = p_dependencies.get("combat_utils")
	_fx_manager = p_dependencies.get("fx_manager") # Optional dependency
	
	assert(is_instance_valid(_object_pool), "BaseProjectile requires an IObjectPool dependency.")
	assert(is_instance_valid(_combat_utils), "BaseProjectile requires a CombatUtils dependency.")
	
	# Override Damage & Scale if provided
	if p_dependencies.has("damage"):
		damage = p_dependencies.damage
	if p_dependencies.has("scale"):
		scale = p_dependencies.scale

	_has_been_on_screen = false
	visible = true
	_is_active = true
	process_mode = PROCESS_MODE_INHERIT
	_lifetime_timer.start(lifespan)
	
	if is_instance_valid(collision_shape):
		collision_shape.disabled = false

func deactivate() -> void:
	visible = false
	_is_active = false
	process_mode = PROCESS_MODE_DISABLED
	_lifetime_timer.stop()
	
	# Reset Transform
	scale = _base_scale
	
	if is_instance_valid(collision_shape):
		collision_shape.disabled = true
	_object_pool = null
	_combat_utils = null
	_fx_manager = null

# --- Centralized Collision & Cleanup ---
func _handle_collision(target: Node) -> void:
	if target.is_in_group(Identifiers.Groups.SENSORS):
		return

	var damageable: IDamageable = _combat_utils.find_damageable(target)
	if is_instance_valid(damageable):
		var impact_normal = -direction.normalized() if not direction.is_zero_approx() else Vector2.ZERO
		
		# DRY: Use factory method
		var damage_info = _combat_utils.create_damage_info(
			damage,
			self,
			global_position,
			impact_normal
		)
		damageable.apply_damage(damage_info)
	
	_object_pool.return_instance.call_deferred(self)

# --- Timer / On-screen handlers (signal targets) ---
func _on_lifetime_timer_timeout() -> void:
	if not _is_active:
		return
	if is_instance_valid(_object_pool):
		_object_pool.return_instance.call_deferred(self)

func _on_screen_entered() -> void:
	_has_been_on_screen = true
	_screen_entered_hook()

func _on_screen_exited() -> void:
	if not _is_active or not _has_been_on_screen:
		return
	if is_instance_valid(_object_pool):
		_object_pool.return_instance.call_deferred(self)

# --- Signal Handlers ---
func _on_body_entered(body: Node) -> void:
	if not _is_active:
		return
	_handle_collision(body)

func _on_area_entered(area: Area2D) -> void:
	if not _is_active:
		return
	_handle_collision(area)
