import { EntityComponent } from "./EntityComponent";
import { IEntity, IWorld, Vector2D } from "@/core/Interfaces";

export class BaseEntity implements IEntity {
  public position: Vector2D = { x: 0, y: 0 };
  public velocity: Vector2D = { x: 0, y: 0 };
  public size = { width: 50, height: 50 };
  public id: string;
  public isDead: boolean = false;
  public world: IWorld;

  private components = new Map<any, EntityComponent>();

  constructor(id: string, world: IWorld) {
    this.id = id;
    this.world = world;
  }

  public addComponent<T extends EntityComponent>(
    componentClass: new (...args: any[]) => T,
    component: T,
    dependencies?: Record<string, any>
  ): T {
    component.setup(this, dependencies);
    this.components.set(componentClass, component);
    return component;
  }

  public getComponent<T extends EntityComponent>(componentClass: new (...args: any[]) => T): T | null {
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

  public draw(ctx: CanvasRenderingContext2D) {
    if (this.isDead) return;

    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    ctx.fillRect(
      this.position.x - this.size.width / 2,
      this.position.y - this.size.height / 2,
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
