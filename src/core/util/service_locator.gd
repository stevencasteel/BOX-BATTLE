# src/core/util/service_locator.gd
## A central, autoloaded singleton that provides clean, type-safe access
## to all other core systems (services).
extends Node

# --- Constants ---
const PLAYER_CONFIG = preload("res://src/data/player_config.tres")
const ENEMY_CONFIG = preload("res://src/data/enemy_config.tres")
const WORLD_CONFIG = preload("res://src/data/world_config.tres")

# --- Service References ---
@onready var fx_manager: IFXManager = get_node("/root/FXManagerAdapter")
@onready var object_pool: IObjectPool = get_node("/root/ObjectPoolAdapter")
@onready var targeting_system = get_node("/root/TargetingSystem")
@onready var save_manager = get_node("/root/SaveManager")
@onready var event_bus = get_node("/root/EventBus")
@onready var sequencer = get_node("/root/Sequencer")
@onready var combat_utils = get_node("/root/CombatUtils")
@onready var grid_utils = get_node("/root/GridUtils")

# --- Public Properties ---
var player_config: PlayerConfig = PLAYER_CONFIG
var enemy_config: EnemyConfig = ENEMY_CONFIG
var world_config: WorldConfig = WORLD_CONFIG
