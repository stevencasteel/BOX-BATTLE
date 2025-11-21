# src/entities/player/states/state_heal.gd
# Handles the player's healing state.
extends BaseState

var _heal_component: HealComponent
var _aura_instance: Node2D
var _tween: Tween

func enter(_msg := {}):
	owner.velocity = Vector2.ZERO
	
	_heal_component = owner.get_component(HealComponent)
	if not is_instance_valid(_heal_component):
		# Safety fallback
		state_machine.change_state(Identifiers.PlayerStates.MOVE)
		return

	# Listen for completion
	if not _heal_component.healing_complete.is_connected(_on_healing_complete):
		_heal_component.healing_complete.connect(_on_healing_complete, CONNECT_ONE_SHOT)

	_heal_component.start_healing()

	# Visuals (Aura)
	var aura_scene = state_data.config.vfx_heal_aura
	if is_instance_valid(aura_scene):
		_aura_instance = aura_scene.instantiate()
		owner.add_child(_aura_instance)
		_aura_instance.position = Vector2(0, 0) 
		_aura_instance.scale = Vector2(0.2, 0.2)
		
		_tween = owner.create_tween()
		_tween.tween_property(_aura_instance, "scale", Vector2(1.0, 1.0), state_data.config.heal_duration)\
			.set_trans(Tween.TRANS_CUBIC).set_ease(Tween.EASE_IN)


func exit():
	# Cancel logic in component (stops timer)
	if is_instance_valid(_heal_component):
		_heal_component.cancel_healing()
		# Disconnect signal if we exited early (e.g. damaged)
		if _heal_component.healing_complete.is_connected(_on_healing_complete):
			_heal_component.healing_complete.disconnect(_on_healing_complete)

	if is_instance_valid(_tween):
		_tween.kill()
	if is_instance_valid(_aura_instance):
		_aura_instance.queue_free()


func process_physics(_delta: float):
	# Interrupt conditions (Movement input)
	if (
		not Input.is_action_pressed("ui_down")
		or not Input.is_action_pressed("ui_jump")
		or not is_zero_approx(owner.velocity.x)
		or not owner.is_on_floor()
	):
		state_machine.change_state(Identifiers.PlayerStates.MOVE)


func _on_healing_complete() -> void:
	state_machine.change_state(Identifiers.PlayerStates.MOVE)
