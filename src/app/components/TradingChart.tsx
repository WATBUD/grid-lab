"use client";

import React, { useRef, useState, useEffect } from "react";
import { Candle, SlotOrder } from "@/hooks/useMartingale";

interface TradingChartProps {
  candles: Candle[];
  currentPrice: number;
  averagePrice: number;
  slots: SlotOrder[];
  strategyStatus: string;
  simulatePriceTick: (amt: number) => void;
  rightSidePaused: boolean;
  id?: string;
}

export default function TradingChart({
  candles,
  currentPrice,
  averagePrice,
  slots,
  strategyStatus,
  simulatePriceTick,
  rightSidePaused,
  id,
}: TradingChartProps) {
  const chartRef = useRef<SVGSVGElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Constants for fixed scaling to make the chart extremely stable
  const minPrice = 2010.0;
  const maxPrice = 2165.0;
  
  const width = 800;
  const height = 400;
  const paddingRight = 80;
  const paddingLeft = 20;
  const paddingTop = 30;
  const paddingBottom = 30;

  const drawableWidth = width - paddingLeft - paddingRight;
  const drawableHeight = height - paddingTop - paddingBottom;

  // Scale functions
  const getY = (price: number) => {
    if (price < minPrice) price = minPrice;
    if (price > maxPrice) price = maxPrice;
    const ratio = (price - minPrice) / (maxPrice - minPrice);
    return height - paddingBottom - ratio * drawableHeight;
  };

  const getPriceFromY = (y: number) => {
    const ratio = (height - paddingBottom - y) / drawableHeight;
    const price = minPrice + ratio * (maxPrice - minPrice);
    return Math.max(minPrice, Math.min(maxPrice, price));
  };

  // Drag handler for price line
  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (chartRef.current) {
      chartRef.current.setPointerCapture(e.pointerId);
      setIsDragging(true);
      updatePriceFromEvent(e);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (isDragging) {
      updatePriceFromEvent(e);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<SVGSVGElement>) => {
    if (isDragging && chartRef.current) {
      chartRef.current.releasePointerCapture(e.pointerId);
      setIsDragging(false);
    }
  };

  const updatePriceFromEvent = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!chartRef.current) return;
    const rect = chartRef.current.getBoundingClientRect();
    const relativeY = e.clientY - rect.top;
    
    // Scale standard height
    const scaleY = (relativeY / rect.height) * height;
    const targetPrice = parseFloat(getPriceFromY(scaleY).toFixed(2));
    
    // Call hook modifier
    const diff = targetPrice - currentPrice;
    simulatePriceTick(diff);
  };

  // Generate path points for Bollinger Bands
  const getBandPath = (type: "bbUpper" | "bbMiddle" | "bbLower") => {
    if (candles.length === 0) return "";
    const stepX = drawableWidth / (candles.length - 1 || 1);
    return candles
      .map((c, i) => {
        const x = paddingLeft + i * stepX;
        const y = getY(c[type]);
        return `${i === 0 ? "M" : "L"} ${x} ${y}`;
      })
      .join(" ");
  };

  const stepX = candles.length > 0 ? drawableWidth / (candles.length - 1 || 1) : 0;

  // Active pricing guide markers
  const activeOrders = slots.filter((s) => s.status === "pending");
  const tpPrice = averagePrice > 0 ? averagePrice + 16.6 : 0;
  const slPrice = averagePrice > 0 ? 2112.3 - 15 * 4 - 15 : 0; // 2037.3 Stop Loss Point

  return (
    <div id={id} className="glass-panel p-5 relative overflow-hidden flex flex-col gap-4">
      {/* Chart Headers */}
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <div className="flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-cyan-400 animate-ping"></div>
          <span className="text-xs text-slate-400 uppercase tracking-widest font-semibold">
            Interactive Live Chart (ETH/USD 5M)
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs font-medium">
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#f43f5e]"></span> BB Upper: {candles[candles.length - 1]?.bbUpper?.toFixed(1) || "---"}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#f59e0b]"></span> BB Middle: {candles[candles.length - 1]?.bbMiddle?.toFixed(1) || "---"}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#10b981]"></span> BB Lower: {candles[candles.length - 1]?.bbLower?.toFixed(1) || "---"}
          </span>
        </div>
      </div>

      {/* SVG Viewport */}
      <div className="relative bg-slate-950/40 rounded-xl overflow-hidden select-none border border-white/5">
        <svg
          ref={chartRef}
          width="100%"
          height="100%"
          viewBox={`0 0 ${width} ${height}`}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="cursor-crosshair block overflow-visible"
          style={{ touchAction: "none" }}
        >
          {/* Horizontal grid lines */}
          {[2020, 2040, 2060, 2080, 2100, 2120, 2140, 2160].map((gridPrice) => (
            <g key={gridPrice}>
              <line
                x1={paddingLeft}
                y1={getY(gridPrice)}
                x2={width - paddingRight}
                y2={getY(gridPrice)}
                stroke="rgba(255,255,255,0.03)"
                strokeWidth={1}
              />
              <text
                x={width - paddingRight + 10}
                y={getY(gridPrice) + 4}
                fill="rgba(255,255,255,0.3)"
                fontSize="10"
                className="mono-text"
              >
                {gridPrice}
              </text>
            </g>
          ))}

          {/* Render Bollinger Bands Area Fill */}
          {candles.length > 1 && (
            <path
              d={`${getBandPath("bbUpper")} L ${paddingLeft + (candles.length - 1) * stepX} ${getY(candles[candles.length - 1].bbLower)} ${candles
                .slice()
                .reverse()
                .map((c, i) => {
                  const x = paddingLeft + (candles.length - 1 - i) * stepX;
                  const y = getY(c.bbLower);
                  return `L ${x} ${y}`;
                })
                .join(" ")} Z`}
              fill="rgba(0, 242, 254, 0.015)"
              stroke="none"
            />
          )}

          {/* Render Bollinger Bands Lines */}
          {candles.length > 1 && (
            <>
              {/* Upper Band */}
              <path
                d={getBandPath("bbUpper")}
                fill="none"
                stroke="rgba(244, 63, 94, 0.35)"
                strokeWidth={1.2}
                strokeDasharray="4 2"
              />
              {/* Middle Band */}
              <path
                d={getBandPath("bbMiddle")}
                fill="none"
                stroke="rgba(245, 158, 11, 0.4)"
                strokeWidth={1}
                strokeDasharray="6 4"
              />
              {/* Lower Band */}
              <path
                d={getBandPath("bbLower")}
                fill="none"
                stroke="rgba(16, 185, 129, 0.5)"
                strokeWidth={1.5}
              />
            </>
          )}

          {/* Render K-Line Candles */}
          {candles.map((candle, index) => {
            const x = paddingLeft + index * stepX;
            const openY = getY(candle.open);
            const closeY = getY(candle.close);
            const highY = getY(candle.high);
            const lowY = getY(candle.low);
            
            const isBullish = candle.close >= candle.open;
            const candleWidth = Math.max(3, Math.min(8, stepX * 0.6));
            
            const strokeColor = isBullish ? "#10b981" : "#f43f5e";
            const fillColor = isBullish ? "rgba(16,185,129,0.85)" : "rgba(244,63,94,0.85)";

            return (
              <g key={index} className="transition-all duration-200">
                {/* Wick */}
                <line
                  x1={x}
                  y1={highY}
                  x2={x}
                  y2={lowY}
                  stroke={strokeColor}
                  strokeWidth={1.2}
                />
                {/* Body */}
                <rect
                  x={x - candleWidth / 2}
                  y={Math.min(openY, closeY)}
                  width={candleWidth}
                  height={Math.max(1.5, Math.abs(openY - closeY))}
                  fill={fillColor}
                  stroke={strokeColor}
                  strokeWidth={0.5}
                  rx={1}
                />

                {/* Right side blocked highlight marker */}
                {candle.rightSideBlocked && (
                  <circle
                    cx={x}
                    cy={lowY + 12}
                    r={3.5}
                    fill="#f59e0b"
                    stroke="#000"
                    strokeWidth={0.5}
                  />
                )}
              </g>
            );
          })}

          {/* Strategy indicators guidelines */}

          {/* 1. Limit Orders lines (Grid targets) */}
          {strategyStatus !== "inactive" &&
            activeOrders.map((order) => (
              <g key={order.slot}>
                <line
                  x1={paddingLeft}
                  y1={getY(order.triggerPrice)}
                  x2={width - paddingRight}
                  y2={getY(order.triggerPrice)}
                  stroke="rgba(16, 185, 129, 0.4)"
                  strokeWidth={1}
                  strokeDasharray="2 3"
                />
                <rect
                  x={25}
                  y={getY(order.triggerPrice) - 7}
                  width={42}
                  height={14}
                  fill="rgba(16, 185, 129, 0.15)"
                  stroke="rgba(16, 185, 129, 0.3)"
                  strokeWidth={0.5}
                  rx={3}
                />
                <text
                  x={29}
                  y={getY(order.triggerPrice) + 3}
                  fill="#10b981"
                  fontSize="8"
                  fontWeight="bold"
                >
                  LIMIT {order.slot}
                </text>
              </g>
            ))}

          {/* 2. Position average holding price */}
          {averagePrice > 0 && (
            <g>
              <line
                x1={paddingLeft}
                y1={getY(averagePrice)}
                x2={width - paddingRight}
                y2={getY(averagePrice)}
                stroke="rgba(245, 158, 11, 0.85)"
                strokeWidth={1.5}
                strokeDasharray="5 3"
              />
              <rect
                x={paddingLeft + 5}
                y={getY(averagePrice) - 8}
                width={85}
                height={16}
                fill="rgba(245, 158, 11, 0.15)"
                stroke="rgba(245, 158, 11, 0.6)"
                strokeWidth={0.5}
                rx={4}
              />
              <text
                x={paddingLeft + 10}
                y={getY(averagePrice) + 4}
                fill="#f59e0b"
                fontSize="9"
                fontWeight="bold"
                className="mono-text"
              >
                AVG PRICE: {averagePrice.toFixed(1)}
              </text>
            </g>
          )}

          {/* 3. Take Profit Target Line */}
          {averagePrice > 0 && (
            <g>
              <line
                x1={paddingLeft}
                y1={getY(tpPrice)}
                x2={width - paddingRight}
                y2={getY(tpPrice)}
                stroke="#00f2fe"
                strokeWidth={1.5}
              />
              <rect
                x={paddingLeft + 5}
                y={getY(tpPrice) - 8}
                width={90}
                height={16}
                fill="rgba(0, 242, 254, 0.15)"
                stroke="#00f2fe"
                strokeWidth={0.5}
                rx={4}
              />
              <text
                x={paddingLeft + 10}
                y={getY(tpPrice) + 4}
                fill="#00f2fe"
                fontSize="9"
                fontWeight="bold"
                className="mono-text"
              >
                TAKE PROFIT: {tpPrice.toFixed(1)}
              </text>
            </g>
          )}

          {/* 4. Steel Stop Loss Line */}
          {averagePrice > 0 && (
            <g>
              <line
                x1={paddingLeft}
                y1={getY(2037.3)}
                x2={width - paddingRight}
                y2={getY(2037.3)}
                stroke="#f43f5e"
                strokeWidth={1.5}
              />
              <rect
                x={paddingLeft + 5}
                y={getY(2037.3) - 8}
                width={85}
                height={16}
                fill="rgba(244, 63, 94, 0.15)"
                stroke="#f43f5e"
                strokeWidth={0.5}
                rx={4}
              />
              <text
                x={paddingLeft + 10}
                y={getY(2037.3) + 4}
                fill="#f43f5e"
                fontSize="9"
                fontWeight="bold"
                className="mono-text"
              >
                STOP LOSS: 2037.3
              </text>
            </g>
          )}

          {/* 5. Live Current Price Marker with Handle (Interactive Drag/Slider) */}
          <g>
            {/* Soft backdrop tracker highlight */}
            <rect
              x={width - paddingRight}
              y={getY(currentPrice) - 10}
              width={80}
              height={20}
              fill={rightSidePaused ? "rgba(245, 158, 11, 0.15)" : "rgba(0, 242, 254, 0.15)"}
              stroke={rightSidePaused ? "#f59e0b" : "#00f2fe"}
              strokeWidth={0.5}
              rx={4}
            />
            <line
              x1={paddingLeft}
              y1={getY(currentPrice)}
              x2={width - paddingRight}
              y2={getY(currentPrice)}
              stroke={rightSidePaused ? "#f59e0b" : "#00f2fe"}
              strokeWidth={1.5}
              className="animate-pulse"
            />
            {/* Grab handle for interactive touch */}
            <circle
              cx={width - paddingRight}
              cy={getY(currentPrice)}
              r={7}
              fill={rightSidePaused ? "#f59e0b" : "#00f2fe"}
              stroke="#06080d"
              strokeWidth={1.5}
              style={{ cursor: "ns-resize" }}
            />
            <text
              x={width - paddingRight + 8}
              y={getY(currentPrice) + 4}
              fill={rightSidePaused ? "#f59e0b" : "#00f2fe"}
              fontSize="10"
              fontWeight="bold"
              className="mono-text"
            >
              ${currentPrice.toFixed(1)}
            </text>
          </g>
        </svg>

        {/* Drag tips overlay */}
        <div className="absolute left-4 bottom-3 bg-slate-900/80 px-2.5 py-1 rounded text-[10px] text-slate-400 border border-white/5 pointer-events-none select-none">
          💡 Drag the <span className="text-cyan-400 font-bold">cyan handle</span> or line vertically to simulate real-time price action manually.
        </div>
      </div>
    </div>
  );
}
