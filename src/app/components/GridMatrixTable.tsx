"use client";

import React from "react";
import { SlotOrder } from "@/hooks/useMartingale";

interface GridMatrixTableProps {
  slots: SlotOrder[];
  averagePrice: number;
  id?: string;
}

export default function GridMatrixTable({ slots, averagePrice, id }: GridMatrixTableProps) {

  return (
    <div id={id} className="glass-panel p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <span className="text-xs text-slate-400 uppercase tracking-widest font-semibold">
          Grid Matrix (5 Slots)
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
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {slots.map((s) => {
              return (
                <tr
                  key={s.slot}
                  className="transition-all duration-200 hover:bg-white/[0.02]"
                >
                  <td className="py-3.5 pl-3 font-semibold">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center justify-center h-5 w-5 rounded-md text-[10px] bg-slate-800 text-slate-400">
                        #{s.slot}
                      </span>
                      <span className="text-slate-300">
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
