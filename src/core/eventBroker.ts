import { Rectangle } from "./Interfaces";
export type GameEventMap = {
  PLAYER_HURT: { amount: number; currentHealth: number; maxHealth: number };
  BOSS_HURT: { amount: number; currentHealth: number; maxHealth: number; sourceX: number; sourceY: number; intensity: number };
  MINION_HURT: { id: string; amount: number; currentHealth: number; maxHealth: number; sourceX: number; sourceY: number; intensity: number };
  PLAYER_HEALED: { amount: number; currentHealth: number; maxHealth: number };
  PLAYER_JUMPED: void;
  PLAYER_DASHED: { direction: number };
  PLAYER_POGOED: void;
  PLAYER_ATTACKED: { direction: "side" | "up" | "down" };
  PLAYER_PROJECTILE_FIRED: { level: 1 | 2; dirX: number; dirY: number };
  HEALING_CHARGES_CHANGED: { charges: number };
  DETERMINATION_CHANGED: { determination: number };
  DIALOGUE_TRIGGERED: { speaker: "player" | "boss"; text: string };
  CAMERA_SHAKE: { amplitude: number; duration: number };
  HIT_STOP: { duration: number };
  BOSS_DEFEATED: { x: number; y: number };
  GAME_OVER: void;
  VICTORY: void;
  CLEAR_DIALOGUES: void;
  SPAWN_SPARKS: { x: number; y: number; angle: number; color?: string; radial?: boolean; count?: number; turbulence?: number; shape?: "spark" | "line" };
  SPAWN_DUST: { x: number; y: number; direction?: "horizontal" | "vertical" };
  SPAWN_BLAST: { x: number; y: number; color: string };
  PLAYER_DROPPED: void;
  PLAYER_LANDED: void;
  HEAL_START: void;
  HEAL_CANCEL: void;
  HEAL_UPDATE: { timer: number };
  HEAL_COMPLETE: void;
  PLAYER_SPIKED: { x: number };
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
  CHARGE_CANCEL: void;
  REQUEST_RETRY: void;
  REQUEST_MENU: void;
  PLATFORM_IMPACT: { platform: Rectangle; velocityY: number; massMultiplier: number };
};

export type EventCallback<T> = (payload: T) => void;

class EventBroker {
  private listeners: { [K in keyof GameEventMap]?: Set<EventCallback<any>> } = {};

  private static sparkPayload: {
    x: number; y: number; angle: number; color?: string; radial?: boolean; count?: number; turbulence?: number; shape?: "spark" | "line";
  } = { x: 0, y: 0, angle: 0 };

  private static dustPayload: { x: number; y: number; direction?: "horizontal" | "vertical" } = { x: 0, y: 0 };

  private static blastPayload: { x: number; y: number; color: string } = { x: 0, y: 0, color: "" };

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

  public publishSpark(x: number, y: number, angle: number, color?: string, radial?: boolean, count?: number, shape?: "spark" | "line", turbulence?: number): void {
    const p = EventBroker.sparkPayload;
    p.x = x;
    p.y = y;
    p.angle = angle;
    p.color = color;
    p.radial = radial;
    p.count = count;
    p.shape = shape;
    p.turbulence = turbulence;
    this.publish("SPAWN_SPARKS", p as GameEventMap["SPAWN_SPARKS"]);
  }

  public publishDust(x: number, y: number, direction?: "horizontal" | "vertical"): void {
    const p = EventBroker.dustPayload;
    p.x = x;
    p.y = y;
    p.direction = direction;
    this.publish("SPAWN_DUST", p as GameEventMap["SPAWN_DUST"]);
  }

  public publishBlast(x: number, y: number, color: string): void {
    const p = EventBroker.blastPayload;
    p.x = x;
    p.y = y;
    p.color = color;
    this.publish("SPAWN_BLAST", p as GameEventMap["SPAWN_BLAST"]);
  }

  public clear(): void {
    this.listeners = {};
  }
}

export const eventBroker = new EventBroker();
