import { BaseEntity } from "./BaseEntity";

export interface IEntityComponent {
  setup(owner: BaseEntity, dependencies?: Record<string, unknown>): void;
  update?(dt: number): void;
  teardown?(): void;
}
