import { BaseEntity } from "./BaseEntity";

export interface IEntityComponent {
  setup(owner: BaseEntity, dependencies?: Record<string, any>): void;
  update?(dt: number): void;
  teardown?(): void;
}
