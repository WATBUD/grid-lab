"use client";

import React from "react";
import { useMartingale } from "@/hooks/useMartingale";
import StrategyState from "./components/StrategyState";
import TradingChart from "./components/TradingChart";
import GridMatrixTable from "./components/GridMatrixTable";
import ControlPanel from "./components/ControlPanel";
import LogConsole from "./components/LogConsole";

export default function Home() {
  const strategy = useMartingale();

  return (
    <div className="min-h-screen flex flex-col bg-[#06080d] text-slate-100 selection:bg-cyan-500/30">
      
      {/* 1. Header Terminal Nav */}
      <header className="border-b border-white/5 bg-slate-950/35 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-cyan-400 to-indigo-600 flex items-center justify-center shadow-md shadow-cyan-400/20">
              <span className="text-[11px] font-bold text-slate-950 font-mono">QL</span>
            </div>
            <div>
              <h1 id="terminal-heading" className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                QUANTLAB <span className="text-slate-500">//</span> 
                <span className="trading-title">ETH 5M Fibonacci Martingale Terminal</span>
              </h1>
              <p className="text-[10px] text-slate-400 font-medium font-mono">
                MODEL: ETH-5M-FIBO-MARTINGALE-10X
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 bg-white/5 border border-white/5 px-3 py-1.5 rounded-lg text-xs font-medium">
              <span className="text-slate-400">Target Asset:</span>
              <span className="text-white font-semibold">ETH/USD 合約</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg font-semibold animate-pulse">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
              Live Feed Connected
            </div>
          </div>
        </div>
      </header>

      {/* 2. Main Terminal Space */}
      <main className="flex-1 w-full max-w-[1600px] mx-auto p-4 md:p-6 flex flex-col gap-6" id="main-content">
        
        {/* A. Account indicators cards */}
        <section aria-labelledby="status-metrics" id="account-status-metrics">
          <h2 className="sr-only" id="status-metrics">Account Status Metrics</h2>
          <StrategyState
            balance={strategy.balance}
            floatingPnl={strategy.floatingPnl}
            marginEquity={strategy.marginEquity}
            realizedPnl={strategy.realizedPnl}
            strategyStatus={strategy.strategyStatus}
            averagePrice={strategy.averagePrice}
            totalEthSize={strategy.totalEthSize}
            totalUsdMargin={strategy.totalUsdMargin}
            leverage={strategy.leverage}
            initialCapital={strategy.initialCapital}
          />
        </section>

        {/* B. Columns Grid Dashboard */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          
          {/* B.1 Left Column: Charting and logs (8 cols on large screens) */}
          <section className="xl:col-span-8 flex flex-col gap-6" aria-labelledby="charting-and-logs" id="charting-logs-section">
            <h2 className="sr-only" id="charting-and-logs">Interactive Charting and Activity Logs</h2>
            
            {/* SVG Candlestick Chart */}
            <TradingChart
              candles={strategy.candles}
              currentPrice={strategy.currentPrice}
              averagePrice={strategy.averagePrice}
              slots={strategy.slots}
              strategyStatus={strategy.strategyStatus}
              simulatePriceTick={strategy.simulatePriceTick}
              rightSidePaused={strategy.rightSidePaused}
              id="chart-viewport"
            />
            
            {/* Action Log Console */}
            <LogConsole
              logs={strategy.logs}
              tradeHistory={strategy.tradeHistory}
              id="logs-viewport"
            />
          </section>

          {/* B.2 Right Column: Control knobs & parameters grid (4 cols on large screens) */}
          <section className="xl:col-span-4 flex flex-col gap-6" aria-labelledby="control-and-matrix" id="control-matrix-section">
            <h2 className="sr-only" id="control-and-matrix">Control Panel and Grid Matrix</h2>
            
            {/* Controller Knobs */}
            <ControlPanel
              basePrice={strategy.basePrice}
              setBasePrice={strategy.setBasePrice}
              gridDistance={strategy.gridDistance}
              setGridDistance={strategy.setGridDistance}
              rightSideFilterEnabled={strategy.rightSideFilterEnabled}
              setRightSideFilterEnabled={strategy.setRightSideFilterEnabled}
              rightSidePaused={strategy.rightSidePaused}
              simulatePriceTick={strategy.simulatePriceTick}
              runPresetScenario={strategy.runPresetScenario}
              resetStrategy={strategy.resetStrategy}
              forceMarketClose={strategy.forceMarketClose}
              totalEthSize={strategy.totalEthSize}
              currentPrice={strategy.currentPrice}
              strategyStatus={strategy.strategyStatus}
              id="control-console"
            />

            {/* Fibo slots matrix table */}
            <GridMatrixTable
              slots={strategy.slots}
              averagePrice={strategy.averagePrice}
              id="matrix-ledger"
            />
          </section>

        </div>
      </main>

      {/* 3. Footer Terminal Stats */}
      <footer className="border-t border-white/5 bg-slate-950/20 py-4 mt-auto">
        <div className="max-w-[1600px] mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-2 text-[10px] text-slate-500 font-medium font-mono">
          <div>
            SYSTEM: OK // ENGINE: FIBONACCI-MARTINGALE-V1.0
          </div>
          <div>
            10X 合約高槓桿風險警示：斐波那契馬丁非無風險套利，遇黑天鵝直下時請務必啟用右側交易防護並嚴格執行鋼鐵停損。
          </div>
          <div>
            © 2026 QUANTLAB GLOBAL. ALL SIMULATORS LOADED.
          </div>
        </div>
      </footer>
    </div>
  );
}
