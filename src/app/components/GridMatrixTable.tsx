"use client";

import React from "react";
import { SlotOrder } from "@/hooks/useMartingale";
import { StrategyId } from "@/app/constants/strategyConfigs";

interface GridMatrixTableProps {
  slots: SlotOrder[];
  averagePrice: number;
  id?: string;
  strategyId?: StrategyId;
  positionSizeWeightsLength?: number;
  setFibonacciWeightsLength?: (length: number) => void;
}

export default function GridMatrixTable({
  slots,
  averagePrice,
  id,
  strategyId,
  positionSizeWeightsLength,
  setFibonacciWeightsLength,
}: GridMatrixTableProps) {
  const canAdjustFibonacciLength = strategyId === StrategyId.FIBONACCI
    && positionSizeWeightsLength !== undefined
    && setFibonacciWeightsLength !== undefined;

  return (
    <div id={id} className="glass-panel p-5 flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 pb-3">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-base text-slate-200 uppercase tracking-widest font-bold">
            Grid Matrix ({slots.length} Slots)
          </span>
          {canAdjustFibonacciLength && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setFibonacciWeightsLength(positionSizeWeightsLength - 1)}
                disabled={positionSizeWeightsLength <= 1}
                className="h-7 w-7 rounded-lg border border-white/10 bg-white/5 text-sm font-bold text-slate-300 transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                title="Remove Fibonacci slot"
              >
                -
              </button>
              <span className="min-w-10 text-center text-xs text-cyan-300 mono-text">
                {positionSizeWeightsLength}
              </span>
              <button
                type="button"
                onClick={() => setFibonacciWeightsLength(positionSizeWeightsLength + 1)}
                className="h-7 w-7 rounded-lg border border-cyan-500/30 bg-cyan-500/10 text-sm font-bold text-cyan-300 transition-colors hover:bg-cyan-500/20"
                title="Add Fibonacci slot"
              >
                +
              </button>
            </div>
          )}
        </div>
        {averagePrice > 0 && (
          <span className="text-[10px] bg-amber-500/10 border border-amber-500/30 text-amber-400 px-2 py-0.5 rounded-full mono-text">
            5-Slot Theoretical Avg: 2068.9
          </span>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="text-slate-200 border-b border-white/5 pb-2">
              <th className="pb-3 font-bold w-12 pl-3">#</th>
              <th className="pb-3 font-bold px-4">Trigger Price</th>
              <th className="pb-3 font-bold text-right px-4 w-24">Weight %</th>
              <th className="pb-3 font-bold text-right px-4 pr-6">Margin Size</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {slots.map((s) => {
              return (
                <tr
                  key={s.slot}
                  className="transition-all duration-200 hover:bg-white/2"
                >
                  <td className="py-3.5 pl-3 pr-2 font-bold">
                    <span className="inline-flex items-center justify-center h-6 w-6 rounded-md text-xs bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      {s.slot}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-semibold mono-text text-white">
                    ${s.triggerPrice.toFixed(2)}
                  </td>
                  <td className="py-3.5 text-right font-semibold mono-text text-slate-200 px-4 w-24">
                    {strategyId === StrategyId.FIBONACCI ? s.sizePercent.toFixed(0) : s.sizePercent.toFixed(2)}%
                  </td>
                  <td className="py-3.5 text-right font-semibold mono-text text-white px-4 pr-6">
                    ${s.sizeUsd.toFixed(2)}
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
