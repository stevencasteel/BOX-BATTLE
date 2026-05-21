import { BaseEntity } from "./BaseEntity";

export interface EntityComponent {
  setup(owner: BaseEntity, dependencies?: Record<string, any>): void;
  update?(dt: number): void;
  teardown?(): void;
}
