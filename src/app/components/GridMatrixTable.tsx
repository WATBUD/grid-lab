"use client";

import React from "react";
import { SlotOrder } from "@/hooks/useMartingale";

interface GridMatrixTableProps {
  slots: SlotOrder[];
  averagePrice: number;
  id?: string;
}

export default function GridMatrixTable({ slots, averagePrice, id }: GridMatrixTableProps) {
  
  // Find which is the next pending order
  const getNextPendingSlot = () => {
    const pending = slots.filter((s) => s.status === "pending");
    if (pending.length === 0) return null;
    // The next pending is the one with the highest trigger price
    return Math.min(...pending.map((s) => s.slot));
  };

  const nextPendingSlot = getNextPendingSlot();

  return (
    <div id={id} className="glass-panel p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <span className="text-xs text-slate-400 uppercase tracking-widest font-semibold">
          Fibonacci Martingale Grid Matrix (5 Slots)
        </span>
        {averagePrice > 0 && (
          <span className="text-[10px] bg-amber-500/10 border border-amber-500/30 text-amber-400 px-2 py-0.5 rounded-full mono-text">
            5-Slot Theoretical Avg: 2068.9
          </span>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="text-slate-400 border-b border-white/5 pb-2">
              <th className="pb-3 font-semibold">Slot (檔位)</th>
              <th className="pb-3 font-semibold text-right">Trigger Price</th>
              <th className="pb-3 font-semibold text-right">Weight %</th>
              <th className="pb-3 font-semibold text-right">Margin Size</th>
              <th className="pb-3 font-semibold text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {slots.map((s) => {
              const isFilled = s.status === "filled";
              const isNext = s.slot === nextPendingSlot;
              
              let rowClass = "grid-row-pending";
              if (isFilled) {
                rowClass = "grid-row-filled";
              } else if (isNext) {
                rowClass = "grid-row-active";
              }

              return (
                <tr
                  key={s.slot}
                  className={`transition-all duration-200 hover:bg-white/[0.02] ${rowClass}`}
                >
                  <td className="py-3.5 pl-3 font-semibold">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center justify-center h-5 w-5 rounded-md text-[10px] ${
                        isFilled 
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" 
                          : isNext 
                            ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 animate-pulse" 
                            : "bg-slate-800 text-slate-400"
                      }`}>
                        #{s.slot}
                      </span>
                      <span className={isFilled ? "text-emerald-400" : isNext ? "text-cyan-400" : "text-slate-300"}>
                        第 {s.slot} 注
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 text-right font-medium mono-text text-slate-200">
                    ${s.triggerPrice.toFixed(2)}
                  </td>
                  <td className="py-3.5 text-right font-medium mono-text text-slate-400">
                    {s.sizePercent.toFixed(1)}%
                  </td>
                  <td className="py-3.5 text-right font-medium mono-text text-slate-200">
                    ${s.sizeUsd.toFixed(2)}
                    <div className="text-[10px] text-slate-400">
                      ({s.sizeEth.toFixed(4)} ETH)
                    </div>
                  </td>
                  <td className="py-3.5 text-center">
                    {isFilled ? (
                      <span className="inline-flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded text-[10px] font-semibold">
                        FILLED
                      </span>
                    ) : isNext ? (
                      <span className="inline-flex items-center gap-1 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded text-[10px] font-semibold animate-pulse">
                        PENDING
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-slate-800 text-slate-500 px-2 py-0.5 rounded text-[10px] font-medium">
                        QUEUED
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
