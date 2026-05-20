import { BaseEntity } from "@/entities/BaseEntity";

export class Registry {
  public static player: BaseEntity | null = null;
  public static boss: BaseEntity | null = null;
}
