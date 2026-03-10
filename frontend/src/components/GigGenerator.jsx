import React, { useState } from "react";
import axios from "axios";

const tooltip =
  "Breaks a larger project like 'Solar installation' into smaller paid micro-gigs so platforms can match work to part-time or nearby workers.";

export default function GigGenerator({ apiBase }) {
  const [title, setTitle] = useState("Solar rooftop installation");
  const [loading, setLoading] = useState(false);
  const [gigs, setGigs] = useState(null);

  const generate = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${apiBase}/generate-gigs`, { project_title: title });
      setGigs(res.data);
    } catch {
      setGigs(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel p-5 md:p-6">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h2 className="text-lg font-semibold text-accent-cyan flex items-center gap-2">
            AI Micro-Gig Generator
          </h2>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Turn a big project into smaller, bite-sized gigs with clear scope, time, and pay.
          </p>
        </div>
        <button
          className="text-xs text-slate-400 border border-slate-700 rounded-full px-3 py-1 hover:border-accent-cyan hover:text-accent-cyan"
          title={tooltip}
        >
          How it works?
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-3 text-xs mb-4">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="flex-1 rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-accent-cyan"
          placeholder="e.g. EV charging station setup"
        />
        <button
          onClick={generate}
          className="md:w-auto w-full inline-flex items-center justify-center gap-2 bg-accent-cyan text-slate-900 font-semibold px-4 py-2 rounded-lg text-xs hover:bg-cyan-300"
        >
          {loading ? "Generating…" : "Generate Micro-Gigs"}
        </button>
      </div>

      {gigs && (
        <div className="grid md:grid-cols-3 gap-3 text-xs">
          {gigs.gigs.map((g, idx) => (
            <div
              key={idx}
              className="rounded-2xl bg-slate-900/80 border border-slate-700 p-4 flex flex-col justify-between"
            >
              <div>
                <div className="text-[11px] text-slate-400 mb-1">Subtask {idx + 1}</div>
                <div className="font-semibold mb-1 text-slate-100">{g.title}</div>
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                <span>⏱ {g.duration_hours} hrs</span>
                <span className="text-accent-amber font-medium">₹{g.pay_estimate}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

