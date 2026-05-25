import { IEntityComponent } from "./EntityComponent";
import { IEntity, IWorld, Vector2D, EntityStatus } from "@/core/Interfaces";

export class BaseEntity implements IEntity {
  public position: Vector2D = { x: 0, y: 0 };
  public previousPosition: Vector2D = { x: 0, y: 0 };
  public velocity: Vector2D = { x: 0, y: 0 };
  public size = { width: 50, height: 50 };
  public id: string;
  public isDead: boolean = false;
  public world: IWorld;

  public visualScale = { x: 1, y: 1 };
  public targetVisualScale = { x: 1, y: 1 };
  public squashPivot: "center" | "feet" = "center";

  public startDeathSequence?(): void;
  public registerDamageDealt?(): void;

  private components = new Map<string, IEntityComponent>();

  constructor(id: string, world: IWorld) {
    this.id = id;
    this.world = world;
  }

  public get status(): EntityStatus {
    return this.isDead ? EntityStatus.DEAD : EntityStatus.ACTIVE;
  }

  public addComponent<T extends IEntityComponent>(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    componentClass: new (...args: any[]) => T,
    component: T,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dependencies?: Record<string, any>
  ): T {
    component.setup(this, dependencies);
    this.components.set(componentClass.name, component);
    return component;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public getComponent<T extends IEntityComponent>(componentClass: new (...args: any[]) => T): T | null {
    const component = this.components.get(componentClass.name);
    return (component as T) || null;
  }

  public update(dt: number) {
    if (this.isDead) return;

    this.visualScale.x += (this.targetVisualScale.x - this.visualScale.x) * 12 * dt;
    this.visualScale.y += (this.targetVisualScale.y - this.visualScale.y) * 12 * dt;

    for (const component of this.components.values()) {
      if (component.update) {
        component.update(dt);
      }
    }
  }

  public draw(ctx: CanvasRenderingContext2D, alpha?: number) {
    if (this.isDead) return;

    const alphaVal = alpha !== undefined ? alpha : 1.0;
    const drawX = this.previousPosition.x + (this.position.x - this.previousPosition.x) * alphaVal;
    const drawY = this.previousPosition.y + (this.position.y - this.previousPosition.y) * alphaVal;

    ctx.save();
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";

    const vWidth = this.size.width * this.visualScale.x;
    const vHeight = this.size.height * this.visualScale.y;

    if (this.squashPivot === "feet") {
      const feetY = drawY + this.size.height / 2;
      ctx.fillRect(drawX - vWidth / 2, feetY - vHeight, vWidth, vHeight);
    } else {
      ctx.fillRect(drawX - vWidth / 2, drawY - vHeight / 2, vWidth, vHeight);
    }
    ctx.restore();
  }

  public teardown() {
    for (const component of this.components.values()) {
      if (component.teardown) {
        component.teardown();
      }
    }
    this.components.clear();
  }
}
