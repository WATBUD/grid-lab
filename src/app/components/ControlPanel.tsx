"use client";

import React, { useState } from "react";

interface ControlPanelProps {
  basePrice: number;
  setBasePrice: (val: number) => void;
  gridDistance: number;
  setGridDistance: (val: number) => void;
  rightSideFilterEnabled: boolean;
  setRightSideFilterEnabled: (val: boolean) => void;
  rightSidePaused: boolean;
  simulatePriceTick: (amt: number) => void;
  runPresetScenario: (scenario: "profit" | "stoploss" | "rightside" | "sideways") => void;
  resetStrategy: () => void;
  forceMarketClose: () => void;
  totalEthSize: number;
  currentPrice: number;
  strategyStatus: string;
  id?: string;
}

export default function ControlPanel({
  basePrice,
  setBasePrice,
  gridDistance,
  setGridDistance,
  rightSideFilterEnabled,
  setRightSideFilterEnabled,
  rightSidePaused,
  simulatePriceTick,
  runPresetScenario,
  resetStrategy,
  forceMarketClose,
  totalEthSize,
  currentPrice,
  strategyStatus,
  id,
}: ControlPanelProps) {
  
  const [localBasePrice, setLocalBasePrice] = useState(basePrice.toString());
  const [localDistance, setLocalDistance] = useState(gridDistance.toString());

  const handleApplyParams = (e: React.FormEvent) => {
    e.preventDefault();
    const bp = parseFloat(localBasePrice);
    const gd = parseFloat(localDistance);
    if (!isNaN(bp) && bp > 0) setBasePrice(bp);
    if (!isNaN(gd) && gd > 0) setGridDistance(gd);
  };

  return (
    <div id={id} className="glass-panel p-5 flex flex-col gap-5">
      <div className="border-b border-white/5 pb-3">
        <span className="text-xs text-slate-400 uppercase tracking-widest font-semibold">
          Terminal Strategy Console
        </span>
      </div>

      {/* 1. Preset Scenarios Buttons */}
      <div className="flex flex-col gap-2">
        <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
          Simulate Preset Market Scenarios
        </span>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => runPresetScenario("profit")}
            className="trading-btn btn-secondary text-xs text-emerald-400 hover:text-emerald-300 py-2.5"
          >
            📈 Perfect Rebound (TP)
          </button>
          <button
            onClick={() => runPresetScenario("stoploss")}
            className="trading-btn btn-secondary text-xs text-rose-400 hover:text-rose-300 py-2.5"
          >
            📉 Sudden Drop (SL)
          </button>
          <button
            onClick={() => runPresetScenario("rightside")}
            className="trading-btn btn-secondary text-xs text-amber-400 hover:text-amber-300 py-2.5"
          >
            🛡 Right-Side Safety Test
          </button>
          <button
            onClick={() => runPresetScenario("sideways")}
            className="trading-btn btn-secondary text-xs text-slate-300 hover:text-slate-200 py-2.5"
          >
            ⚖ Sideways Wobble
          </button>
        </div>
      </div>

      {/* 2. Manual Tick Adjustments */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
            Manual Price Controller
          </span>
          <span className="mono-text text-xs font-semibold text-cyan-400">
            Price: ${currentPrice.toFixed(2)}
          </span>
        </div>
        <div className="grid grid-cols-4 gap-1">
          <button
            onClick={() => simulatePriceTick(-5.0)}
            className="trading-btn btn-secondary py-1 px-2 text-xs font-medium text-rose-400"
          >
            -5.0
          </button>
          <button
            onClick={() => simulatePriceTick(-1.0)}
            className="trading-btn btn-secondary py-1 px-2 text-xs font-medium text-rose-400/80"
          >
            -1.0
          </button>
          <button
            onClick={() => simulatePriceTick(1.0)}
            className="trading-btn btn-secondary py-1 px-2 text-xs font-medium text-emerald-400/80"
          >
            +1.0
          </button>
          <button
            onClick={() => simulatePriceTick(5.0)}
            className="trading-btn btn-secondary py-1 px-2 text-xs font-medium text-emerald-400"
          >
            +5.0
          </button>
        </div>
      </div>

      {/* 3. Safety Filter Toggle */}
      <div className="bg-slate-950/30 border border-white/5 rounded-xl p-3 flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-semibold text-slate-200 flex items-center gap-1">
              🛡 Right-Side Safety Filter
            </span>
            <span className="text-[10px] text-slate-400">
              Suspends entries on aggressive bearish candles
            </span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rightSideFilterEnabled}
              onChange={(e) => setRightSideFilterEnabled(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-500 peer-checked:after:bg-white peer-checked:after:border-transparent"></div>
          </label>
        </div>
        
        {/* Safety state indicator */}
        {rightSidePaused ? (
          <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-md p-2 text-[10px] font-medium flex items-center gap-1.5 animate-pulse">
            <span>🔴 Grid Suspended: Falling knife protection active. Waiting for stabilized close.</span>
          </div>
        ) : rightSideFilterEnabled ? (
          <div className="bg-cyan-500/5 border border-cyan-500/10 text-cyan-400 rounded-md p-2 text-[10px] font-medium flex items-center gap-1.5">
            <span>🟢 Safety Filter Active: Ready to intercept solid bearish runs.</span>
          </div>
        ) : (
          <div className="bg-rose-500/5 border border-rose-500/10 text-rose-400 rounded-md p-2 text-[10px] font-medium flex items-center gap-1.5">
            <span>⚠ Safety Filter Off: Raw left-side triggers will fill grid immediately.</span>
          </div>
        )}
      </div>

      {/* 4. Strategy Parameters Forms */}
      <form onSubmit={handleApplyParams} className="flex flex-col gap-3">
        <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
          Configure Strategy Base
        </span>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-slate-400">BASE PRICE (Lower BB)</label>
            <input
              type="number"
              step="0.1"
              value={localBasePrice}
              onChange={(e) => setLocalBasePrice(e.target.value)}
              className="bg-slate-900/50 border border-white/10 rounded-lg py-1.5 px-3 text-xs text-white focus:outline-none focus:border-cyan-500/50 font-medium mono-text"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-slate-400">GRID DISTANCE (USD)</label>
            <input
              type="number"
              step="0.5"
              value={localDistance}
              onChange={(e) => setLocalDistance(e.target.value)}
              className="bg-slate-900/50 border border-white/10 rounded-lg py-1.5 px-3 text-xs text-white focus:outline-none focus:border-cyan-500/50 font-medium mono-text"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={strategyStatus !== "inactive"}
          className="trading-btn btn-secondary text-xs py-2 disabled:opacity-40 disabled:cursor-not-allowed text-slate-200"
        >
          Save & Apply Parameters
        </button>
        {strategyStatus !== "inactive" && (
          <span className="text-[9px] text-slate-500 text-center italic">
            * Parameters locked while strategy grid is active.
          </span>
        )}
      </form>

      {/* 5. Liquidations buttons */}
      <div className="grid grid-cols-2 gap-2 border-t border-white/5 pt-4">
        <button
          onClick={resetStrategy}
          className="trading-btn btn-secondary text-xs text-slate-400 py-2.5"
        >
          Reset Strategy
        </button>
        <button
          onClick={forceMarketClose}
          disabled={totalEthSize === 0}
          className="trading-btn btn-danger text-xs py-2.5 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          🚨 Market Close All
        </button>
      </div>
    </div>
  );
}
