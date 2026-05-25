import { BaseEntity } from "./BaseEntity";

export interface IEntityComponent {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setup(owner: BaseEntity, dependencies?: Record<string, any>): void;
  update?(dt: number): void;
  teardown?(): void;
}
