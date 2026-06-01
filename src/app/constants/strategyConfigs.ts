export const STRATEGY_CONFIGS = {
  "MARTINGALE-1": {
    name: "Martingale Grid 15.0",
    basePrice: 2112.3,
    gridDistance: 10,
    positionSizeWeights: [1, 2, 4, 8, 12, 18, 25, 30],
  },
  "MARTINGALE-2": {
    name: "Martingale Grid 25.0",
    basePrice: 2112.3,
    gridDistance: 25.0,
    positionSizeWeights: [1, 1, 2, 3, 5, 8, 13, 21, 34],
  },
} as const;

export const STRATEGY_OPTIONS = Object.entries(STRATEGY_CONFIGS).map(([id, config]) => ({
  id: id as keyof typeof STRATEGY_CONFIGS,
  name: config.name,
}));

