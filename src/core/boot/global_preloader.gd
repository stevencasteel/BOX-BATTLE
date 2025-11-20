# src/core/boot/global_preloader.gd
## A central autoload script whose sole purpose is to preload all interface
## and critical base class scripts in the project. This ensures their 'class_name'
## is registered with Godot's ScriptServer before any other script tries to use them,
## resolving parse order errors.
extends Node

func _ready() -> void:
	# Preload all interfaces and critical base classes to register them globally.
	preload("res://src/shared/interfaces/IComponent.gd")
	preload("res://src/shared/interfaces/IDamageable.gd")
	preload("res://src/shared/interfaces/IPoolable.gd")
	preload("res://src/shared/interfaces/ISceneController.gd")
	preload("res://src/shared/interfaces/IFXManager.gd")
	preload("res://src/shared/interfaces/IObjectPool.gd")
	
	# Input System (DIP)
	preload("res://src/shared/interfaces/IInputProvider.gd")
	preload("res://src/core/systems/input/standard_input_provider.gd")

	preload("res://src/entities/_base/scripts/base_entity.gd")
	preload("res://src/entities/_base/components/hurtbox_component.gd")
	preload("res://src/entities/_base/components/hitbox_component.gd")
	preload("res://src/entities/_base/components/sensor_component.gd")
	preload("res://src/core/data/audio/audio_cue.gd")
