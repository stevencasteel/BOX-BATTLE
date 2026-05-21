import { BaseEntity } from "./BaseEntity";

export interface IEntityComponent {
  setup(owner: BaseEntity, dependencies?: any): void;
  update?(dt: number): void;
  teardown?(): void;
}
