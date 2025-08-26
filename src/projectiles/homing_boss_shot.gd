# src/projectiles/homing_boss_shot.gd
class_name HomingBossShot
extends BaseProjectile

# --- Private Member Variables ---
var _player_ref: WeakRef
var _active_tween: Tween
var _pending_start_on_screen: bool = false

const FALLBACK_WAIT_SECONDS := 0.05


func _ready() -> void:
	super._ready() # Important to call the parent's _ready to create the timer.
	add_to_group(Identifiers.Groups.ENEMY_PROJECTILE)
	visual.color = Palette.COLOR_HAZARD_PRIMARY


func _move(delta: float) -> void:
	if not _player_ref or not _player_ref.get_ref():
		super._move(delta) # Default non-homing movement
		return

	var player_node: Node = _player_ref.get_ref()
	var direction_to_player: Vector2 = (player_node.global_position - global_position).normalized()
	rotation = lerp_angle(rotation, direction_to_player.angle(), 0.05)
	global_position += transform.x * speed * delta


func activate(p_dependencies: Dictionary) -> void:
	super.activate(p_dependencies)
	
	_player_ref = p_dependencies.get("player_ref")
	assert(is_instance_valid(_player_ref), "HomingBossShot requires a 'player_ref' dependency.")

	if is_instance_valid(_active_tween):
		_active_tween.kill()
		_active_tween = null

	visual.scale = Vector2.ONE
	collision_shape.scale = Vector2.ONE

	call_deferred("_maybe_schedule_shrink")


func deactivate() -> void:
	if is_instance_valid(_active_tween):
		_active_tween.kill()
		_active_tween = null

	visual.scale = Vector2.ONE
	collision_shape.scale = Vector2.ONE

	_pending_start_on_screen = false
	_player_ref = null
	super.deactivate()


func _screen_entered_hook() -> void:
	if _pending_start_on_screen:
		_pending_start_on_screen = false
		_start_shrink_tween()


func _maybe_schedule_shrink() -> void:
	if not _is_active:
		return

	await get_tree().process_frame

	if not _is_active:
		return

	if _has_been_on_screen:
		_start_shrink_tween()
		return

	_pending_start_on_screen = true

	var timer: SceneTreeTimer = get_tree().create_timer(FALLBACK_WAIT_SECONDS)
	await timer.timeout

	if _pending_start_on_screen and _is_active:
		_pending_start_on_screen = false
		_start_shrink_tween()


func _start_shrink_tween() -> void:
	if not _is_active:
		return

	if is_instance_valid(_active_tween):
		_active_tween.kill()

	_active_tween = create_tween()
	_active_tween.set_trans(Tween.TRANS_LINEAR).set_ease(Tween.EASE_IN_OUT)
	_active_tween.tween_property(visual, "scale", Vector2.ZERO, lifespan)
	_active_tween.tween_property(collision_shape, "scale", Vector2.ZERO, lifespan)
