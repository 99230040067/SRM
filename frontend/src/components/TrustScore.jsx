import React, { useEffect, useState } from "react";
import axios from "axios";

const tooltip =
  "Simulates a composite worker trust score combining completion rate, punctuality, and average feedback into a single, platform-friendly metric.";

export default function TrustScore({ apiBase }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    axios
      .get(`${apiBase}/trust-score?worker_id=1`)
      .then((res) => setData(res.data))
      .catch(() => setData(null));
  }, [apiBase]);

  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const pct = data ? Math.min(100, Math.max(0, data.trust_score)) : 0;
  const offset = circumference - (pct / 100) * circumference;

  const color =
    pct > 80 ? "#22c55e" : pct >= 60 ? "#eab308" : "#ef4444";

  return (
    <div className="glass-panel p-5 md:p-6 max-w-2xl mx-auto">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h2 className="text-lg font-semibold text-accent-cyan flex items-center gap-2">
            Worker Trust Score
          </h2>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Makes reputation portable across platforms with a transparent, explainable composite
            score.
          </p>
        </div>
        <button
          className="text-xs text-slate-400 border border-slate-700 rounded-full px-3 py-1 hover:border-accent-cyan hover:text-accent-cyan"
          title={tooltip}
        >
          How it works?
        </button>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-6">
        <div className="relative">
          <svg width="180" height="180">
            <circle
              cx="90"
              cy="90"
              r={radius}
              stroke="#1e293b"
              strokeWidth="10"
              fill="none"
            />
            <circle
              cx="90"
              cy="90"
              r={radius}
              stroke={color}
              strokeWidth="10"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              transform="rotate(-90 90 90)"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-xs text-slate-400 mb-1">Trust Score</div>
            <div className="text-3xl font-semibold text-slate-50">
              {data ? data.trust_score : "--"}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-3 text-xs w-full">
          <div className="rounded-xl bg-slate-900/80 border border-slate-700 p-4">
            <div className="text-[11px] text-slate-400 mb-1">Completion rate</div>
            <div className="text-lg font-semibold text-emerald-300">
              {data ? Math.round(data.completion_rate * 100) : "--"}%
            </div>
            <div className="mt-2 text-[11px] text-slate-400">
              Weighted at 40% of the trust score.
            </div>
          </div>
          <div className="rounded-xl bg-slate-900/80 border border-slate-700 p-4">
            <div className="text-[11px] text-slate-400 mb-1">Punctuality</div>
            <div className="text-lg font-semibold text-emerald-300">
              {data ? Math.round(data.punctuality * 100) : "--"}%
            </div>
            <div className="mt-2 text-[11px] text-slate-400">
              Strong signal for platforms and employers.
            </div>
          </div>
          <div className="rounded-xl bg-slate-900/80 border border-slate-700 p-4">
            <div className="text-[11px] text-slate-400 mb-1">Average feedback</div>
            <div className="text-lg font-semibold text-emerald-300">
              {data ? data.feedback_avg.toFixed(1) : "--"}/5
            </div>
          </div>
          <div className="rounded-xl bg-slate-900/80 border border-slate-700 p-4 flex flex-wrap gap-1">
            {data?.badges?.map((b) => (
              <span
                key={b}
                className="px-2 py-1 rounded-full bg-slate-950 border border-slate-700 text-[11px] text-slate-200"
              >
                {b}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

