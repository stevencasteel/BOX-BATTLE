# tools/fx_playground.gd
@tool
extends Node2D

# --- Resources ---
@export var _player_shot_scene: PackedScene
@export var _hit_flash_effect: ShaderEffect
# We will inject the Shockwave effect resource here once created
@export var _shockwave_effect: ShaderEffect 

# --- Nodes ---
@onready var test_subject: ColorRect = %TestSubject
@onready var fx_component: FXComponent = %TestSubject/FXComponent
@onready var post_process_rect: ColorRect = %PostProcessRect
@onready var status_label: Label = %StatusLabel

func _ready() -> void:
	if Engine.is_editor_hint():
		return
		
	# Mock Service Setup for Playground
	# We manually wire the subject's FX component since it's not a full Entity
	var deps = {
		"visual_node": test_subject,
		"fx_manager": ServiceLocator.fx_manager,
		"hit_effect": _hit_flash_effect
	}
	fx_component.setup(test_subject, deps)
	
	# Register camera for shake testing
	ServiceLocator.fx_manager.register_camera_shaker($Camera2D.get_child(0) if $Camera2D.get_child_count() > 0 else null)


func _unhandled_input(event: InputEvent) -> void:
	if event.is_action_pressed("ui_accept"): # Space
		_on_btn_shot_pressed()
	elif event.is_action_pressed("ui_attack"): # C / E
		_on_btn_shockwave_pressed()


func _on_btn_shot_pressed() -> void:
	status_label.text = "Firing Projectile..."
	var shot = _player_shot_scene.instantiate()
	shot.position = $SpawnMarker.position
	
	# Fake the pool/combat deps for the projectile
	var deps = {
		"object_pool": ServiceLocator.object_pool,
		"combat_utils": ServiceLocator.combat_utils
	}
	
	# Manually add to tree (bypassing pool for simple test)
	add_child(shot)
	shot.activate(deps)
	
	# Aim at target
	shot.direction = (test_subject.global_position - shot.global_position).normalized()
	shot.look_at(test_subject.global_position)


func _on_btn_shockwave_pressed() -> void:
	status_label.text = "Shockwave Triggered!"
	if _shockwave_effect:
		# We will implement this in FXManager later
		ServiceLocator.fx_manager.apply_shader_effect(post_process_rect, _shockwave_effect, {}, {})
	else:
		status_label.text = "No Shockwave Resource assigned!"


func _on_btn_flash_pressed() -> void:
	status_label.text = "Hit Flash"
	fx_component.play_effect(_hit_flash_effect)


func _on_btn_slow_mo_toggled(toggled_on: bool) -> void:
	Engine.time_scale = 0.2 if toggled_on else 1.0
	status_label.text = "Time Scale: " + str(Engine.time_scale)
