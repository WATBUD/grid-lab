export enum StrategyId {
  NONE = "Select Strategy",
  PESS = "Progressive Exposure Scaling Strategy (PESS)",
  FIBONACCI = "Fibonacci Strategy",
  DOUBLE_DOWN = "Double Down Strategy",
}

export const STRATEGY_CONFIGS = {
  [StrategyId.PESS]: {
    name: StrategyId.PESS,
    basePrice: 2112.3,
    gridDistance: 10,
    positionSizeWeights: [1, 2, 4, 8, 12, 18, 25, 30],
  },
  [StrategyId.FIBONACCI]: {
    name: StrategyId.FIBONACCI,
    basePrice: 2112.3,
    gridDistance: 10,
    positionSizeWeights: [1, 1, 2, 3, 5, 8, 13, 21, 34],
  },
    [StrategyId.DOUBLE_DOWN]: {
    name: StrategyId.DOUBLE_DOWN,
    basePrice: 2112.3,
    gridDistance: 10.0,
    positionSizeWeights: [1, 2, 4, 8, 16, 32],
  },
} as const;

export const STRATEGY_OPTIONS = Object.entries(STRATEGY_CONFIGS).map(([id, config]) => ({
  id: id as keyof typeof STRATEGY_CONFIGS,
  name: config.name,
}));

