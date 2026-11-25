export enum StrategyId {
  NONE = "Select Strategy",
  PESS = "Progressive Exposure Scaling Strategy (PESS)",
  FIBONACCI = "Fibonacci Strategy",
  FIBONACCI_PROGRESSIVE = "Fibonacci 16%-Base Progressive-Drawdown DCA",
}

export const STRATEGY_CONFIGS = {
  [StrategyId.FIBONACCI_PROGRESSIVE]: {
    name: StrategyId.FIBONACCI_PROGRESSIVE,
    basePrice: 100,
    gridDistance: 16,
    positionSizeWeights: [1, 1, 2, 3, 5, 8, 13],
  },
  [StrategyId.PESS]: {
    name: "Fibonacci Strategy（加碼百分比）",
    basePrice: 100,
    gridDistance: 10,
    positionSizeWeights: [1, 2, 4, 8, 16, 32],
  },
  [StrategyId.FIBONACCI]: {
    name: "Fibonacci Strategy（加碼金額）",
    basePrice: 382,
    gridDistance: 45.84,
    positionSizeWeights: [1, 1, 2, 3, 5, 8, 13],
  },
} as const;

// Keep the retired configuration only for compatibility with older saved data.
export const STRATEGY_OPTIONS = Object.entries(STRATEGY_CONFIGS)
  .filter(([id]) => id !== StrategyId.FIBONACCI_PROGRESSIVE)
  .map(([id, config]) => ({
  id: id as keyof typeof STRATEGY_CONFIGS,
  name: config.name,
}));

