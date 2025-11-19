# src/entities/player/states/state_heal.gd
# Handles the player's healing state.
extends BaseState

const AURA_SCENE = preload("res://src/vfx/aura_heal_purple.tscn")

var _aura_instance: Node2D
var _tween: Tween

func enter(_msg := {}):
	owner.velocity = Vector2.ZERO
	# UPDATE: config.heal_duration
	var duration = state_data.config.heal_duration
	owner.healing_timer.start(duration)

	# Visuals: Start small and ramp up
	_aura_instance = AURA_SCENE.instantiate()
	owner.add_child(_aura_instance)
	# Position near feet/center
	_aura_instance.position = Vector2(0, 0) 
	_aura_instance.scale = Vector2(0.2, 0.2)
	
	# FIX: Call create_tween() on the owner (Node), not self (Object)
	_tween = owner.create_tween()
	# Tween scale to represent growing power
	_tween.tween_property(_aura_instance, "scale", Vector2(1.0, 1.0), duration).set_trans(Tween.TRANS_CUBIC).set_ease(Tween.EASE_IN)


func exit():
	owner._cancel_heal()
	if is_instance_valid(_tween):
		_tween.kill()
	if is_instance_valid(_aura_instance):
		_aura_instance.queue_free()


func process_physics(_delta: float):
	if (
		not Input.is_action_pressed("ui_down")
		or not Input.is_action_pressed("ui_jump")
		or not is_zero_approx(owner.velocity.x)
		or not owner.is_on_floor()
	):
		state_machine.change_state(Identifiers.PlayerStates.MOVE)
