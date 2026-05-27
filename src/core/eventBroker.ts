import { IEventBus, GameEventMap } from "./Interfaces";

class EventBroker implements IEventBus {
  private listeners: Record<string, Set<(payload: unknown) => void>> = {};

  private static sparkPayload: {
    x: number; y: number; angle: number; color?: string; radial?: boolean; count?: number; turbulence?: number; shape?: "spark" | "line";
  } = { x: 0, y: 0, angle: 0 };

  private static dustPayload: { x: number; y: number; direction?: "horizontal" | "vertical" } = { x: 0, y: 0 };

  private static blastPayload: { x: number; y: number; color: string } = { x: 0, y: 0, color: "" };

  public subscribe<K extends string>(event: K, callback: (payload: K extends keyof GameEventMap ? GameEventMap[K] : unknown) => void): () => void {
    if (!this.listeners[event]) {
      this.listeners[event] = new Set();
    }
    this.listeners[event]!.add(callback as (payload: unknown) => void);
    return () => {
      this.listeners[event]?.delete(callback as (payload: unknown) => void);
    };
  }

  public publish<K extends string>(event: K, payload: K extends keyof GameEventMap ? GameEventMap[K] : unknown): void {
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
