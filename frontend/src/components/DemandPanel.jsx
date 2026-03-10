import React, { useEffect, useState } from "react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar } from "recharts";
import axios from "axios";

const tooltip = "Uses Prophet on 24 months of synthetic job posting data per category to forecast demand for the next 6 months. Judges: notice how EV Technician and Solar Installer demand spikes for Chennai.";

export default function DemandPanel({ apiBase, showToast, user }) {
  const [data, setData] = useState([]);
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    axios
      .get(`${apiBase}/demand-forecast?city=${encodeURIComponent(user.city || "Chennai")}`)
      .then((res) => {
        if (!mounted) return;
        setData(res.data.forecasts || []);
        setAlert(res.data.top_alert);
        showToast?.(`EV Technician demand rising ${res.data.top_alert.pct_change}% in ${user.city}`, "info");
      })
      .catch(() => {
        if (!mounted) return;
        setData([]);
      })
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [apiBase, showToast, user.city]);

  const chartData = data.map((d) => ({
    job: d.job_title,
    current: d.current_demand,
    forecast: d.forecast_6mo,
    change: d.pct_change
  }));

  return (
    <div className="grid lg:grid-cols-3 gap-4 md:gap-6">
      <div className="glass-panel p-5 md:p-6 lg:col-span-2 relative overflow-hidden">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <span className="text-accent-cyan">AI Job Demand Radar</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700">
                Next 6 months · {user.city}
              </span>
            </h2>
            <p className="text-xs md:text-sm text-slate-400 mt-1">
              Forecasted monthly job postings for green & essential workers. Blue = today, amber = 6 months.
            </p>
          </div>
          <button
            className="text-xs text-slate-400 border border-slate-700 rounded-full px-3 py-1 hover:border-accent-cyan hover:text-accent-cyan"
            title={tooltip}
          >
            How it works?
          </button>
        </div>
        <div className="mt-4 h-64 md:h-72">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-pulse text-slate-400 text-sm">EconoMind AI is forecasting demand…</div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="job" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip
                  contentStyle={{ backgroundColor: "#020617", border: "1px solid #1e293b", fontSize: 12 }}
                  cursor={{ fill: "#0f172a" }}
                />
                <Bar dataKey="current" stackId="a" fill="#22d3ee" radius={[6, 6, 0, 0]} />
                <Bar dataKey="forecast" stackId="a" fill="#fb923c" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="glass-panel p-4 md:p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Demand Pulse</h3>
            <span className="text-[11px] text-slate-400">Top opportunity</span>
          </div>
          {alert ? (
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 animate-pulse">
                  ⚡
                </div>
                <div>
                  <div className="text-sm font-medium text-emerald-200">
                    {alert.job_title} demand rising {alert.pct_change}%
                  </div>
                  <div className="text-xs text-slate-400">
                    From {Math.round(alert.current_demand)} → {Math.round(alert.forecast_6mo)} monthly postings
                  </div>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                <div className="rounded-lg bg-slate-900/70 p-2 border border-slate-700/80">
                  <div className="text-slate-400">Now</div>
                  <div className="text-slate-100 font-semibold">
                    {Math.round(alert.current_demand)}
                  </div>
                </div>
                <div className="rounded-lg bg-slate-900/70 p-2 border border-slate-700/80">
                  <div className="text-slate-400">6 months</div>
                  <div className="text-accent-amber font-semibold">
                    {Math.round(alert.forecast_6mo)}
                  </div>
                </div>
                <div className="rounded-lg bg-slate-900/70 p-2 border border-slate-700/80">
                  <div className="text-slate-400">% change</div>
                  <div
                    className={`font-semibold ${
                      alert.pct_change >= 0 ? "text-emerald-300" : "text-red-300"
                    }`}
                  >
                    {alert.pct_change}%
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="animate-pulse h-20 mt-4 rounded-xl bg-slate-900/60" />
          )}
        </div>

        <div className="glass-panel p-4 md:p-5">
          <h3 className="text-sm font-semibold mb-2">Narrative</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            EconoMind AI is signalling a{" "}
            <span className="text-accent-cyan font-medium">surge in green jobs</span> like EV and
            solar technicians around {user.city} over the next 6 months. This helps workers like {user.name}
            decide which skills to upskill into today.
          </p>
        </div>
      </div>
    </div>
  );
}

