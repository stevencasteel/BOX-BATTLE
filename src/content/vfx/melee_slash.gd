# src/content/vfx/melee_slash.gd
extends Node2D

@onready var sprite = $Sprite2D

func setup(size: Vector2, duration: float) -> void:
	# Texture is 1x1, so scale matches desired pixel size
	sprite.scale = size
	
	var tween = create_tween()
	# Fade alpha to 0
	tween.tween_property(sprite, "modulate:a", 0.0, duration).set_trans(Tween.TRANS_CUBIC).set_ease(Tween.EASE_IN)
	tween.tween_callback(queue_free)
