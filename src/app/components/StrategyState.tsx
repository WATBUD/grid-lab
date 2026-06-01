"use client";

import React, { useState, useEffect } from "react";

interface StrategyStateProps {
  marginEquity: number;
  strategyStatus: "inactive" | "running" | "paused_safety" | "tp_triggered" | "sl_triggered";
  initialCapital: number;
  setInitialCapital?: (value: number) => void;
  setMarginEquity?: (value: number) => void;
  gridDistance: number;
  setGridDistance?: (value: number) => void;
}

export default function StrategyState({
  marginEquity,
  strategyStatus,
  initialCapital,
  setInitialCapital,
  setMarginEquity,
  gridDistance,
  setGridDistance,
}: StrategyStateProps) {
  
  // Local state for editable Account Equity
  const [editableEquity, setEditableEquity] = useState(() => {
    const saved = localStorage.getItem("accountEquity");
    if (saved) {
      const parsed = parseFloat(saved);
      if (!isNaN(parsed) && parsed >= 0) {
        return parsed;
      }
    }
    return marginEquity;
  });
  const [isEditingEquity, setIsEditingEquity] = useState(false);

  // Local state for editable Initial Capital
  const [editableInitialCapital, setEditableInitialCapital] = useState(() => {
    const saved = localStorage.getItem("initialCapital");
    if (saved) {
      const parsed = parseFloat(saved);
      if (!isNaN(parsed) && parsed >= 0) {
        return parsed;
      }
    }
    return initialCapital;
  });
  const [isEditingCapital, setIsEditingCapital] = useState(false);

  // Save to localStorage when equity editing ends
  useEffect(() => {
    if (!isEditingEquity) {
      localStorage.setItem("accountEquity", editableEquity.toString());
    }
  }, [editableEquity, isEditingEquity]);

  // Save to localStorage when initial capital editing ends
  useEffect(() => {
    if (!isEditingCapital) {
      localStorage.setItem("initialCapital", editableInitialCapital.toString());
    }
  }, [editableInitialCapital, isEditingCapital]);

  // Format numbers to fixed precision
  const formatUSD = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(val);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-1 gap-4 w-full">
      {/* 1. Account Equity Card */}
      <div className={`glass-panel p-5 flex flex-col gap-1.5 ${strategyStatus !== "inactive" ? "glass-panel-active" : ""}`}>
        <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Account Equity</span>
        {isEditingEquity ? (
          <input
            type="number"
            value={editableEquity}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              if (!isNaN(val) && val >= 0) {
                setEditableEquity(val);
              }
            }}
            onBlur={() => {
              setIsEditingEquity(false);
              if (setMarginEquity) {
                setMarginEquity(editableEquity);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setIsEditingEquity(false);
                if (setMarginEquity) {
                  setMarginEquity(editableEquity);
                }
              }
            }}
            className="text-2xl font-bold tracking-tight mono-text bg-transparent border-b border-cyan-500/50 focus:outline-none focus:border-cyan-400 w-full"
            autoFocus
          />
        ) : (
          <div 
            className="text-2xl font-bold tracking-tight mono-text cursor-pointer hover:text-cyan-400 transition-colors"
            onClick={() => setIsEditingEquity(true)}
            title="Click to edit"
          >
            {formatUSD(editableEquity)}
          </div>
        )}
        <div className="flex items-center justify-between text-xs mt-1 border-t border-white/5 pt-2">
          <span className="text-slate-400">Initial Capital</span>
          {isEditingCapital ? (
            <input
              type="number"
              step="0.01"
              value={editableInitialCapital}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                if (!isNaN(val) && val >= 0) {
                  setEditableInitialCapital(val);
                }
              }}
              onBlur={() => {
                setIsEditingCapital(false);
                if (setInitialCapital) {
                  setInitialCapital(editableInitialCapital);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setIsEditingCapital(false);
                  if (setInitialCapital) {
                    setInitialCapital(editableInitialCapital);
                  }
                }
              }}
              className="mono-text font-semibold text-slate-300 bg-transparent border-b border-cyan-500/50 focus:outline-none focus:border-cyan-400 w-24 text-right"
              autoFocus
            />
          ) : (
            <span 
              className="mono-text font-semibold text-slate-300 cursor-pointer hover:text-cyan-400 transition-colors"
              onClick={() => setIsEditingCapital(true)}
              title="Click to edit"
            >
              {formatUSD(editableInitialCapital)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
