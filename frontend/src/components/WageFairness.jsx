import React, { useState } from "react";
import axios from "axios";

const tooltip =
  "Trains a RandomForestRegressor on synthetic India-specific wage data to estimate fair daily wages by city, role, experience and demand.";

export default function WageFairness({ apiBase, user, showToast }) {
  const [jobTitle, setJobTitle] = useState(user?.skills || "Software Developer");
  const [experience, setExperience] = useState(user?.experience || 3);
  const [offered, setOffered] = useState(600);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const runCheck = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${apiBase}/predict-wage`, {
        job_title: jobTitle,
        city: user.city,
        experience: Number(experience),
        offered_wage: Number(offered)
      });
      setResult(res.data);
      showToast?.(
        res.data.fair
          ? `Looks fair: market around ₹${res.data.market_wage}/day`
          : `Possible underpayment: market is ~₹${res.data.market_wage}/day`,
        res.data.fair ? "success" : "danger"
      );
    } catch {
      showToast?.("Wage predictor failed, please check backend.", "danger");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel p-5 md:p-6 max-w-3xl mx-auto">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h2 className="text-lg font-semibold text-accent-cyan flex items-center gap-2">
            AI Wage Fairness Detector
          </h2>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Check if a daily wage offer for {user.city} is in line with similar workers in the
            region.
          </p>
        </div>
        <button
          className="text-xs text-slate-400 border border-slate-700 rounded-full px-3 py-1 hover:border-accent-cyan hover:text-accent-cyan"
          title={tooltip}
        >
          How it works?
        </button>
      </div>

      <div className="grid md:grid-cols-4 gap-3 text-xs mb-4">
        <div className="md:col-span-2">
          <label className="block mb-1 text-slate-300">Job title</label>
          <select
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-accent-cyan"
          >
            <option>EV Technician</option>
            <option>Solar Installer</option>
            <option>Drone Operator</option>
            <option>Construction Worker</option>
            <option>Healthcare Aide</option>
          </select>
        </div>
        <div>
          <label className="block mb-1 text-slate-300">Experience (years)</label>
          <input
            type="number"
            min="0"
            max="30"
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
            className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-accent-cyan"
          />
        </div>
        <div>
          <label className="block mb-1 text-slate-300">Offered wage (₹/day)</label>
          <input
            type="number"
            value={offered}
            onChange={(e) => setOffered(e.target.value)}
            className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-accent-cyan"
          />
        </div>
      </div>

      <button
        onClick={runCheck}
        className="inline-flex items-center gap-2 bg-accent-cyan text-slate-900 font-semibold px-5 py-2 rounded-lg text-xs hover:bg-cyan-300"
      >
        {loading ? "Evaluating…" : "Evaluate Wage Fairness"}
      </button>

      {result && (
        <div className="mt-5 grid md:grid-cols-4 gap-3 text-xs">
          <div className="md:col-span-2 rounded-xl bg-slate-900/80 border border-slate-700 p-4">
            <div className="flex items-center justify-between">
              <div className="text-[11px] text-slate-400 mb-1">Verdict</div>
              <div
                className={`px-2 py-1 rounded-full text-[11px] border ${
                  result.fair
                    ? "border-emerald-400 text-emerald-300 bg-emerald-500/10"
                    : "border-red-400 text-red-300 bg-red-500/10"
                }`}
              >
                {result.fair ? "✅ Fair wage" : "⚠️ Possible underpayment"}
              </div>
            </div>
            <p className="mt-2 text-slate-200">{result.warning_message}</p>
          </div>
          <div className="rounded-xl bg-slate-900/80 border border-slate-700 p-4">
            <div className="text-[11px] text-slate-400 mb-1">Market wage</div>
            <div className="text-lg font-semibold text-accent-amber">
              ₹{result.market_wage}
            </div>
          </div>
          <div className="rounded-xl bg-slate-900/80 border border-slate-700 p-4">
            <div className="text-[11px] text-slate-400 mb-1">Difference</div>
            <div
              className={`text-lg font-semibold ${
                result.fair ? "text-emerald-300" : "text-red-300"
              }`}
            >
              ₹{Math.round(result.offered_wage - result.market_wage)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

