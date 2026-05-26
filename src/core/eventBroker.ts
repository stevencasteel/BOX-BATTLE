export type GameEventMap = {
  PLAYER_HURT: { amount: number; currentHealth: number; maxHealth: number };
  BOSS_HURT: { amount: number; currentHealth: number; maxHealth: number; sourceX: number; sourceY: number; intensity: number };
  MINION_HURT: { id: string; amount: number; currentHealth: number; maxHealth: number; sourceX: number; sourceY: number; intensity: number };
  PLAYER_HEALED: { amount: number; currentHealth: number; maxHealth: number };
  PLAYER_JUMPED: void;
  PLAYER_DASHED: { direction: number };
  PLAYER_POGOED: void;
  PLAYER_ATTACKED: { direction: "side" | "up" | "down" };
  PLAYER_PROJECTILE_FIRED: { level: 1 | 2 };
  HEALING_CHARGES_CHANGED: { charges: number };
  DETERMINATION_CHANGED: { determination: number };
  DIALOGUE_TRIGGERED: { speaker: "player" | "boss"; text: string };
  CAMERA_SHAKE: { amplitude: number; duration: number };
  HIT_STOP: { duration: number };
  BOSS_DEFEATED: { x: number; y: number };
  GAME_OVER: void;
  VICTORY: void;
  CLEAR_DIALOGUES: void;
  SPAWN_SPARKS: { x: number; y: number; angle: number; color?: string; radial?: boolean; count?: number };
  SPAWN_DUST: { x: number; y: number };
  SPAWN_BLAST: { x: number; y: number; color: string };
  PLAYER_LANDED: void;
  HEAL_START: void;
  HEAL_CANCEL: void;
  HEAL_COMPLETE: void;
  PLAYER_SPIKED: void;
  BOSS_PHASE_SHIFT: void;
  MINION_SPAWNING: void;
  MINION_DISSOLVING: void;
  PLAYER_DASH_RECHARGED: void;
  BOSS_SWIPED: void;
  BOSS_TELEGRAPH: void;
  BOSS_LUNGED: void;
  CHARGE_START: void;
  CHARGE_UPDATE: { timer: number };
  CHARGE_STOP: void;
  CHARGE_MAXED: void;
  REQUEST_RETRY: void;
  REQUEST_MENU: void;
};

export type EventCallback<T> = (payload: T) => void;

class EventBroker {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private listeners: { [K in keyof GameEventMap]?: Set<EventCallback<any>> } = {};

  public subscribe<K extends keyof GameEventMap>(event: K, callback: EventCallback<GameEventMap[K]>): () => void {
    if (!this.listeners[event]) {
      this.listeners[event] = new Set();
    }
    const set = this.listeners[event]!;
    set.add(callback);
    return () => {
      this.listeners[event]?.delete(callback);
    };
  }

  public publish<K extends keyof GameEventMap>(event: K, payload: GameEventMap[K]): void {
    const set = this.listeners[event];
    if (set) {
      set.forEach((cb) => cb(payload));
    }
  }

  public clear(): void {
    this.listeners = {};
  }
}

export const eventBroker = new EventBroker();
