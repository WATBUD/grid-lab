export const MAX_PROGRESSIVE_SLOTS = 12;

// Keep full precision between rounds; only the view rounds displayed values.
export function createProgressiveDca(weights: number[], basePrice: number, unitSize: number) {
  let invested = 0;
  let quantity = 0;
  let average = basePrice;

  return weights.slice(0, MAX_PROGRESSIVE_SLOTS).map((weight, index) => {
    const drawdownPercent = index === 0 ? 0 : 16 + 8 * (index - 1);
    const triggerPrice = index === 0 ? basePrice : average * (1 - drawdownPercent / 100);
    const sizeUsd = weight * unitSize;
    invested += sizeUsd;
    quantity += sizeUsd / triggerPrice;
    average = invested / quantity;
    return {
      triggerPrice,
      sizeUsd,
      drawdownPercent,
      totalDropPercent: (basePrice - triggerPrice) / basePrice * 100,
      cumulativeAverage: average,
      cumulativeInvestment: invested,
      cumulativeQuantity: quantity,
    };
  });
}
