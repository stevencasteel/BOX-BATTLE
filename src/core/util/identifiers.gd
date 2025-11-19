# src/core/util/identifiers.gd
@tool
## An autoloaded singleton that provides a central authority for all string-based
## identifiers used in the project.
extends Node

## A container for all physics group names.
class Groups:
	const PLAYER = "player"
	const ENEMY = "enemy"
	const WORLD = "world"
	const HAZARD = "hazard"
	const ONEWAY_PLATFORMS = "oneway_platforms"
	const PLAYER_PROJECTILE = "player_projectile"
	const ENEMY_PROJECTILE = "enemy_projectile"
	const SENSORS = "sensors"
	const DAMAGEABLE = "damageable"

## A container for all ObjectPool keys.
class Pools:
	const PLAYER_SHOTS = &"player_shots"
	const BOSS_SHOTS = &"boss_shots"
	const MINION_SHOTS = &"minion_shots"
	const HOMING_BOSS_SHOTS = &"homing_boss_shots"
	const HIT_SPARKS = &"hit_sparks"

## A container for all Input Map action names.
class Actions:
	# Gameplay
	const MOVE_LEFT = "ui_left"
	const MOVE_RIGHT = "ui_right"
	const MOVE_UP = "ui_up"
	const MOVE_DOWN = "ui_down"
	const JUMP = "ui_jump"
	const ATTACK = "ui_attack"
	const DASH = "ui_dash"
	
	# UI / System
	const UI_ACCEPT = "ui_accept"
	const UI_CANCEL = "ui_cancel"
	const PAUSE = "debug_pause_game" # Often mapped to Start/Esc

	# Debug
	const DEBUG_OVERLAY = "debug_toggle_overlay"
	const DEBUG_CYCLE_TARGET = "debug_cycle_target"
	const DEBUG_DIALOGUE = "debug_dialogue"
	const DEBUG_COLLISION = "debug_toggle_collision"
	const DEBUG_INVINCIBILITY = "debug_toggle_invincibility"

## Shared state keys used by multiple entity types.
class CommonStates:
	const IDLE = &"idle"
	const PATROL = &"patrol"
	const MELEE = &"melee"
	const ATTACK = &"attack"
	const FALL = &"fall"

## Container for all Player state keys.
class PlayerStates:
	const MOVE = &"move"
	const JUMP = &"jump"
	const FALL = &"fall"
	const DASH = &"dash"
	const WALL_SLIDE = &"wall_slide"
	const ATTACK = &"attack"
	const HURT = &"hurt"
	const HEAL = &"heal"
	const POGO = &"pogo"

## Container for all Boss state keys.
class BossStates:
	const IDLE = &"idle"
	const ATTACK = &"attack"
	const COOLDOWN = &"cooldown"
	const PATROL = &"patrol"
	const LUNGE = &"lunge"
	const FALL = &"fall"

## Container for all Minion state keys.
class MinionStates:
	const IDLE = &"idle"
	const ATTACK = &"attack"
	const FALL = &"fall"
