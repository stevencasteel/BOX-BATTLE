# src/shared/types/input_frame.gd
class_name InputFrame
extends RefCounted

var move_axis: float = 0.0
var up: bool = false
var down: bool = false

# Jump
var jump_just_pressed: bool = false
var jump_pressed: bool = false # Previously "jump_held"
var jump_released: bool = false

# Attack
var attack_just_pressed: bool = false
var attack_pressed: bool = false
var attack_released: bool = false

# Dash
var dash_pressed: bool = false
