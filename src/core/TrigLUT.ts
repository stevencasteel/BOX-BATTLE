export class TrigLUT {
  private static readonly TABLE_SIZE = 2048;
  private static readonly INV_TABLE_SIZE = TrigLUT.TABLE_SIZE / (Math.PI * 2);
  private static readonly sinTable: Float64Array = new Float64Array(TrigLUT.TABLE_SIZE);
  private static readonly cosTable: Float64Array = new Float64Array(TrigLUT.TABLE_SIZE);

  static {
    for (let i = 0; i < TrigLUT.TABLE_SIZE; i++) {
      const angle = (i / TrigLUT.TABLE_SIZE) * Math.PI * 2;
      TrigLUT.sinTable[i] = Math.sin(angle);
      TrigLUT.cosTable[i] = Math.cos(angle);
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
}
