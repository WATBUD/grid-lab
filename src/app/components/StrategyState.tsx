"use client";

import React, { useState, useEffect } from "react";

interface StrategyStateProps {
  marginEquity: number;
  strategyStatus: "inactive" | "running" | "paused_safety" | "tp_triggered" | "sl_triggered";
  initialCapital: number;
  setInitialCapital?: (value: number) => void;
  setMarginEquity?: (value: number) => void;
}

export default function StrategyState({
  marginEquity,
  strategyStatus,
  initialCapital,
  setInitialCapital,
  setMarginEquity,
}: StrategyStateProps) {
  
  // Local state for editable Account Equity
  const [editableEquity, setEditableEquity] = useState(marginEquity);
  const [isEditingEquity, setIsEditingEquity] = useState(false);

  // Local state for editable Initial Capital
  const [editableInitialCapital, setEditableInitialCapital] = useState(initialCapital);
  const [isEditingCapital, setIsEditingCapital] = useState(false);

  // Load saved equity from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("accountEquity");
    if (saved) {
      const parsed = parseFloat(saved);
      if (!isNaN(parsed)) {
        setEditableEquity(parsed);
        if (setMarginEquity) {
          setMarginEquity(parsed);
        }
        // Also update Initial Capital to match
        setEditableInitialCapital(parsed);
        if (setInitialCapital) {
          setInitialCapital(parsed);
        }
      }
    }
  }, []); // Only run on mount

  // Save to localStorage when editableEquity changes
  useEffect(() => {
    if (isEditingEquity) {
      localStorage.setItem("accountEquity", editableEquity.toString());
      // Also sync Initial Capital to match Account Equity
      setEditableInitialCapital(editableEquity);
      if (setInitialCapital) {
        setInitialCapital(editableEquity);
      }
    }
  }, [editableEquity, isEditingEquity, setInitialCapital]);

  // Save to localStorage when editableInitialCapital changes
  useEffect(() => {
    if (isEditingCapital) {
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
              if (!isNaN(val)) {
                setEditableEquity(val);
                if (setMarginEquity) {
                  setMarginEquity(val);
                }
              }
            }}
            onBlur={() => setIsEditingEquity(false)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setIsEditingEquity(false);
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
                if (!isNaN(val)) {
                  setEditableInitialCapital(val);
                  if (setInitialCapital) {
                    setInitialCapital(val);
                  }
                }
              }}
              onBlur={() => setIsEditingCapital(false)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setIsEditingCapital(false);
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
