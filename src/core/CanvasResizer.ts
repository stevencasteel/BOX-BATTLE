export class CanvasResizer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private internalWidth: number;
  private internalHeight: number;
  private lastWidth = 0;
  private lastHeight = 0;

  constructor(canvas: HTMLCanvasElement, internalWidth = 1250, internalHeight = 1250) {
    this.canvas = canvas;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Could not acquire 2D context.");
    this.ctx = context;
    this.internalWidth = internalWidth;
    this.internalHeight = internalHeight;
  }

  public resize(containerWidth: number, containerHeight: number): boolean {
    if (containerWidth === this.lastWidth && containerHeight === this.lastHeight) {
      return false;
    }

    this.lastWidth = containerWidth;
    this.lastHeight = containerHeight;

    const dpr = window.devicePixelRatio || 1;
    const scale = Math.min(containerWidth / this.internalWidth, containerHeight / this.internalHeight);

    const displayWidth = this.internalWidth * scale;
    const displayHeight = this.internalHeight * scale;

    this.canvas.style.width = `${displayWidth}px`;
    this.canvas.style.height = `${displayHeight}px`;

    this.canvas.width = displayWidth * dpr;
    this.canvas.height = displayHeight * dpr;

    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(dpr * scale, dpr * scale);
    this.ctx.imageSmoothingEnabled = false;

    return true;
  }
}
