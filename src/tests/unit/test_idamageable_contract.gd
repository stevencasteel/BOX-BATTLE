# src/tests/unit/test_idamageable_contract.gd
extends GutTest

# --- Constants & Preloads ---
const HealthComponent = preload("res://src/entities/_base/components/health_component.gd")
const StatusEffectComponent = preload("res://src/entities/_base/components/status_effect_component.gd") # FIX
const FakeDamageable = preload("res://src/tests/fakes/fake_damageable.gd")
const PlayerStateData = preload("res://src/entities/player/data/player_state_data.gd")
const DamageInfo = preload("res://src/shared/types/damage_info.gd")
const FakeServiceLocator = preload("res://src/tests/fakes/fake_service_locator.gd")
const FakeEventBus = preload("res://src/tests/fakes/fake_event_bus.gd")
const IFXManager = preload("res://src/shared/interfaces/IFXManager.gd")
const DamageResponseConfig = preload("res://src/core/data/config/damage_response_config.gd")

# --- Test Internals ---
var _mock_owner: CharacterBody2D
var _fake_services: FakeServiceLocator
var _fx_manager_double

# --- Test Lifecycle ---
func before_each():
	_mock_owner = CharacterBody2D.new()
	add_child_autofree(_mock_owner)
	
	_fake_services = FakeServiceLocator.new()
	
	# FIX: Setup mocks
	_fake_services.mock_event_bus = FakeEventBus.new()
	add_child_autofree(_fake_services.mock_event_bus)
	
	_fx_manager_double = double(IFXManager).new()
	stub(_fx_manager_double, "play_vfx").to_do_nothing()
	add_child_autofree(_fx_manager_double)
	_fake_services.mock_fx_manager = _fx_manager_double
	
	add_child_autofree(_fake_services)

# --- The Contract Test Suite ---

func _run_contract_tests(damageable: IDamageable, name: String) -> void:
	# Contract Rule 1: It must return a valid DamageResult object.
	var result = damageable.apply_damage(DamageInfo.new())
	assert_is(result, DamageResult, "Contract Failure (%s): apply_damage must return a DamageResult." % name)
	
	# Contract Rule 2: It must not crash when given a null DamageInfo.
	var null_result = damageable.apply_damage(null)
	assert_is(null_result, DamageResult, "Contract Failure (%s): Must handle null DamageInfo gracefully." % name)


# --- The Tests ---

func test_health_component_fulfills_contract():
	var health_comp = HealthComponent.new()
	_mock_owner.add_child(health_comp)
	
	# FIX: Add required StatusEffectComponent
	var status_comp = StatusEffectComponent.new()
	_mock_owner.add_child(status_comp)
	
	var data = PlayerStateData.new()
	data.max_health = 10
	
	var dmg_config = DamageResponseConfig.new()
	
	var deps = {
		"data_resource": data,
		"config": preload("res://src/data/player_config.tres"),
		"services": _fake_services,
		"hit_spark_effect": preload("res://src/core/data/effects/player_hit_spark_effect.tres"),
		# FIX: Explicitly provide new required dependencies
		"fx_manager": _fake_services.fx_manager,
		"event_bus": _fake_services.event_bus,
		"damage_config": dmg_config,
		"status_effect_component": status_comp
	}
	health_comp.setup(_mock_owner, deps)
	
	_run_contract_tests(health_comp, "HealthComponent")


func test_fake_damageable_fulfills_contract():
	var fake_damageable = FakeDamageable.new()
	_mock_owner.add_child(fake_damageable)
	
	_run_contract_tests(fake_damageable, "FakeDamageable")
