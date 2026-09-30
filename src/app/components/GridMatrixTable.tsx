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
  fibonacciBaseAmount?: number;
  setFibonacciBaseAmount?: (amount: number) => void;
  basePrice: number;
  setBasePrice: (price: number) => void;
  gridDistance: number;
  setGridDistance: (distance: number) => void;
}

interface NumberStepperProps {
  value: number;
  onChange: (value: number) => void;
  step: number;
  min?: number;
  ariaLabel: string;
  compact?: boolean;
}

function NumberStepper({
  value,
  onChange,
  step,
  min = 0.01,
  ariaLabel,
  compact = false,
}: NumberStepperProps) {
  const updateValue = (nextValue: number) => {
    const precision = step.toString().split(".")[1]?.length ?? 0;
    onChange(Number(Math.max(min, nextValue).toFixed(precision)));
  };

  return (
    <div className={`flex items-stretch overflow-hidden rounded-lg border border-white/10 bg-slate-900/70 transition-colors focus-within:border-cyan-500/50 ${compact ? "w-32" : "min-w-0 flex-1"}`}>
      <input
        type="number"
        min={min}
        step={step}
        value={value}
        onChange={(event) => {
          const nextValue = Number(event.target.value);
          if (Number.isFinite(nextValue) && nextValue >= min) onChange(nextValue);
        }}
        className="number-input-clean min-w-0 flex-1 bg-transparent px-3 py-2 text-right text-sm font-bold text-white outline-none mono-text"
        aria-label={ariaLabel}
      />
      <div className="grid w-8 shrink-0 grid-rows-2 border-l border-white/10 bg-white/3">
        <button
          type="button"
          onClick={() => updateValue(value + step)}
          className="flex items-center justify-center border-b border-white/10 text-slate-400 transition-colors hover:bg-cyan-500/15 hover:text-cyan-300 active:bg-cyan-500/25"
          aria-label={`Increase ${ariaLabel}`}
        >
          <svg viewBox="0 0 12 8" className="h-2 w-3" aria-hidden="true">
            <path d="M2 6 6 2l4 4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => updateValue(value - step)}
          className="flex items-center justify-center text-slate-400 transition-colors hover:bg-cyan-500/15 hover:text-cyan-300 active:bg-cyan-500/25"
          aria-label={`Decrease ${ariaLabel}`}
        >
          <svg viewBox="0 0 12 8" className="h-2 w-3" aria-hidden="true">
            <path d="m2 2 4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default function GridMatrixTable({
  slots,
  averagePrice,
  id,
  strategyId,
  positionSizeWeightsLength,
  setFibonacciWeightsLength,
  fibonacciBaseAmount,
  setFibonacciBaseAmount,
  basePrice,
  setBasePrice,
  gridDistance,
  setGridDistance,
}: GridMatrixTableProps) {
  const canAdjustFibonacciLength = strategyId === StrategyId.FIBONACCI
    && positionSizeWeightsLength !== undefined
    && setFibonacciWeightsLength !== undefined;
  const canSetFibonacciBase = strategyId === StrategyId.FIBONACCI
    && fibonacciBaseAmount !== undefined
    && setFibonacciBaseAmount !== undefined;
  const totalWeightPercent = slots.reduce(
    (total, slot) => total + slot.sizePercent,
    0,
  );
  const totalMultiplier = slots.reduce(
    (total, slot) => total + slot.sizeMultiplier,
    0,
  );
  const totalMargin = slots.reduce(
    (total, slot) => total + slot.sizeUsd,
    0,
  );
  const formattedTotalMargin = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(totalMargin);

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
        <div className="flex flex-wrap items-center justify-end gap-2">
          {averagePrice > 0 && (
            <span className="text-[10px] bg-amber-500/10 border border-amber-500/30 text-amber-400 px-2 py-0.5 rounded-full mono-text">
              5-Slot Theoretical Avg: 2068.9
            </span>
          )}
        </div>
      </div>

      <div className={`grid gap-2 border-b border-white/5 pb-4 ${canSetFibonacciBase ? "md:grid-cols-[0.85fr_0.85fr_1.3fr]" : "md:grid-cols-2"}`}>
        {canSetFibonacciBase && (
          <div className="flex min-w-0 items-center gap-3 rounded-xl border border-white/8 bg-slate-950/40 px-3 py-2.5">
            <span className="min-w-max text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              N (USD)
            </span>
            <NumberStepper
              value={fibonacciBaseAmount}
              onChange={setFibonacciBaseAmount}
              step={0.01}
              ariaLabel="Fibonacci base amount N in USD"
            />
          </div>
        )}
        <div className="flex min-w-0 items-center gap-3 rounded-xl border border-white/8 bg-slate-950/40 px-3 py-2.5">
          <span className="min-w-max text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Base Price
          </span>
          <NumberStepper
            value={basePrice}
            onChange={setBasePrice}
            step={0.1}
            ariaLabel="Base price"
          />
        </div>
        <div className="flex min-w-0 items-center gap-3 rounded-xl border border-white/8 bg-slate-950/40 px-3 py-2.5">
          <span className="min-w-max text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Grid Distance (USD)
          </span>
          <NumberStepper
            value={gridDistance}
            onChange={setGridDistance}
            step={0.5}
            ariaLabel="Grid distance in USD"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="text-slate-200 border-b border-white/5 pb-2">
              <th className="pb-3 font-bold w-12 pl-3">#</th>
              <th className="pb-3 font-bold px-4">Trigger Price</th>
              <th className="pb-3 font-bold text-right px-4 w-36">
                {strategyId === StrategyId.FIBONACCI
                  ? `Fibonacci (${totalMultiplier}N)`
                  : `Weight % (${totalWeightPercent.toFixed(2)}%)`}
              </th>
              <th className="pb-3 font-bold text-right px-4 pr-6">
                Margin Size ({formattedTotalMargin})
              </th>
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
                    {strategyId === StrategyId.FIBONACCI
                      ? `${s.sizeMultiplier}N`
                      : `${s.sizePercent.toFixed(2)}%`}
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
