"use client";

import React from "react";

interface ControlPanelProps {
  basePrice: number;
  setBasePrice: (val: number) => void;
  gridDistance: number;
  setGridDistance: (val: number) => void;
  direction: "long" | "short";
  selectDirection: (dir: "long" | "short") => void;
  currentPrice: number;
  id?: string;
}

export default function ControlPanel({
  basePrice,
  setBasePrice,
  gridDistance,
  setGridDistance,
  direction,
  selectDirection,
  currentPrice,
  id,
}: ControlPanelProps) {
  return (
    <div id={id} className="glass-panel p-5 flex flex-col gap-5">
      <div className="border-b border-white/5 pb-3">
        <span className="text-xs text-slate-400 uppercase tracking-widest font-semibold">
          Strategy Configuration
        </span>
      </div>

      {/* 1. Direction Selection */}
      <div className="flex flex-col gap-2">
        <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
          Grid Direction (方向選擇)
        </span>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => selectDirection("long")}
            className={`trading-btn py-3.5 text-sm font-bold transition-all ${
              direction === "long"
                ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400 shadow-lg shadow-emerald-500/10"
                : "btn-secondary text-slate-400 hover:text-emerald-400 hover:border-emerald-500/30"
            }`}
          >
            ▲ 做多 LONG
          </button>
          <button
            onClick={() => selectDirection("short")}
            className={`trading-btn py-3.5 text-sm font-bold transition-all ${
              direction === "short"
                ? "bg-rose-500/20 border-rose-500/50 text-rose-400 shadow-lg shadow-rose-500/10"
                : "btn-secondary text-slate-400 hover:text-rose-400 hover:border-rose-500/30"
            }`}
          >
            ▼ 做空 SHORT
          </button>
        </div>
        <div className="text-[10px] text-slate-500 text-center font-medium mono-text">
          {direction === "long" ? "LONG ▲" : "SHORT ▼"} | Price: ${currentPrice.toFixed(2)} | Grid: {direction === "long" ? "+" : "-"}{gridDistance}/slot
        </div>
      </div>

      {/* 4. Strategy Parameters Forms */}
      <div className="flex flex-col gap-3">
        <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
          Configure Strategy Base
        </span>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-400">BASE PRICE</label>
            <input
              type="number"
              step="0.1"
              value={basePrice}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                if (!isNaN(val) && val > 0) setBasePrice(val);
              }}
              className="bg-slate-900/50 border border-white/10 rounded-lg py-1.5 px-3 text-xs text-white focus:outline-none focus:border-cyan-500/50 font-medium mono-text"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-400">GRID DISTANCE (USD)</label>
            <input
              type="number"
              step="0.5"
              value={gridDistance}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                if (!isNaN(val) && val > 0) setGridDistance(val);
              }}
              className="bg-slate-900/50 border border-white/10 rounded-lg py-1.5 px-3 text-xs text-white focus:outline-none focus:border-cyan-500/50 font-medium mono-text"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
