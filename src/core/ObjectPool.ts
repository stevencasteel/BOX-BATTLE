export interface IPoolable {
  isActive: boolean;
  activate(...args: any[]): void;
  deactivate(): void;
}

export class ObjectPool<T extends IPoolable> {
  private inactivePool: T[] = [];
  private activePool: T[] = [];
  private factory: () => T;

  constructor(factory: () => T, initialSize: number = 20) {
    this.factory = factory;

    // Pre-populate pool
    for (let i = 0; i < initialSize; i++) {
      const instance = this.factory();
      instance.deactivate();
      this.inactivePool.push(instance);
    }
  }

  /**
   * Retrieves an inactive instance from the pool, activates it,
   * and tracks it in the active list.
   */
  public get(...args: any[]): T {
    let instance: T;

    if (this.inactivePool.length > 0) {
      instance = this.inactivePool.pop()!;
    } else {
      // Fallback: scale pool size dynamically if we run out under heavy load
      instance = this.factory();
    }

    instance.activate(...args);
    this.activePool.push(instance);
    return instance;
  }

  /**
   * Deactivates an active instance and returns it to the inactive pool.
   */
  public release(instance: T) {
    const index = this.activePool.indexOf(instance);
    if (index !== -1) {
      this.activePool.splice(index, 1);
      instance.deactivate();
      this.inactivePool.push(instance);
    }
  }

  public getActive(): readonly T[] {
    return this.activePool;
  }

  public clear() {
    this.inactivePool = [];
    this.activePool = [];
  }
}
