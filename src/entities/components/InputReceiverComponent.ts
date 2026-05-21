import { EntityComponent } from "@/entities/EntityComponent";
import { BaseEntity } from "@/entities/BaseEntity";
import { inputProvider, Action } from "@/core/InputProvider";

export class InputReceiverComponent implements EntityComponent {
  public owner!: BaseEntity;

  public setup(owner: BaseEntity): void {
    this.owner = owner;
  }

  public isPressed(action: Action): boolean {
    return inputProvider.isPressed(action);
  }

  public isJustPressed(action: Action): boolean {
    return inputProvider.isJustPressed(action);
  }

  public isJustReleased(action: Action): boolean {
    return inputProvider.isJustReleased(action);
  }

  public consumeBufferedAction(action: Action, windowMs: number = 100): boolean {
    return inputProvider.consumeBufferedAction(action, windowMs);
  }

  public getAxis(negative: Action, positive: Action): number {
    return inputProvider.getAxis(negative, positive);
  }
}
