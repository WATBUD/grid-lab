"use client";

import React, { useState } from "react";
import { LogEntry, TradeHistory } from "@/hooks/useMartingale";

interface LogConsoleProps {
  logs: LogEntry[];
  tradeHistory: TradeHistory[];
  id?: string;
}

export default function LogConsole({ logs, tradeHistory, id }: LogConsoleProps) {
  const [activeTab, setActiveTab] = useState<"logs" | "history">("logs");

  const getLogColorClass = (type: LogEntry["type"]) => {
    switch (type) {
      case "order":
        return "text-emerald-400 font-semibold";
      case "tp":
        return "text-cyan-400 font-bold";
      case "sl":
        return "text-rose-400 font-bold";
      case "warning":
        return "text-amber-400 font-medium";
      case "info":
        return "text-indigo-300";
      default:
        return "text-slate-300";
    }
  };

  return (
    <div id={id} className="glass-panel p-5 flex flex-col gap-4 min-h-[300px]">
      {/* Tabs Headers */}
      <div className="flex items-center justify-between border-b border-white/5 pb-2">
        <div className="flex items-center gap-1.5 bg-slate-900/60 p-1 rounded-xl border border-white/5">
          <button
            onClick={() => setActiveTab("logs")}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "logs"
                ? "bg-slate-800 text-white shadow-md"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Activity Logs ({logs.length})
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "history"
                ? "bg-slate-800 text-white shadow-md"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Completed Trades ({tradeHistory.length})
          </button>
        </div>
        <div className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
          Terminal Console
        </div>
      </div>

      {/* Tab Contents: Logs */}
      {activeTab === "logs" && (
        <div className="flex-1 max-h-[220px] overflow-y-auto pr-1 flex flex-col gap-2 font-mono text-[11px] select-text">
          {logs.length === 0 ? (
            <div className="text-slate-600 italic text-center py-10">No terminal activity recorded yet.</div>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="log-message flex items-start gap-2 border-b border-white/2 pb-1.5 last:border-b-0 leading-relaxed">
                <span className="text-slate-500 shrink-0">[{log.timestamp}]</span>
                <span className={`shrink-0 uppercase text-[9px] px-1 rounded bg-white/5 border border-white/5 font-semibold`}>
                  {log.type}
                </span>
                <span className={getLogColorClass(log.type)}>{log.message}</span>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab Contents: Trade History */}
      {activeTab === "history" && (
        <div className="flex-1 max-h-[220px] overflow-y-auto pr-1 flex flex-col gap-2 text-[11px]">
          {tradeHistory.length === 0 ? (
            <div className="text-slate-600 italic text-center py-10 font-mono">No trades completed in this session.</div>
          ) : (
            <div className="flex flex-col gap-2 select-text">
              {tradeHistory.map((trade) => {
                const isTp = trade.type === "TP";
                return (
                  <div
                    key={trade.id}
                    className={`p-3 rounded-xl border flex items-center justify-between transition-all hover:bg-white/1 ${
                      isTp
                        ? "bg-emerald-500/5 border-emerald-500/20"
                        : "bg-rose-500/5 border-rose-500/20"
                    }`}
                  >
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                          isTp ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
                        }`}>
                          {trade.type}
                        </span>
                        <span className="text-slate-400 font-mono text-[10px]">@{trade.time}</span>
                      </div>
                      <div className="text-slate-300">
                        Avg: <span className="mono-text font-medium text-slate-200">${trade.avgPrice}</span> | 
                        Exit: <span className="mono-text font-medium text-slate-200">${trade.exitPrice}</span>
                      </div>
                    </div>

                    <div className="text-right flex flex-col gap-0.5">
                      <div className={`font-bold font-mono text-xs ${isTp ? "text-emerald-400" : "text-rose-400"}`}>
                        {isTp ? "+" : ""}
                        ${trade.pnl.toFixed(2)}
                      </div>
                      <div className={`text-[10px] font-mono font-semibold ${isTp ? "text-emerald-400/80" : "text-rose-400/80"}`}>
                        {isTp ? "+" : ""}
                        {trade.percentage.toFixed(2)}% ROI
                      </div>
                      <div className="text-[9px] text-slate-400">
                        {trade.slotsFilled} Slots Filled
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
