"use client";

import React, { useState } from "react";
import { useMartingale } from "@/hooks/useMartingale";
import { STRATEGY_OPTIONS, StrategyId } from "@/app/constants/strategyConfigs";
import GridMatrixTable from "./components/GridMatrixTable";
import ControlPanel from "./components/ControlPanel";

export default function Home() {
  const strategy = useMartingale();
  const [editingEquity, setEditingEquity] = useState<number | null>(null);
  const [isEditingEquity, setIsEditingEquity] = useState(false);

  // Update strategy when equity is edited
  const handleEquityChange = (val: number) => {
    setEditingEquity(val);
    strategy.setInitialCapital(val);
    strategy.setBalance(val);
  };

  // Handle strategy selection
  const handleStrategyChange = (strategyId: StrategyId) => {
    strategy.loadStrategy(strategyId);
  };

  // Handle copy strategy name
  const handleCopyStrategyName = () => {
    const currentStrategy = STRATEGY_OPTIONS.find(s => s.id === strategy.currentStrategyId);
    if (currentStrategy) {
      navigator.clipboard.writeText(currentStrategy.name);
    }
  };

  const formatUSD = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(val);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#06080d] text-slate-100 selection:bg-cyan-500/30">
      
      {/* 1. Header Terminal Nav */}
      <header className="border-b border-white/5 bg-slate-950/35 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <div className="h-7 w-7 rounded-lg bg-linear-to-tr from-cyan-400 to-indigo-600 flex items-center justify-center shadow-md shadow-cyan-400/20 shrink-0">
              <span className="text-[11px] font-bold text-slate-950 font-mono">QL</span>
            </div>
            <div className="shrink-0 min-w-0 flex items-center gap-2">
              <select
                value={strategy.currentStrategyId}
                onChange={(e) => handleStrategyChange(e.target.value as StrategyId)}
                className="bg-slate-900/50 border border-white/10 rounded-lg px-2 sm:px-3 py-1.5 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-500/50 font-bold uppercase tracking-wider cursor-pointer w-full sm:w-auto"
              >
                {STRATEGY_OPTIONS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              <button
                onClick={handleCopyStrategyName}
                className="shrink-0 h-7 w-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
                title="Copy strategy name"
              >
                <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
            <div className="flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/30 px-3 py-2 sm:py-1.5 rounded-lg shrink-0">
              <span className="text-[10px] sm:text-[10px] text-cyan-300 font-medium">Equity:</span>
              {isEditingEquity ? (
                <input
                  type="number"
                  value={editingEquity ?? strategy.marginEquity}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    if (!isNaN(val)) {
                      handleEquityChange(val);
                    }
                  }}
                  onBlur={() => {
                    setIsEditingEquity(false);
                    setEditingEquity(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      setIsEditingEquity(false);
                      setEditingEquity(null);
                    }
                  }}
                  className="bg-transparent border-b border-cyan-400 focus:outline-none focus:border-cyan-300 w-28 sm:w-32 text-base sm:text-sm text-white font-bold mono-text"
                  autoFocus
                />
              ) : (
                <span
                  className="text-base sm:text-sm text-white font-bold mono-text cursor-pointer hover:text-cyan-300 transition-colors"
                  onClick={() => setIsEditingEquity(true)}
                  title="Click to edit"
                >
                  {formatUSD(strategy.marginEquity)}
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* 2. Main Terminal Space */}
      <main className="flex-1 w-full max-w-[1600px] mx-auto p-4 md:p-6 flex flex-col gap-6" id="main-content">
        
        {/* A. Fibonacci Martingale Grid Matrix (Main Focus) */}
        <section aria-labelledby="grid-matrix" id="grid-matrix-section">
          <h2 className="sr-only" id="grid-matrix">Grid Matrix</h2>
          <GridMatrixTable
            slots={strategy.slots}
            averagePrice={strategy.averagePrice}
            id="matrix-ledger"
            strategyId={strategy.currentStrategyId}
            positionSizeWeightsLength={strategy.positionSizeWeights.length}
            setFibonacciWeightsLength={strategy.setFibonacciWeightsLength}
          />
        </section>

        {/* B. Control Panel */}
        <section aria-labelledby="control-panel" id="control-panel-section">
          <h2 className="sr-only" id="control-panel">Control Panel</h2>
          <ControlPanel
            basePrice={strategy.basePrice}
            setBasePrice={strategy.setBasePrice}
            gridDistance={strategy.gridDistance}
            setGridDistance={strategy.setGridDistance}
            direction={strategy.direction}
            selectDirection={strategy.selectDirection}
            currentPrice={strategy.currentPrice}
            id="control-console"
          />
        </section>

      </main>

      {/* 3. Footer Terminal Stats */}
      <footer className="border-t border-white/5 bg-slate-950/20 py-4 mt-auto">
        <div className="max-w-[1600px] mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-2 text-[10px] text-slate-500 font-medium font-mono">
          <div>
            © 2026 QUANTLAB GLOBAL. ALL SIMULATORS LOADED.
          </div>
        </div>
      </footer>
    </div>
  );
}
