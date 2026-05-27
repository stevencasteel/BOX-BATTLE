export class TrigLUT {
  private static readonly TABLE_SIZE = 2048;
  private static readonly INV_TABLE_SIZE = TrigLUT.TABLE_SIZE / (Math.PI * 2);
  private static readonly sinTable: Float64Array = new Float64Array(TrigLUT.TABLE_SIZE);
  private static readonly cosTable: Float64Array = new Float64Array(TrigLUT.TABLE_SIZE);

  public static readonly ATAN_TABLE_SIZE = 1024;
  private static readonly atanTable: Float64Array = new Float64Array(TrigLUT.ATAN_TABLE_SIZE);

  private static prngState: number = Date.now();

  static {
    for (let i = 0; i < TrigLUT.TABLE_SIZE; i++) {
      const angle = (i / TrigLUT.TABLE_SIZE) * Math.PI * 2;
      TrigLUT.sinTable[i] = Math.sin(angle);
      TrigLUT.cosTable[i] = Math.cos(angle);
    }

    for (let i = 0; i < TrigLUT.ATAN_TABLE_SIZE; i++) {
      const t = i / TrigLUT.ATAN_TABLE_SIZE;
      TrigLUT.atanTable[i] = Math.atan(t);
    }
  }

  public static sin(radians: number): number {
    const idx = Math.round(radians * TrigLUT.INV_TABLE_SIZE) & (TrigLUT.TABLE_SIZE - 1);
    return TrigLUT.sinTable[idx];
  }

  public static cos(radians: number): number {
    const idx = Math.round(radians * TrigLUT.INV_TABLE_SIZE) & (TrigLUT.TABLE_SIZE - 1);
    return TrigLUT.cosTable[idx];
  }

  public static atan2(y: number, x: number): number {
    if (x === 0 && y === 0) return 0;
    const absY = Math.abs(y);
    const absX = Math.abs(x);
    const t = absY / (absX + absY);
    const idx = Math.round(t * TrigLUT.ATAN_TABLE_SIZE) & (TrigLUT.ATAN_TABLE_SIZE - 1);
    const angle = TrigLUT.atanTable[idx];
    if (x >= 0) {
      return y >= 0 ? angle : -angle;
    } else {
      return y >= 0 ? Math.PI - angle : angle - Math.PI;
    }
  }

  public static seedRandom(seed: number): void {
    TrigLUT.prngState = seed | 0;
  }

  public static random(): number {
    let t = (TrigLUT.prngState += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  public static randomRange(min: number, max: number): number {
    return min + TrigLUT.random() * (max - min);
  }

  public static fastSqrt(n: number): number {
    if (n <= 0) return 0;
    let x = n;
    let y = 1;
    const e = 0.001;
    while (x - y > e) {
      x = (x + y) / 2;
      y = n / x;
    }
    return x;
  }
}
