export interface IState {
  enter(): void;
  update(dt: number): void;
  exit(): void;
}

export class StateMachine {
  private currentState: IState | null = null;

  public changeState(newState: IState): void {
    if (this.currentState) {
      this.currentState.exit();
    }
    this.currentState = newState;
    this.currentState.enter();
  }

  public update(dt: number): void {
    if (this.currentState) {
      this.currentState.update(dt);
    }
  }

  public getCurrentState(): IState | null {
    return this.currentState;
  }
}
