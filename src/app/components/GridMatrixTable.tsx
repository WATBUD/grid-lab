"use client";

import React from "react";
import { SlotOrder } from "@/hooks/useMartingale";
import { StrategyId } from "@/app/constants/strategyConfigs";
import { MAX_PROGRESSIVE_SLOTS } from "@/app/constants/progressiveDca";

interface GridMatrixTableProps {
  slots: SlotOrder[];
  leverage: number;
  setLeverage: (leverage: number) => void;
  direction: "long" | "short";
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
  displayPrecision?: number;
}

function NumberStepper({
  value,
  onChange,
  step,
  min = 0.01,
  ariaLabel,
  compact = false,
  displayPrecision,
}: NumberStepperProps) {
  const formatValue = React.useCallback(
    (nextValue: number) => displayPrecision === undefined
      ? String(nextValue)
      : nextValue.toFixed(displayPrecision),
    [displayPrecision],
  );
  const [draftValue, setDraftValue] = React.useState(() => formatValue(value));
  const isEditingRef = React.useRef(false);

  React.useEffect(() => {
    if (!isEditingRef.current) {
      // Keep the field in sync when another control changes the value.
      setDraftValue(formatValue(value));
    }
  }, [value, formatValue]);

  const updateValue = (nextValue: number) => {
    const precision = step.toString().split(".")[1]?.length ?? 0;
    const normalizedValue = Number(Math.max(min, nextValue).toFixed(precision));
    setDraftValue(formatValue(normalizedValue));
    onChange(normalizedValue);
  };

  return (
    <div className={`flex h-10 items-stretch overflow-hidden rounded-lg border border-white/10 bg-slate-900/70 transition-colors focus-within:border-cyan-500/50 ${compact ? "w-32" : "min-w-0 flex-1"}`}>
      <input
        type="number"
        min={min}
        step={step}
        value={draftValue}
        onFocus={() => {
          isEditingRef.current = true;
        }}
        onChange={(event) => {
          const nextDraftValue = event.target.value;
          setDraftValue(nextDraftValue);

          if (nextDraftValue === "") return;

          const nextValue = Number(nextDraftValue);
          if (Number.isFinite(nextValue) && nextValue >= min) onChange(nextValue);
        }}
        onBlur={() => {
          isEditingRef.current = false;
          const nextValue = Number(draftValue);

          if (draftValue === "" || !Number.isFinite(nextValue) || nextValue < min) {
            setDraftValue(formatValue(value));
            return;
          }

          setDraftValue(formatValue(nextValue));
          onChange(nextValue);
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
  leverage,
  setLeverage,
  direction,
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
  const isProgressive = strategyId === StrategyId.FIBONACCI_PROGRESSIVE;
  const isFibonacci = strategyId === StrategyId.FIBONACCI || isProgressive;
  const isPercent = strategyId === StrategyId.PESS;
  const canAdjustFibonacciLength = (isFibonacci || isPercent)
    && positionSizeWeightsLength !== undefined
    && setFibonacciWeightsLength !== undefined;
  const canSetFibonacciBase = isFibonacci
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
  const priceStepPercent = basePrice > 0
    ? (gridDistance / basePrice) * 100
    : 0;

  const updateBasePrice = (nextBasePrice: number) => {
    const currentStepPercent = basePrice > 0 ? gridDistance / basePrice : 0;
    setBasePrice(nextBasePrice);
    setGridDistance(Number((nextBasePrice * currentStepPercent).toFixed(8)));
  };

  const updatePriceStepPercent = (nextPercent: number) => {
    setGridDistance(Number(((basePrice * nextPercent) / 100).toFixed(8)));
  };

  let cumulativeMargin = 0;
  let cumulativeUnits = 0;
  let hasValidPrices = true;
  const cumulativeAverages: (number | null)[] = [];
  for (const slot of slots) {
    hasValidPrices = hasValidPrices && slot.triggerPrice > 0;
    cumulativeMargin += slot.sizeUsd;
    if (slot.triggerPrice > 0) cumulativeUnits += slot.sizeUsd / slot.triggerPrice;
    cumulativeAverages.push(hasValidPrices && cumulativeUnits > 0
      ? cumulativeMargin / cumulativeUnits
      : null);
  }

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
                disabled={(isProgressive && positionSizeWeightsLength >= MAX_PROGRESSIVE_SLOTS) || (isPercent && positionSizeWeightsLength >= 7)}
                className="h-7 w-7 rounded-lg border border-cyan-500/30 bg-cyan-500/10 text-sm font-bold text-cyan-300 transition-colors hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                title="Add Fibonacci slot"
              >
                +
              </button>
            </div>
          )}
          <div className="flex items-center gap-2 rounded-xl border border-white/8 bg-slate-950/40 px-3 py-2">
            <span className="text-[11px] font-semibold text-slate-400">槓桿 ×</span>
            <NumberStepper
              value={leverage}
              onChange={setLeverage}
              step={1}
              min={1}
              compact
              ariaLabel="Leverage multiplier"
            />
          </div>
        </div>
      </div>

      {isProgressive && (
        <p className="text-xs leading-6 text-slate-400">
          以最新持有均價為基準：首次加碼下跌 16%，其後每次增加 8 個百分點（24%、32%…）。首列為初始買進，最多 12 筆；累積股數按投入金額 ÷ 買進價格計算。
        </p>
      )}
      {isPercent && (
        <p className="text-xs leading-6 text-slate-400">
          每次投入總資金的 1%、2%、4%、8%…，百分比以 Equity 為基準。依此倍增規則試算，累積投入可能超過總資金。
        </p>
      )}
      {!isProgressive && (
        <p className="text-xs leading-6 text-slate-400">
          Step % 為槓桿後的目標虧損幅度，依回合套用 1、2、3…倍；先除以槓桿，再以最新均價計算下一筆進場價。
          「相對前次均價漲跌幅」顯示下一筆加碼前的估算合約損益，已乘槓桿倍數，未計費用與強平。
          {positionSizeWeightsLength !== undefined && slots.length < positionSizeWeightsLength && (
            <span className="text-amber-300"> 後續回合跌幅達 100%，已停止列出無效買進價格。</span>
          )}
        </p>
      )}
      <div className={`grid gap-2 border-b border-white/5 pb-4 ${canSetFibonacciBase && !isProgressive ? "md:grid-cols-[0.85fr_0.85fr_1.3fr]" : "md:grid-cols-2"}`}>
        <div className="flex min-w-0 items-center gap-3 rounded-xl border border-white/8 bg-slate-950/40 px-3 py-2.5">
          <span className="inline-flex h-10 min-w-max items-center text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Base Price
          </span>
          <NumberStepper
            value={basePrice}
            onChange={updateBasePrice}
            step={0.0001}
            ariaLabel="Base price"
          />
        </div>
        {canSetFibonacciBase && (
          <div className="flex min-w-0 items-center gap-3 rounded-xl border border-white/8 bg-slate-950/40 px-3 py-2.5">
            <span className="inline-flex h-10 min-w-max items-center text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Unit Size
            </span>
            <NumberStepper
              value={fibonacciBaseAmount}
              onChange={setFibonacciBaseAmount}
              step={0.01}
              ariaLabel="Fibonacci unit size"
            />
          </div>
        )}
        {!isProgressive && <div className="flex min-w-0 items-center gap-3 rounded-xl border border-white/8 bg-slate-950/40 px-3 py-2.5">
          <span className="inline-flex h-10 min-w-max items-center text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Step %
          </span>
          <NumberStepper
            value={Number(priceStepPercent.toFixed(4))}
            onChange={updatePriceStepPercent}
            step={0.1}
            ariaLabel="Price step percentage"
            displayPrecision={1}
          />
          <span
            className="inline-flex h-10 min-w-max items-center rounded-lg border border-cyan-500/20 bg-cyan-500/10 px-3 text-[11px] font-bold text-cyan-300 mono-text"
            title="首筆加碼的實際價格距離，已將目標損益幅度除以槓桿；後續依最新均價計算"
          >
            Step {(gridDistance / leverage).toFixed(4)}
          </span>
        </div>}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="text-slate-200 border-b border-white/5 pb-2">
              <th className="pb-3 font-bold w-12 pl-3">#</th>
              <th className="pb-3 font-bold px-4">Entry Price</th>
              {(strategyId === StrategyId.FIBONACCI || isPercent) && (
                <>
                  <th className="pb-3 px-4 text-right whitespace-nowrap" title="完成本列買進後的平均持有成本">加碼後均價</th>
                  <th className="pb-3 px-4 text-right whitespace-nowrap" title={`相對前次均價的估算合約損益，已乘 ${leverage} 倍槓桿，未計費用與強平`}>相對前次均價漲跌幅</th>
                  <th className="pb-3 px-4 text-right whitespace-nowrap">相對原價漲跌幅</th>
                </>
              )}
              <th className="pb-3 font-bold text-right px-4 w-36">
                {isFibonacci
                  ? `Fibonacci 加碼金額 (${totalMultiplier}N)`
                  : `Fibonacci 加碼 % (${totalWeightPercent.toFixed(2)}%)`}
              </th>
              <th className="pb-3 font-bold text-right px-4 pr-6">
                Margin Size ({formattedTotalMargin})
              </th>
              {isProgressive && <>
                <th className="pb-3 px-4 text-right whitespace-nowrap">相對前次均價跌幅</th>
                <th className="pb-3 px-4 text-right whitespace-nowrap">相比原價總跌幅</th>
                <th className="pb-3 px-4 text-right whitespace-nowrap">加碼後均價</th>
                <th className="pb-3 px-4 text-right whitespace-nowrap">累積投入</th>
                <th className="pb-3 px-4 text-right whitespace-nowrap">累積股數</th>
              </>}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {slots.map((s, index) => {
              const previousAverage = index > 0 ? cumulativeAverages[index - 1] : null;
              const entryChangePercent = previousAverage !== null && previousAverage > 0
                ? ((s.triggerPrice - previousAverage) / previousAverage) * 100
                : null;
              const priceChangePercent = basePrice > 0
                ? ((s.triggerPrice - basePrice) / basePrice) * 100
                : 0;
              const contractReturnPercent = entryChangePercent === null
                ? null
                : entryChangePercent * leverage * (direction === "long" ? 1 : -1);
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
                  <td className="py-3.5 px-4 font-bold mono-text text-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.22)]">
                    ${s.triggerPrice.toFixed(4)}
                  </td>
                  {(strategyId === StrategyId.FIBONACCI || isPercent) && (
                    <>
                    <td className="py-3.5 px-4 text-right font-bold mono-text text-amber-300">
                      {cumulativeAverages[index] === null ? "—" : `$${cumulativeAverages[index].toFixed(4)}`}
                    </td>
                    <td className={`py-3.5 px-4 text-right font-bold mono-text ${contractReturnPercent === null ? "text-slate-400" : contractReturnPercent < 0 ? "text-rose-300" : "text-emerald-300"}`}>
                      {contractReturnPercent === null ? "—" : `${contractReturnPercent > 0 ? "+" : ""}${contractReturnPercent.toFixed(2)}%`}
                    </td>
                    <td className={`py-3.5 px-4 text-right font-semibold mono-text ${priceChangePercent < 0 ? "text-rose-300" : priceChangePercent > 0 ? "text-emerald-300" : "text-slate-400"}`}>
                      {priceChangePercent > 0 ? "+" : ""}{priceChangePercent.toFixed(2)}%
                    </td>
                    </>
                  )}
                  <td className="py-3.5 text-right font-semibold mono-text text-slate-200 px-4 w-24">
                    {isFibonacci
                      ? `${s.sizeMultiplier}N`
                      : `${s.sizePercent.toFixed(2)}%`}
                  </td>
                  <td className="py-3.5 text-right font-semibold mono-text text-white px-4 pr-6">
                    ${s.sizeUsd.toFixed(2)}
                  </td>
                  {isProgressive && <>
                    <td className="py-3.5 px-4 text-right mono-text text-slate-300">{s.slot === 1 ? "—" : `-${s.drawdownPercent}%`}</td>
                    <td className="py-3.5 px-4 text-right mono-text text-rose-300">{s.slot === 1 ? "0.00%" : `-${s.totalDropPercent?.toFixed(2)}%`}</td>
                    <td className="py-3.5 px-4 text-right mono-text font-bold text-amber-300">${s.cumulativeAverage?.toFixed(4)}</td>
                    <td className="py-3.5 px-4 text-right mono-text">${s.cumulativeInvestment?.toFixed(2)}</td>
                    <td className="py-3.5 px-4 text-right mono-text">{s.cumulativeQuantity?.toFixed(4)}</td>
                  </>}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
