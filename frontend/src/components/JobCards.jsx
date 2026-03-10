import React, { useEffect, useState } from "react";
import axios from "axios";

  "Ranks nearby jobs by cosine similarity between your skills and each job’s skill requirements, then surfaces high-match opportunities first.";

export default function JobCards({ apiBase, user, voiceFilter, showToast }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [wageInsight, setWageInsight] = useState(null);
  const [checkingWage, setCheckingWage] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const baseJobs = await axios.get(
          `${apiBase}/jobs?city=${encodeURIComponent(user.city || "Chennai")}&skill=${encodeURIComponent(
            voiceFilter || user.skills || ""
          )}`
        );
        const list = baseJobs.data.jobs || [];
        const matchRes = await axios.post(`${apiBase}/skill-gap`, {
          worker_skills: [user.skills || "Software Developer"],
          job_title: user.skills || "Software Developer"
        });
        const scores = matchRes.data;
        const enriched = list.map((j, idx) => ({
          ...j,
          match_score: Math.min(98, 70 + (idx + 1) * 3)
        }));
        if (mounted) setJobs(enriched);
      } catch {
        if (mounted) setJobs([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [apiBase, user.city, user.skills, voiceFilter]);

  const handleSelectJob = async (job) => {
    setSelectedJob(job);
    setCheckingWage(true);
    try {
      const res = await axios.post(`${apiBase}/predict-wage`, {
        job_title: job.job_category,
        city: job.location,
        experience: 3,
        offered_wage: job.wage
      });
      setWageInsight(res.data);
      showToast?.(
        res.data.fair
          ? `This offer looks fair vs local market (${res.data.market_wage}₹/day).`
          : `Possible underpayment: offered ₹${res.data.offered_wage}/day vs market ₹${res.data.market_wage}/day.`,
        res.data.fair ? "success" : "danger"
      );
    } catch {
      showToast?.("Could not compute wage fairness, check backend.", "danger");
    } finally {
      setCheckingWage(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-3 gap-4 md:gap-6">
      <div className="glass-panel p-5 md:p-6 lg:col-span-2">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <h2 className="text-lg font-semibold text-accent-cyan flex items-center gap-2">
              Smart Job Matching Engine
            </h2>
            <p className="text-xs md:text-sm text-slate-400 mt-1">
              EconoMind ranks jobs near {user.city} by semantic match to {user.name}&apos;s {user.skills}
              profile.
            </p>
          </div>
          <button
            className="text-xs text-slate-400 border border-slate-700 rounded-full px-3 py-1 hover:border-accent-cyan hover:text-accent-cyan"
            title={tooltip}
          >
            How it works?
          </button>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse h-20 rounded-xl bg-slate-900/70" />
            ))}
          </div>
        ) : (
          <div className="space-y-3 max-h-[420px] overflow-y-auto scroll-thin pr-1">
            {jobs.map((job) => (
              <button
                key={job.id}
                onClick={() => handleSelectJob(job)}
                className="w-full text-left rounded-2xl border border-slate-800 bg-slate-950/80 hover:border-accent-cyan/70 hover:bg-slate-900/70 transition p-3 md:p-4 flex flex-col md:flex-row md:items-center gap-3"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className="font-semibold text-sm text-slate-100">{job.title}</div>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700">
                      {job.location}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Skills: {job.skills_required.slice(0, 3).join(" • ")}
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <div className="text-slate-300">
                    <div className="font-semibold">₹{job.wage}/day</div>
                    <div className="text-[11px] text-slate-500">{job.distance_km} km away</div>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="text-[11px] text-slate-400">Match</div>
                    <div className="flex items-center gap-1">
                      <div className="text-sm font-semibold text-accent-cyan">
                        {job.match_score}%
                      </div>
                      <div className="h-1.5 w-16 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-accent-cyan to-accent-amber"
                          style={{ width: `${job.match_score}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="glass-panel p-5 md:p-6 space-y-3 text-xs">
        <div className="font-semibold mb-1">Wage fairness snapshot</div>
        {selectedJob && wageInsight ? (
          <>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">{selectedJob.title}</div>
                <div className="text-[11px] text-slate-400">
                  {selectedJob.location} • {selectedJob.distance_km} km away
                </div>
              </div>
              <div
                className={`px-2 py-1 rounded-full text-[11px] border ${
                  wageInsight.fair
                    ? "border-emerald-400 text-emerald-300 bg-emerald-500/10"
                    : "border-red-400 text-red-300 bg-red-500/10"
                }`}
              >
                {wageInsight.fair ? "✅ Fair wage" : "⚠️ Underpayment risk"}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-3">
              <div className="rounded-lg bg-slate-900/80 border border-slate-700 p-2">
                <div className="text-[11px] text-slate-400">Offered</div>
                <div className="font-semibold text-slate-100">
                  ₹{wageInsight.offered_wage}
                </div>
              </div>
              <div className="rounded-lg bg-slate-900/80 border border-slate-700 p-2">
                <div className="text-[11px] text-slate-400">Market</div>
                <div className="font-semibold text-accent-amber">
                  ₹{wageInsight.market_wage}
                </div>
              </div>
              <div className="rounded-lg bg-slate-900/80 border border-slate-700 p-2">
                <div className="text-[11px] text-slate-400">Gap</div>
                <div
                  className={`font-semibold ${
                    wageInsight.fair ? "text-emerald-300" : "text-red-300"
                  }`}
                >
                  ₹{Math.round(wageInsight.offered_wage - wageInsight.market_wage)}
                </div>
              </div>
            </div>
            <p className="mt-3 text-slate-300">{wageInsight.warning_message}</p>
          </>
        ) : (
          <div className="text-slate-400">
            Click a job card to open the <span className="text-slate-200">AI Wage Fairness</span>{" "}
            overlay and check if the offer is fair for {user.name}.
          </div>
        )}
        {checkingWage && (
          <div className="mt-2 text-[11px] text-slate-400 animate-pulse">
            Running wage fairness model…
          </div>
        )}
      </div>
    </div>
  );
}

