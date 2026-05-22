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

  public startDeathSequence?(): void;
  public registerDamageDealt?(): void;

  private components = new Map<any, IEntityComponent>();

  constructor(id: string, world: IWorld) {
    this.id = id;
    this.world = world;
  }

  public get status(): EntityStatus {
    return this.isDead ? EntityStatus.DEAD : EntityStatus.ACTIVE;
  }

  public addComponent<T extends IEntityComponent>(
    componentClass: new (...args: any[]) => T,
    component: T,
    dependencies?: any
  ): T {
    component.setup(this, dependencies);
    this.components.set(componentClass, component);
    return component;
  }

  public getComponent<T extends IEntityComponent>(componentClass: new (...args: any[]) => T): T | null {
    const component = this.components.get(componentClass);
    return (component as T) || null;
  }

  public update(dt: number) {
    if (this.isDead) return;

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

    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    ctx.fillRect(
      drawX - this.size.width / 2,
      drawY - this.size.height / 2,
      this.size.width,
      this.size.height
    );
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
