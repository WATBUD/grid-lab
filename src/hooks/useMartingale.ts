"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { STRATEGY_CONFIGS } from "@/app/constants/strategyConfigs";

// Types
export interface SlotOrder {
  slot: number;
  triggerPrice: number;
  sizePercent: number;
  sizeUsd: number;
  sizeEth: number;
  status: "pending" | "filled" | "cancelled";
  filledAt?: number;
}

export interface Candle {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  bbUpper: number;
  bbMiddle: number;
  bbLower: number;
  rightSideBlocked?: boolean;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  type: "system" | "order" | "tp" | "sl" | "warning" | "info";
  message: string;
}

export interface TradeHistory {
  id: string;
  time: string;
  type: "TP" | "SL";
  pnl: number;
  percentage: number;
  slotsFilled: number;
  avgPrice: number;
  exitPrice: number;
}

export function useMartingale() {
  // --- Strategy Constants (Configurable in Settings) ---
  const [initialCapital, setInitialCapital] = useState(() => {
    if (typeof window === 'undefined') return 3125.0;
    const saved = localStorage.getItem("initialCapital");
    return saved ? parseFloat(saved) : 3125.0;
  });
  const [leverage, setLeverage] = useState(10);
  const [basePrice, setBasePrice] = useState(2112.3);
  const [gridDistance, setGridDistance] = useState(() => {
    if (typeof window === 'undefined') return 15.0;
    const saved = localStorage.getItem("gridDistance");
    const parsed = saved ? parseFloat(saved) : NaN;
    return !isNaN(parsed) ? parsed : 15.0;
  });

  // Persist gridDistance changes
  useEffect(() => {
    localStorage.setItem("gridDistance", gridDistance.toString());
  }, [gridDistance]);
  const [totalSlots] = useState(STRATEGY_CONFIGS["MARTINGALE-1"].positionSizeWeights.length);
  const [currentStrategyId, setCurrentStrategyId] = useState<keyof typeof STRATEGY_CONFIGS>("MARTINGALE-1");
  const [marginEquity, setMarginEquity] = useState(3125.0);

  // --- Dynamic Account States ---
  const [balance, setBalance] = useState(3125.0); // Capital available
  const [floatingPnl, setFloatingPnl] = useState(0.0);
  const [realizedPnl, setRealizedPnl] = useState(0.0);
  const [strategyStatus, setStrategyStatus] = useState<
    "inactive" | "running" | "paused_safety" | "tp_triggered" | "sl_triggered"
  >("inactive");

  // --- Position States ---
  const [averagePrice, setAveragePrice] = useState(0.0);
  const [totalEthSize, setTotalEthSize] = useState(0.0);
  const [totalUsdMargin, setTotalUsdMargin] = useState(0.0);

  // --- Active Grid Slots ---
  const [slots, setSlots] = useState<SlotOrder[]>([]);

  // --- Safety System Configuration ---
  const [rightSideFilterEnabled, setRightSideFilterEnabled] = useState(true);
  const [rightSidePaused, setRightSidePaused] = useState(false);

  // --- Direction State ---
  const [direction, setDirection] = useState<"long" | "short">("short");

  // --- Interactive Simulation States ---
  const [currentPrice, setCurrentPrice] = useState(2125.0);
  const [candles, setCandles] = useState<Candle[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [tradeHistory, setTradeHistory] = useState<TradeHistory[]>([]);
  const [isAutoSimulating, setIsAutoSimulating] = useState(false);
  const [simulationSpeed, setSimulationSpeed] = useState(1000); // ms per tick

  const autoSimIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Helper: Format Time
  const getFormattedTime = () => {
    const d = new Date();
    return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}:${d.getSeconds().toString().padStart(2, "0")}`;
  };

  // Helper: Add Logs
  const addLog = useCallback((type: LogEntry["type"], message: string) => {
    setLogs((prev) => [
      {
        id: Math.random().toString(36).substring(7),
        timestamp: getFormattedTime(),
        type,
        message,
      },
      ...prev.slice(0, 99), // Cap logs at 100 entries
    ]);
  }, []);

  // --- Initialize Grid Matrix ---
  const resetGridSlots = useCallback((customBasePrice: number = basePrice, customGridDistance: number = gridDistance, dir: "long" | "short" = direction) => {
    const currentConfig = STRATEGY_CONFIGS[currentStrategyId];
    const totalWeight = currentConfig.positionSizeWeights.reduce((a, b) => a + b, 0);
    const matrixPercent = currentConfig.positionSizeWeights.map(w => w / totalWeight); // Convert weights to fractions
    const initialSlots: SlotOrder[] = matrixPercent.map((pct, idx) => {
      const trigger = dir === "long"
        ? customBasePrice - customGridDistance * idx
        : customBasePrice + customGridDistance * idx;
      const sizeUsd = initialCapital * pct;
      const sizeEth = (sizeUsd * leverage) / Math.abs(trigger);
      return {
        slot: idx + 1,
        triggerPrice: parseFloat(trigger.toFixed(2)),
        sizePercent: pct * 100,
        sizeUsd: parseFloat(sizeUsd.toFixed(2)),
        sizeEth: parseFloat(sizeEth.toFixed(6)),
        status: "pending",
      };
    });
    setSlots(initialSlots);
    return initialSlots;
  }, [basePrice, gridDistance, initialCapital, leverage, direction, currentStrategyId]);

  // Initial setup
  useEffect(() => {
    resetGridSlots();
    // Generate some initial historical candles to render a nice chart
    generateInitialCandles();
    addLog("system", "Trading Terminal Initialized. Ready for entry signals.");
  }, []);

  // Recalculate trigger prices when basePrice or gridDistance changes
  useEffect(() => {
    if (strategyStatus === "inactive") {
      resetGridSlots();
    }
  }, [basePrice, gridDistance, direction, resetGridSlots, strategyStatus]);

  // --- Generate 30 Historical Candles with Bollinger Bands ---
  const generateInitialCandles = () => {
    const initialCandles: Candle[] = [];
    let price = 2135.0;
    const timeBase = new Date();
    timeBase.setMinutes(timeBase.getMinutes() - 30 * 5); // 30 candles back

    // Generate random path
    for (let i = 0; i < 30; i++) {
      const candleTime = new Date(timeBase.getTime() + i * 5 * 60 * 1000);
      const timeStr = `${candleTime.getHours().toString().padStart(2, "0")}:${candleTime.getMinutes().toString().padStart(2, "0")}`;
      
      const change = (Math.random() - 0.48) * 8.0; // slight upward drift
      const open = price;
      const close = price + change;
      const high = Math.max(open, close) + Math.random() * 3.0;
      const low = Math.min(open, close) - Math.random() * 3.0;
      
      price = close;

      initialCandles.push({
        time: timeStr,
        open: parseFloat(open.toFixed(2)),
        high: parseFloat(high.toFixed(2)),
        low: parseFloat(low.toFixed(2)),
        close: parseFloat(close.toFixed(2)),
        volume: parseFloat((100 + Math.random() * 200).toFixed(2)),
        bbUpper: 0,
        bbMiddle: 0,
        bbLower: 0,
      });
    }

    // Compute Bollinger Bands (SMA 20, StdDev 2)
    computeBollingerBands(initialCandles);
    setCandles(initialCandles);
    // Align currentPrice to the last candle close
    setCurrentPrice(initialCandles[initialCandles.length - 1].close);
  };

  const computeBollingerBands = (candleList: Candle[]) => {
    const period = 20;
    for (let i = 0; i < candleList.length; i++) {
      if (i < period - 1) {
        // Fallback for first few candles
        candleList[i].bbMiddle = candleList[i].close;
        candleList[i].bbUpper = candleList[i].close + 15;
        candleList[i].bbLower = candleList[i].close - 15;
        continue;
      }
      
      let sum = 0;
      for (let j = i - period + 1; j <= i; j++) {
        sum += candleList[j].close;
      }
      const sma = sum / period;
      
      let varianceSum = 0;
      for (let j = i - period + 1; j <= i; j++) {
        varianceSum += Math.pow(candleList[j].close - sma, 2);
      }
      const stdDev = Math.sqrt(varianceSum / period);

      candleList[i].bbMiddle = parseFloat(sma.toFixed(2));
      candleList[i].bbUpper = parseFloat((sma + 2 * stdDev).toFixed(2));
      candleList[i].bbLower = parseFloat((sma - 2 * stdDev).toFixed(2));
    }
  };

  // --- Reset Entire Strategy Position & State ---
  const resetStrategy = useCallback((newBalance: number = balance, exitType?: "TP" | "SL", pnlAmt: number = 0) => {
    setStrategyStatus("inactive");
    setAveragePrice(0.0);
    setTotalEthSize(0.0);
    setTotalUsdMargin(0.0);
    setFloatingPnl(0.0);
    setRightSidePaused(false);
    
    // Reset slot order forms
    resetGridSlots();

    if (exitType) {
      const pct = (pnlAmt / initialCapital) * 100;
      addLog(
        exitType === "TP" ? "tp" : "sl",
        `Strategy CLOSED via ${exitType}. Net profit: $${pnlAmt.toFixed(2)} (${pct.toFixed(2)}%). Re-monitoring lower band...`
      );
    } else {
      addLog("system", "Strategy forcefully reset. Active positions liquidated.");
    }
  }, [balance, resetGridSlots, initialCapital]);

  // --- Force Market Close ---
  const forceMarketClose = useCallback(() => {
    if (totalEthSize === 0) {
      addLog("warning", "No active positions to close.");
      return;
    }
    const finalPnl = floatingPnl;
    const finalBalance = balance + finalPnl;
    setBalance(parseFloat(finalBalance.toFixed(2)));
    setRealizedPnl((prev) => parseFloat((prev + finalPnl).toFixed(2)));

    resetStrategy(finalBalance, undefined);
    addLog("system", `Emergency liquidation triggered. Closed position of ${totalEthSize.toFixed(4)} ETH at current price $${currentPrice.toFixed(2)}. Realized PnL: $${finalPnl.toFixed(2)}.`);
  }, [floatingPnl, balance, totalEthSize, currentPrice, resetStrategy, addLog]);

  // --- Load Strategy Configuration ---
  const loadStrategy = useCallback((strategyId: keyof typeof STRATEGY_CONFIGS) => {
    const config = STRATEGY_CONFIGS[strategyId];
    if (!config) {
      addLog("warning", `Strategy ${strategyId} not found.`);
      return;
    }

    // Reset all state
    setStrategyStatus("inactive");
    setAveragePrice(0.0);
    setTotalEthSize(0.0);
    setTotalUsdMargin(0.0);
    setFloatingPnl(0.0);
    setRightSidePaused(false);
    setCurrentStrategyId(strategyId);

    // Load new configuration
    setBasePrice(config.basePrice);
    setGridDistance(config.gridDistance);
    setInitialCapital(0);
    setBalance(0);
    setMarginEquity(0);
    setDirection("short");

    // Reset grid with new configuration
    resetGridSlots(config.basePrice, config.gridDistance, "short");

    // Regenerate candles with new base price
    const initialCandles: Candle[] = [];
    let price = config.basePrice + 20;
    const timeBase = new Date();
    timeBase.setMinutes(timeBase.getMinutes() - 30 * 5);

    for (let i = 0; i < 30; i++) {
      const candleTime = new Date(timeBase.getTime() + i * 5 * 60 * 1000);
      const timeStr = `${candleTime.getHours().toString().padStart(2, "0")}:${candleTime.getMinutes().toString().padStart(2, "0")}`;

      const change = (Math.random() - 0.48) * 8.0;
      const open = price;
      const close = price + change;
      const high = Math.max(open, close) + Math.random() * 3.0;
      const low = Math.min(open, close) - Math.random() * 3.0;

      price = close;

      initialCandles.push({
        time: timeStr,
        open: parseFloat(open.toFixed(2)),
        high: parseFloat(high.toFixed(2)),
        low: parseFloat(low.toFixed(2)),
        close: parseFloat(close.toFixed(2)),
        volume: parseFloat((100 + Math.random() * 200).toFixed(2)),
        bbUpper: 0,
        bbMiddle: 0,
        bbLower: 0,
      });
    }

    computeBollingerBands(initialCandles);
    setCandles(initialCandles);
    setCurrentPrice(initialCandles[initialCandles.length - 1].close);

    addLog("system", `Strategy loaded. Base price: $${config.basePrice}, Grid distance: ${config.gridDistance}`);
  }, [resetGridSlots, addLog]);

  // --- Select Direction (Long/Short) ---
  const selectDirection = useCallback((dir: "long" | "short") => {
    setDirection(dir);
    setStrategyStatus("inactive");
    setAveragePrice(0.0);
    setTotalEthSize(0.0);
    setTotalUsdMargin(0.0);
    setFloatingPnl(0.0);
    setRightSidePaused(false);
    resetGridSlots(basePrice, gridDistance, dir);
    addLog("system", `Direction set to ${dir === "long" ? "LONG (做多) ▲ Grid +" + gridDistance : "SHORT (做空) ▼ Grid -" + gridDistance} from base $${basePrice}.`);
  }, [basePrice, gridDistance, resetGridSlots, addLog]);

  // --- Calculate Live PnL ---
  useEffect(() => {
    if (totalEthSize > 0 && averagePrice > 0) {
      // Floating PnL = (Current Price - Average Price) * Total Leveraged ETH
      // Note: totalEthSize is already leveraged inside slots size calculations: (sizeUsd * leverage / triggerPrice)
      // So physical PnL is (Current - Avg) * totalEthSize
      const pnl = (currentPrice - averagePrice) * totalEthSize;
      setFloatingPnl(parseFloat(pnl.toFixed(2)));
      
      // Calculate dynamic equity
      const equity = balance + pnl;
      setMarginEquity(parseFloat(equity.toFixed(2)));
    } else {
      setFloatingPnl(0.0);
    }
  }, [currentPrice, averagePrice, totalEthSize, balance]);

  // --- Core Trading Signal and Order Matching Loop ---
  const handlePriceTick = useCallback((newPrice: number, latestCandleCompleted: boolean = false) => {
    setCurrentPrice(newPrice);
    
    // Grab the active/last candle Bollinger Bands
    if (candles.length === 0) return;
    const lastCandle = candles[candles.length - 1];
    const lowerBand = lastCandle.bbLower;
    const middleBand = lastCandle.bbMiddle;

    // --- State: INACTIVE (Monitoring for Entry) ---
    if (strategyStatus === "inactive") {
      const upperBand = lastCandle.bbUpper;
      const entryTriggered = direction === "short"
        ? newPrice <= lowerBand
        : newPrice >= upperBand;

      if (entryTriggered) {
        setStrategyStatus("running");
        const bandLabel = direction === "short" ? "Lower" : "Upper";
        const bandValue = direction === "short" ? lowerBand : upperBand;
        addLog("system", `ENTRY TRIGGER: Price $${newPrice.toFixed(2)} hit ${bandLabel} BB ($${bandValue.toFixed(2)}). ${direction === "long" ? "LONG ▲" : "SHORT ▼"} Martingale grid activated.`);
        triggerSlotOrder(1, newPrice);
      }
      return;
    }

    // --- State: RUNNING or PAUSED_SAFETY ---
    if (strategyStatus === "running" || strategyStatus === "paused_safety") {
      
      // 1. Right-side trading defense check (when a new candle completes)
      if (rightSideFilterEnabled && latestCandleCompleted) {
        let isExtremeCandle = false;
        let isPierced = false;

        if (direction === "short") {
          const bodySize = lastCandle.open - lastCandle.close;
          isExtremeCandle = bodySize >= gridDistance * 0.8;
          isPierced = lastCandle.close < lastCandle.bbLower;
        } else {
          const bodySize = lastCandle.close - lastCandle.open;
          isExtremeCandle = bodySize >= gridDistance * 0.8;
          isPierced = lastCandle.close > lastCandle.bbUpper;
        }

        if (isExtremeCandle && isPierced && !rightSidePaused) {
          setRightSidePaused(true);
          setStrategyStatus("paused_safety");
          addLog("warning", `SAFETY WARNING: Extreme ${direction === "short" ? "bearish" : "bullish"} candle detected. Pausing grid to protect margin.`);
        } else if (rightSidePaused) {
          let isStabilized = false;
          if (direction === "short") {
            isStabilized = lastCandle.close > lastCandle.open || lastCandle.close >= lastCandle.bbLower;
          } else {
            isStabilized = lastCandle.close < lastCandle.open || lastCandle.close <= lastCandle.bbUpper;
          }
          if (isStabilized) {
            setRightSidePaused(false);
            setStrategyStatus("running");
            addLog("system", `SAFETY RESOLVED: Candle stabilized. Resuming active grid entry.`);
            matchBlockedLimitOrders(newPrice);
          }
        }
      }

      // 2. Limit Grid matching (Only if NOT paused by safety)
      if (strategyStatus === "running") {
        matchGridOrders(newPrice);
      }

      // 3. EXIT: Take Profit (TP) Checks
      // Trigger A: Price reaches average price + 16.6 points
      // Trigger B: Price rebounds back to the 5-Min BB Middle Band (SMA 20)
      if (totalEthSize > 0 && averagePrice > 0) {
        const tpTargetPrice = averagePrice + 16.6;
        const reachedTpPoints = newPrice >= tpTargetPrice;
        const reachedBbMiddle = direction === "short" && newPrice >= middleBand;

        if (reachedTpPoints || reachedBbMiddle) {
          const finalPnl = (newPrice - averagePrice) * totalEthSize;
          const finalBalance = balance + finalPnl;
          
          setBalance(parseFloat(finalBalance.toFixed(2)));
          setRealizedPnl((prev) => parseFloat((prev + finalPnl).toFixed(2)));

          // Record Trade History
          const slotsFilledCount = slots.filter(s => s.status === "filled").length;
          setTradeHistory((prev) => [
            {
              id: Math.random().toString(36).substring(7),
              time: getFormattedTime(),
              type: "TP",
              pnl: parseFloat(finalPnl.toFixed(2)),
              percentage: parseFloat(((finalPnl / initialCapital) * 100).toFixed(2)),
              slotsFilled: slotsFilledCount,
              avgPrice: parseFloat(averagePrice.toFixed(2)),
              exitPrice: parseFloat(newPrice.toFixed(2)),
            },
            ...prev,
          ]);

          resetStrategy(finalBalance, "TP", finalPnl);
          return;
        }
      }

      // 4. EXIT: Iron Stop Loss (SL) Check
      // Trigger: Slot 5 filled AND price continues down to 2037.3 (Average price ~2068.92 - ~31.62 points)
      // Cap max loss to 10% - 15% of initial capital
      const slot5Filled = slots.find(s => s.slot === 5)?.status === "filled";
      const slTriggerPrice = direction === "short"
        ? basePrice - gridDistance * 5
        : basePrice - gridDistance;
      
      if (slot5Filled && newPrice <= slTriggerPrice) {
        const finalPnl = (newPrice - averagePrice) * totalEthSize;
        const finalBalance = balance + finalPnl;
        
        setBalance(parseFloat(finalBalance.toFixed(2)));
        setRealizedPnl((prev) => parseFloat((prev + finalPnl).toFixed(2)));

        setTradeHistory((prev) => [
          {
            id: Math.random().toString(36).substring(7),
            time: getFormattedTime(),
            type: "SL",
            pnl: parseFloat(finalPnl.toFixed(2)),
            percentage: parseFloat(((finalPnl / initialCapital) * 100).toFixed(2)),
            slotsFilled: 5,
            avgPrice: parseFloat(averagePrice.toFixed(2)),
            exitPrice: parseFloat(newPrice.toFixed(2)),
          },
          ...prev,
        ]);

        resetStrategy(finalBalance, "SL", finalPnl);
        return;
      }
    }
  }, [
    strategyStatus,
    candles,
    rightSideFilterEnabled,
    rightSidePaused,
    totalEthSize,
    averagePrice,
    balance,
    slots,
    gridDistance,
    basePrice,
    initialCapital,
    resetStrategy,
    addLog,
  ]);

  // Core execution: Trigger a specific martingale limit slot order
  const triggerSlotOrder = (slotIndex: number, fillPrice: number) => {
    setSlots((prevSlots) => {
      const updated = prevSlots.map((s) => {
        if (s.slot === slotIndex && s.status === "pending") {
          addLog("order", `LIMIT FILL: Slot ${slotIndex} Order triggered and filled at $${fillPrice.toFixed(2)}. Allocated Margin: $${s.sizeUsd.toFixed(2)}.`);
          return { ...s, status: "filled" as const, filledAt: fillPrice };
        }
        return s;
      });

      // Re-calculate Position average holding price and size
      recalculatePosition(updated);
      return updated;
    });
  };

  // Recalculates position average holding price and sizes from active slots
  const recalculatePosition = (activeSlots: SlotOrder[]) => {
    const filledSlots = activeSlots.filter((s) => s.status === "filled");
    if (filledSlots.length === 0) {
      setAveragePrice(0.0);
      setTotalEthSize(0.0);
      setTotalUsdMargin(0.0);
      return;
    }

    const totalMargin = filledSlots.reduce((acc, curr) => acc + curr.sizeUsd, 0);
    
    // Average price = Sum(Margin_USD) / Sum(Margin_USD / triggerPrice)
    const sumWeightedReciprocal = filledSlots.reduce(
      (acc, curr) => acc + (curr.sizeUsd / (curr.filledAt || curr.triggerPrice)),
      0
    );

    const calculatedAvgPrice = totalMargin / sumWeightedReciprocal;

    // Total Leveraged ETH controlled
    const totalEth = filledSlots.reduce((acc, curr) => acc + curr.sizeEth, 0);

    setAveragePrice(parseFloat(calculatedAvgPrice.toFixed(2)));
    setTotalEthSize(parseFloat(totalEth.toFixed(6)));
    setTotalUsdMargin(parseFloat(totalMargin.toFixed(2)));
  };

  // Match active limit grid prices
  const matchGridOrders = (newPrice: number) => {
    slots.forEach((s) => {
      if (s.status === "pending") {
        const triggered = direction === "short"
          ? newPrice >= s.triggerPrice
          : newPrice <= s.triggerPrice;
        if (triggered) triggerSlotOrder(s.slot, s.triggerPrice);
      }
    });
  };

  // Match limit orders that were blocked during safety pause
  const matchBlockedLimitOrders = (newPrice: number) => {
    slots.forEach((s) => {
      if (s.status === "pending") {
        const triggered = direction === "short"
          ? newPrice >= s.triggerPrice
          : newPrice <= s.triggerPrice;
        if (triggered) triggerSlotOrder(s.slot, newPrice);
      }
    });
  };

  // --- Push a complete new simulated Candle ---
  const pushNewCandle = useCallback((open: number, high: number, low: number, close: number, isBearishBlock: boolean = false) => {
    setCandles((prevCandles) => {
      const nextCandles = [...prevCandles];
      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

      const newCandle: Candle = {
        time: timeStr,
        open: parseFloat(open.toFixed(2)),
        high: parseFloat(high.toFixed(2)),
        low: parseFloat(low.toFixed(2)),
        close: parseFloat(close.toFixed(2)),
        volume: parseFloat((100 + Math.random() * 200).toFixed(2)),
        bbUpper: 0,
        bbMiddle: 0,
        bbLower: 0,
        rightSideBlocked: isBearishBlock,
      };

      nextCandles.push(newCandle);
      
      // Maintain last 35 candles to avoid memory grow
      if (nextCandles.length > 35) {
        nextCandles.shift();
      }

      computeBollingerBands(nextCandles);
      return nextCandles;
    });

    // Feed new price to hook trigger
    handlePriceTick(close, true);
  }, [handlePriceTick]);

  // --- Trigger Presets Simulation Actions ---
  const runPresetScenario = useCallback((scenarioName: "profit" | "stoploss" | "rightside" | "sideways") => {
    // Terminate active timer
    if (autoSimIntervalRef.current) {
      clearInterval(autoSimIntervalRef.current);
      autoSimIntervalRef.current = null;
    }
    setIsAutoSimulating(false);

    // Reset layout
    const initialBalance = 3125.0;
    setBalance(initialBalance);
    setFloatingPnl(0.0);
    setMarginEquity(initialBalance);
    
    // Clear and build fresh candles matching base
    const startPrice = 2125.0;
    let localCandles: Candle[] = [];
    let p = startPrice;
    
    // Draw 20 stable sideways candles
    for (let i = 0; i < 20; i++) {
      const o = p;
      const c = p + (Math.random() - 0.5) * 4;
      const h = Math.max(o, c) + Math.random() * 2;
      const l = Math.min(o, c) - Math.random() * 2;
      p = c;
      localCandles.push({
        time: `10:${(i * 5).toString().padStart(2, "0")}`,
        open: parseFloat(o.toFixed(2)),
        high: parseFloat(h.toFixed(2)),
        low: parseFloat(l.toFixed(2)),
        close: parseFloat(c.toFixed(2)),
        volume: 150.0,
        bbUpper: 0,
        bbMiddle: 0,
        bbLower: 0,
      });
    }

    computeBollingerBands(localCandles);
    setCandles(localCandles);
    setCurrentPrice(localCandles[localCandles.length - 1].close);
    
    // Reset Grid Orders with standard settings
    setDirection("short");
    const activeSlots = resetGridSlots(2112.3, 15.0, "short");
    setStrategyStatus("inactive");
    setAveragePrice(0.0);
    setTotalEthSize(0.0);
    setTotalUsdMargin(0.0);
    setRightSidePaused(false);

    addLog("system", `PRESET SIMULATION: Running "${scenarioName.toUpperCase()}" scenario.`);

    // Timeline steps container
    let step = 0;
    let currentLocalPrice = localCandles[localCandles.length - 1].close;

    const intervalTime = 1200; // time between K-line intervals

    autoSimIntervalRef.current = setInterval(() => {
      step++;
      
      let o = currentLocalPrice;
      let c = o;
      let h = o;
      let l = o;
      let latestCandleCompleted = true;
      let blockCheck = false;

      if (scenarioName === "profit") {
        /**
         * Scenario: Profit (TP)
         * Step 1: Big drop, piercing Lower Band (2112.3) -> 2110.0 (Slot 1 filled)
         * Step 2: Falls further -> 2095.0 (Slot 2 filled)
         * Step 3: Falls further -> 2080.0 (Slot 3 filled) - Avg Price now ~2091.1
         * Step 4: Rebound starts -> 2095.0
         * Step 5: Sharp Rebound -> 2108.5 (TP triggered - Avg Price 2091.1 + 16.6 = 2107.7)
         */
        if (step === 1) {
          c = 2110.0; l = 2109.0; h = o;
        } else if (step === 2) {
          c = 2095.0; l = 2094.0; h = o;
        } else if (step === 3) {
          c = 2080.0; l = 2079.0; h = o;
        } else if (step === 4) {
          c = 2092.0; h = 2093.0; l = 2079.0;
        } else if (step === 5) {
          c = 2110.0; h = 2111.0; l = o;
        } else {
          // End of simulation
          clearInterval(autoSimIntervalRef.current!);
          autoSimIntervalRef.current = null;
          return;
        }
      } else if (scenarioName === "stoploss") {
        /**
         * Scenario: Stop Loss (SL)
         * Step 1: drop to 2110.0 (Slot 1)
         * Step 2: drop to 2095.0 (Slot 2)
         * Step 3: drop to 2080.0 (Slot 3)
         * Step 4: drop to 2065.0 (Slot 4)
         * Step 5: drop to 2050.0 (Slot 5) - Avg Price 2068.9
         * Step 6: Market continues dropping to 2035.0 (SL triggers at 2037.3)
         */
        if (step === 1) {
          c = 2110.0; l = 2109.0; h = o;
        } else if (step === 2) {
          c = 2095.0; l = 2094.0; h = o;
        } else if (step === 3) {
          c = 2080.0; l = 2079.0; h = o;
        } else if (step === 4) {
          c = 2065.0; l = 2064.0; h = o;
        } else if (step === 5) {
          c = 2050.0; l = 2049.0; h = o;
        } else if (step === 6) {
          c = 2035.0; l = 2034.0; h = o;
        } else {
          clearInterval(autoSimIntervalRef.current!);
          autoSimIntervalRef.current = null;
          return;
        }
      } else if (scenarioName === "rightside") {
        /**
         * Scenario: Right-side filter testing
         * Step 1: A massive red candle: 2125.0 down to 2090.0! (Extremely large body, pierces lower band 2112.3)
         *        If safety check is active, it blocks grid fills (Paused status).
         * Step 2: Price continues down to 2075.0 (Grid orders are STILL blocked, preserving margin!).
         * Step 3: Stable candle (rebound/stabilization): closes at 2082.0 (closes above 2075.0, forming a small green candle).
         *        Safety is resolved, grid triggers at current market price!
         * Step 4: Strong recovery to 2105.0 -> Take Profit triggered!
         */
        if (step === 1) {
          c = 2090.0; l = 2088.0; h = o;
          blockCheck = true;
        } else if (step === 2) {
          c = 2075.0; l = 2074.0; h = o;
        } else if (step === 3) {
          // Rebound candle
          c = 2085.0; h = 2086.0; l = 2074.0;
        } else if (step === 4) {
          c = 2108.0; h = 2109.0; l = o;
        } else {
          clearInterval(autoSimIntervalRef.current!);
          autoSimIntervalRef.current = null;
          return;
        }
      } else if (scenarioName === "sideways") {
        /**
         * Scenario: Sideways Wobble
         * Wobbling within Bollinger Bands (no lower band piercing, grid remains inactive)
         */
        c = 2125.0 + (Math.random() - 0.5) * 5.0;
        h = Math.max(o, c) + Math.random() * 2;
        l = Math.min(o, c) - Math.random() * 2;
        if (step > 6) {
          clearInterval(autoSimIntervalRef.current!);
          autoSimIntervalRef.current = null;
          return;
        }
      }

      currentLocalPrice = c;

      // Update K-line candles
      setCandles((prevCandles) => {
        const nextCandles = [...prevCandles];
        const nextTime = new Date();
        const timeStr = `${nextTime.getHours().toString().padStart(2, "0")}:${nextTime.getMinutes().toString().padStart(2, "0")}`;

        nextCandles.push({
          time: timeStr,
          open: parseFloat(o.toFixed(2)),
          high: parseFloat(h.toFixed(2)),
          low: parseFloat(l.toFixed(2)),
          close: parseFloat(c.toFixed(2)),
          volume: 200.0,
          bbUpper: 0,
          bbMiddle: 0,
          bbLower: 0,
          rightSideBlocked: blockCheck,
        });

        if (nextCandles.length > 35) nextCandles.shift();
        computeBollingerBands(nextCandles);
        return nextCandles;
      });

      // Update terminal hook
      handlePriceTick(c, latestCandleCompleted);

    }, intervalTime);

  }, [resetGridSlots, handlePriceTick, balance, initialCapital, slots]);

  // --- Manual tick price modifications ---
  const simulatePriceTick = useCallback((tickAmt: number) => {
    const nextPrice = parseFloat((currentPrice + tickAmt).toFixed(2));
    
    // Update the last candle close and high/low
    setCandles((prev) => {
      if (prev.length === 0) return prev;
      const updated = [...prev];
      const last = { ...updated[updated.length - 1] };
      last.close = nextPrice;
      last.high = Math.max(last.high, nextPrice);
      last.low = Math.min(last.low, nextPrice);
      updated[updated.length - 1] = last;
      computeBollingerBands(updated);
      return updated;
    });

    handlePriceTick(nextPrice, false);
  }, [currentPrice, handlePriceTick]);

  // Clean interval on unmount
  useEffect(() => {
    return () => {
      if (autoSimIntervalRef.current) {
        clearInterval(autoSimIntervalRef.current);
      }
    };
  }, []);

  return {
    initialCapital,
    setInitialCapital,
    leverage,
    setLeverage,
    basePrice,
    setBasePrice,
    gridDistance,
    setGridDistance,
    totalSlots,
    balance,
    floatingPnl,
    marginEquity,
    setMarginEquity,
    realizedPnl,
    strategyStatus,
    averagePrice,
    totalEthSize,
    totalUsdMargin,
    slots,
    rightSideFilterEnabled,
    setRightSideFilterEnabled,
    rightSidePaused,
    currentPrice,
    candles,
    logs,
    tradeHistory,
    isAutoSimulating,
    simulationSpeed,
    setSimulationSpeed,
    resetGridSlots,
    resetStrategy,
    forceMarketClose,
    direction,
    selectDirection,
    simulatePriceTick,
    pushNewCandle,
    runPresetScenario,
    loadStrategy,
    currentStrategyId,
  };
}
