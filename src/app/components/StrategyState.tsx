"use client";

import React from "react";

interface StrategyStateProps {
  balance: number;
  floatingPnl: number;
  marginEquity: number;
  realizedPnl: number;
  strategyStatus: "inactive" | "running" | "paused_safety" | "tp_triggered" | "sl_triggered";
  averagePrice: number;
  totalEthSize: number;
  totalUsdMargin: number;
  leverage: number;
  initialCapital: number;
}

export default function StrategyState({
  balance,
  floatingPnl,
  marginEquity,
  realizedPnl,
  strategyStatus,
  averagePrice,
  totalEthSize,
  totalUsdMargin,
  leverage,
  initialCapital,
}: StrategyStateProps) {
  
  // Format numbers to fixed precision
  const formatUSD = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(val);
  };

  const getStatusBadge = () => {
    switch (strategyStatus) {
      case "inactive":
        return <span className="status-badge status-inactive">● Idle (Waiting BB Lower)</span>;
      case "running":
        return <span className="status-badge status-running">● Grid Active</span>;
      case "paused_safety":
        return <span className="status-badge status-paused">⚠ Safety Paused (Right-Side)</span>;
      default:
        return <span className="status-badge status-inactive">● Idle</span>;
    }
  };

  const pnlPercent = (floatingPnl / initialCapital) * 100;
  const isPnlPositive = floatingPnl >= 0;
  const realizedPercent = (realizedPnl / initialCapital) * 100;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full">
      {/* 1. Account Equity Card */}
      <div className={`glass-panel p-5 flex flex-col gap-1.5 ${strategyStatus !== "inactive" ? "glass-panel-active" : ""}`}>
        <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Account Equity</span>
        <div className="text-2xl font-bold tracking-tight mono-text">
          {formatUSD(marginEquity)}
        </div>
        <div className="flex items-center justify-between text-xs mt-1 border-t border-white/5 pt-2">
          <span className="text-slate-400">Initial Capital</span>
          <span className="mono-text font-semibold text-slate-300">{formatUSD(initialCapital)}</span>
        </div>
      </div>

      {/* 2. Floating PnL Card */}
      <div className="glass-panel p-5 flex flex-col gap-1.5">
        <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Floating PnL (10x Leverage)</span>
        <div className={`text-2xl font-bold tracking-tight mono-text ${floatingPnl > 0 ? "text-emerald-400" : floatingPnl < 0 ? "text-rose-400" : "text-slate-300"}`}>
          {floatingPnl > 0 ? "+" : ""}
          {formatUSD(floatingPnl)}
        </div>
        <div className="flex items-center justify-between text-xs mt-1 border-t border-white/5 pt-2">
          <span className="text-slate-400">ROI Percent</span>
          <span className={`mono-text font-semibold ${isPnlPositive ? "text-emerald-400" : "text-rose-400"}`}>
            {isPnlPositive ? "+" : ""}
            {pnlPercent.toFixed(2)}%
          </span>
        </div>
      </div>

      {/* 3. Position Details Card */}
      <div className="glass-panel p-5 flex flex-col gap-1.5">
        <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Active Position</span>
        {totalEthSize > 0 ? (
          <div className="flex flex-col gap-0.5">
            <div className="text-xl font-bold tracking-tight mono-text text-amber-400">
              {totalEthSize.toFixed(4)} ETH
            </div>
            <div className="text-xs text-slate-400">
              Avg. Price: <span className="mono-text text-slate-200">${averagePrice.toFixed(2)}</span>
            </div>
          </div>
        ) : (
          <div className="text-xl font-bold text-slate-500 italic py-1">No Active Position</div>
        )}
        <div className="flex items-center justify-between text-xs mt-1 border-t border-white/5 pt-2">
          <span className="text-slate-400">Position Margin</span>
          <span className="mono-text font-semibold text-slate-300">
            {totalUsdMargin > 0 ? formatUSD(totalUsdMargin) : "$0.00"}
          </span>
        </div>
      </div>

      {/* 4. Strategy & Realized Card */}
      <div className="glass-panel p-5 flex flex-col gap-1.5">
        <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Strategy Status</span>
        <div className="py-0.5">
          {getStatusBadge()}
        </div>
        <div className="flex items-center justify-between text-xs mt-1 border-t border-white/5 pt-2">
          <span className="text-slate-400">Realized PnL</span>
          <span className={`mono-text font-semibold ${realizedPnl > 0 ? "text-emerald-400" : realizedPnl < 0 ? "text-rose-400" : "text-slate-300"}`}>
            {realizedPnl > 0 ? "+" : ""}
            {formatUSD(realizedPnl)} ({realizedPercent.toFixed(1)}%)
          </span>
        </div>
      </div>
    </div>
  );
}
