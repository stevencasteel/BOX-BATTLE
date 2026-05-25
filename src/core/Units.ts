export const UNITS = {
  // Core Gameplay Balancing Parameters
  PLAYER_MAX_HP: 5,
  BOSS_MAX_HP: 38,
  BOSS_PHASE_2_HP_PCT: 0.70,
  BOSS_PHASE_3_HP_PCT: 0.40,

  // World space coordinates (1 World Unit = 1 Pixel)
  WORLD_SIZE: 1250,
  WORLD_HALF_SIZE: 625,

  // Audio spatialization parameters
  AUDIO_MAX_PAN_SCALE: 0.45,

  // Spatial hashing configuration
  SPATIAL_GRID_CELL_SIZE: 250,

  // Physics sub-stepping and tolerances
  CCD_STEP_LIMIT_DEFAULT: 6,
  CCD_STEP_LIMIT_PROJECTILE: 5,
  GROUND_DETECTION_OFFSET: 1,
  CORNER_NUDGE_MAX_OVERLAP: 6,
  BROAD_PHASE_PADDING_STANDARD: 12,
  BROAD_PHASE_PADDING_LARGE: 24,

  // Canonical timing values (Seconds)
  ENGINE_TICK_RATE_HZ: 60,
  CANONICAL_DELTA_TIME: 1 / 60,

  // Combat range bounds
  MELEE_MAX_REACH: 95,
  MELEE_CLOSE_RANGE_THRESHOLD: 75,
  MELEE_SIDE_OFFSET: 35,
  MELEE_VERTICAL_OFFSET: 35,
  MELEE_SWEEP_INNER_RADIUS: 25,

  // Downward attack (pogo) hitbox dimensions
  POGO_HITBOX_WIDTH: 90,
  POGO_HITBOX_HEIGHT: 44.5,
  POGO_HITBOX_Y_OFFSET: 40,
  POGO_HITBOX_X_OFFSET: -45,
} as const;
