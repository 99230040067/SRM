import React, { useState } from "react";
import DemandPanel from "./DemandPanel.jsx";
import HeatMap from "./HeatMap.jsx";
import SkillGap from "./SkillGap.jsx";
import JobCards from "./JobCards.jsx";
import WageFairness from "./WageFairness.jsx";
import TrustScore from "./TrustScore.jsx";
import GigGenerator from "./GigGenerator.jsx";
import VoiceSearch from "./VoiceSearch.jsx";

const MODULES = [
  { id: "demand", label: "Demand Forecast", icon: "📈" },
  { id: "heatmap", label: "Opportunity Map", icon: "🗺️" },
  { id: "skills", label: "Skill Gap", icon: "🧠" },
  { id: "jobs", label: "Smart Jobs", icon: "💼" },
  { id: "wage", label: "Wage Fairness", icon: "⚖️" },
  { id: "gigs", label: "Micro-Gigs", icon: "🧩" },
  { id: "trust", label: "Trust Score", icon: "✨" },
  { id: "voice", label: "Voice Search", icon: "🎙️" }
];

const API_BASE = "http://127.0.0.1:8000";

export default function Dashboard({ user, onEditProfile }) {
  const [active, setActive] = useState("demand");
  const [toast, setToast] = useState(null);
  const [voiceFilter, setVoiceFilter] = useState(null);

  const showToast = (message, tone = "info") => {
    setToast({ message, tone });
    setTimeout(() => setToast(null), 3200);
  };

  return (
    <div className="min-h-screen flex bg-background accent-gradient">
      <aside className="hidden md:flex w-64 flex-col border-r border-slate-800 bg-slate-950/80 backdrop-blur-md">
        <div className="px-5 py-6 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-accent-cyan to-accent-amber flex items-center justify-center text-xl">
              🌱
            </div>
            <div>
              <div className="font-semibold text-sm tracking-wide">EconoMind AI</div>
              <div className="text-[11px] text-slate-400">Predictive Opportunity Radar</div>
            </div>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto scroll-thin py-4 space-y-1">
          {MODULES.map((m) => (
            <button
              key={m.id}
              onClick={() => setActive(m.id)}
              className={`flex w-full items-center gap-3 px-5 py-2.5 text-sm text-left transition ${
                active === m.id
                  ? "bg-slate-800/80 text-accent-cyan border-l-2 border-accent-cyan"
                  : "text-slate-300 hover:bg-slate-900/60 border-l-2 border-transparent"
              }`}
            >
              <span className="text-lg">{m.icon}</span>
              <span>{m.label}</span>
            </button>
          ))}
        </nav>
        <div className="px-5 py-4 border-t border-slate-800 text-xs text-slate-400">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-slate-200">Hi {user.name}</div>
              <div className="flex items-center gap-1">
                <span>📍</span>
                <span>{user.city}</span>
              </div>
            </div>
            <button
              onClick={onEditProfile}
              className="text-[11px] px-2 py-1 rounded-full border border-slate-600 hover:border-accent-cyan hover:text-accent-cyan"
            >
              Switch user
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col">
        <header className="flex items-center justify-between px-4 md:px-8 py-4 border-b border-slate-800 glass-panel rounded-none rounded-b-3xl">
          <div>
            <div className="text-xs uppercase tracking-[0.25em] text-slate-400">
              EconoMind AI
            </div>
            <div className="flex items-center gap-2 mt-1">
              <h1 className="text-lg md:text-2xl font-semibold">
                Welcome back, <span className="text-accent-cyan">{user.name}</span>
              </h1>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-900 text-[11px] border border-slate-700">
                📍 <span className="ml-1">{user.city}</span>
              </span>
            </div>
            <p className="text-xs md:text-sm text-slate-400 mt-1">
              Real-time green job demand, wage fairness, and micro-gig insights tailored for{" "}
              <span className="font-medium text-slate-200">{user.skills}</span>.
            </p>
          </div>
        </header>

        {toast && (
          <div className="fixed right-4 top-4 z-50">
            <div
              className={`glass-panel px-4 py-3 text-sm flex items-center gap-2 border-l-4 ${
                toast.tone === "danger"
                  ? "border-red-500 text-red-200"
                  : toast.tone === "success"
                  ? "border-emerald-500 text-emerald-200"
                  : "border-accent-cyan text-accent-cyan"
              }`}
            >
              {toast.message}
            </div>
          </div>
        )}

        <section className="flex-1 p-4 md:p-6 space-y-4 md:space-y-6">
          {active === "demand" && (
            <DemandPanel apiBase={API_BASE} showToast={showToast} user={user} />
          )}
          {active === "heatmap" && <HeatMap apiBase={API_BASE} />}
          {active === "skills" && (
            <SkillGap apiBase={API_BASE} user={user} showToast={showToast} />
          )}
          {active === "jobs" && (
            <JobCards
              apiBase={API_BASE}
              user={user}
              voiceFilter={voiceFilter}
              showToast={showToast}
            />
          )}
          {active === "wage" && (
            <WageFairness apiBase={API_BASE} user={user} showToast={showToast} />
          )}
          {active === "trust" && <TrustScore apiBase={API_BASE} />}
          {active === "gigs" && <GigGenerator apiBase={API_BASE} />}
          {active === "voice" && (
            <VoiceSearch
              onQueryDetected={(q) => {
                setVoiceFilter(q);
                setActive("jobs");
                showToast(`Voice search: focusing on ${q} jobs near you`, "success");
              }}
            />
          )}
        </section>
      </main>
    </div>
  );
}

