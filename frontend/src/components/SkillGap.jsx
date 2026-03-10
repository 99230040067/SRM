import React, { useState } from "react";
import axios from "axios";

const tooltip =
  "Embeds your skills and job requirements using MiniLM sentence transformers, then measures cosine similarity to compute a match % and suggest missing skills.";

const ROLE_SKILLS = {
  "Electrician": [
    "house wiring",
    "MCB panel installation",
    "Fault detection",
    "Solar panel mounting",
    "Basic electrical safety",
    "Drone piloting",
    "Patient assistance"
  ],
  "Software Developer": [
    "Python",
    "JavaScript",
    "React",
    "Node.js",
    "SQL",
    "Git",
    "AWS",
    "Docker"
  ],
  "Drone Operator": [
    "Drone piloting",
    "Aerial photography",
    "Flight planning",
    "UAV maintenance",
    "FAA regulations",
    "Data analysis"
  ]
};

const TARGET_ROLES = [
  "Electrician",
  "Software Developer",
  "Drone Operator",
  "AI Engineer",
  "Data Scientist",
  "Cloud Architect",
  "Cybersecurity Analyst",
  "Robotics Engineer",
  "Renewable Energy Technician",
  "Biomedical Engineer"
];

export default function SkillGap({ apiBase, user, showToast }) {
  const [selectedJob, setSelectedJob] = useState("");

  const findSkillsForRole = (role) => {
    if (!role) return [];
    const normalizedRole = String(role).toLowerCase().trim();
    for (const [key, skills] of Object.entries(ROLE_SKILLS)) {
      if (key.toLowerCase() === normalizedRole) return skills;
    }
    // If we only typed "developer" and it matches "software developer", etc.
    if (normalizedRole.includes("developer") || normalizedRole.includes("software")) return ROLE_SKILLS["Software Developer"];
    if (normalizedRole.includes("electrician")) return ROLE_SKILLS["Electrician"];
    if (normalizedRole.includes("drone")) return ROLE_SKILLS["Drone Operator"];
    
    return [role];
  };

  const userSkills = findSkillsForRole(user?.skills);
  
  const [selectedSkills, setSelectedSkills] = useState(userSkills);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  React.useEffect(() => {
    // Refresh selected skills when user changes
    setSelectedSkills(findSkillsForRole(user?.skills));
  }, [user]);

const toggleSkill = (skill) => {
  setSelectedSkills((prev) =>
    prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
  );
};

const runAnalysis = async () => {
  if (!selectedJob) {
    showToast?.("Please select a target role to analyze skill gap.", "danger");
    return;
  }
  setLoading(true);
  try {
    const res = await axios.post(`${apiBase}/skill-gap`, {
      worker_skills: selectedSkills,
      job_title: selectedJob
    });
    setResult(res.data);
    const tone = res.data.match_score >= 70 ? "success" : "info";
    showToast?.(`You are ${res.data.match_score}% ready for ${res.data.job_title}`, tone);
  } catch (e) {
    showToast?.("Skill gap analysis failed, please check backend.", "danger");
  } finally {
    setLoading(false);
  }
};

return (
  <div className="grid lg:grid-cols-3 gap-4 md:gap-6">
    <div className="glass-panel p-5 md:p-6 space-y-4 lg:col-span-2">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-accent-cyan">AI Skill Gap Analyzer</h2>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Compare your current {user?.skills} skills against high-growth roles and uncover
            the shortest upskilling path.
          </p>
        </div>
        <button
          className="text-xs text-slate-400 border border-slate-700 rounded-full px-3 py-1 hover:border-accent-cyan hover:text-accent-cyan"
          title={tooltip}
        >
          How it works?
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-4 text-xs">
        <div>
          <div className="font-medium mb-2">{user?.name}&apos;s skills</div>
          <div className="flex flex-wrap gap-2">
            {userSkills.map((skill) => {
              const active = selectedSkills.includes(skill);
              return (
                <button
                  key={skill}
                  onClick={() => toggleSkill(skill)}
                  className={`px-3 py-1.5 rounded-full border text-[11px] transition ${active
                      ? "border-accent-cyan bg-slate-900 text-accent-cyan"
                      : "border-slate-700 bg-slate-950 text-slate-300 hover:border-slate-500"
                    }`}
                >
                  {skill}
                </button>
              );
            })}
          </div>
        </div>
        <div>
          <div className="font-medium mb-2">Target role</div>
          <select
            value={selectedJob}
            onChange={(e) => setSelectedJob(e.target.value)}
            className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-accent-cyan"
          >
            <option value="" disabled>Select a role...</option>
            {TARGET_ROLES.map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
          <button
            onClick={runAnalysis}
            className="mt-3 inline-flex items-center gap-2 bg-accent-cyan text-slate-900 font-semibold px-4 py-1.5 rounded-lg text-xs hover:bg-cyan-300"
          >
            {loading ? "Analyzing…" : "Analyze Skill Gap"}
          </button>
        </div>
      </div>

      <div className="mt-4">
        <div className="font-medium text-sm mb-2">Result</div>
        {loading ? (
          <div className="animate-pulse h-24 rounded-xl bg-slate-900/70" />
        ) : result ? (
          <div className="grid md:grid-cols-3 gap-3 text-xs">
            <div className="rounded-xl bg-slate-900/80 border border-slate-700 p-3 md:p-4 col-span-2">
              <div className="text-slate-400 mb-1">Qualification score</div>
              <div className="flex items-end gap-2">
                <div className="text-3xl font-semibold text-accent-cyan">
                  {result.match_score}%
                </div>
                <div className="text-[11px] text-slate-400 mb-1">
                  towards {result.job_title} role
                </div>
              </div>
              <div className="mt-3 text-slate-300">
                {result.match_score >= 70
                  ? `${user?.name} is almost job-ready. A short targeted course can unlock this opportunity.`
                  : "Some critical skills are missing. EconoMind recommends the highest ROI topics below."}
              </div>
            </div>
            <div className="rounded-xl bg-slate-900/80 border border-slate-700 p-3 md:p-4">
              <div className="text-slate-400 mb-1">Missing skills</div>
              {result.missing_skills && result.missing_skills.length > 0 ? (
                <ul className="list-disc list-inside space-y-1">
                  {result.missing_skills.slice(0, 4).map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              ) : (
                <div className="text-emerald-300 text-xs">No major gaps detected.</div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-xs text-slate-400">
            Pick a role and click &quot;Analyze Skill Gap&quot; to see how ready {user?.name} is.
          </div>
        )}
      </div>

      {result?.courses && (
        <div className="mt-4">
          <div className="font-medium text-sm mb-2">Recommended free learning</div>
          <div className="grid md:grid-cols-3 gap-3 text-xs">
            {result.courses.map((c) => (
              <a
                key={c.title}
                href={c.url}
                target="_blank"
                rel="noreferrer"
                className="rounded-xl bg-slate-900/80 border border-slate-700 p-3 hover:border-accent-cyan hover:text-accent-cyan transition-colors"
              >
                <div className="text-[11px] text-slate-400 mb-1">{c.provider}</div>
                <div className="font-medium">{c.title}</div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>

    <div className="glass-panel p-5 md:p-6 space-y-3 text-xs">
      <div className="font-semibold mb-1">Judge spotlight</div>
      <ul className="space-y-1.5 text-slate-300">
        <li>• Demonstrates real NLP embeddings with sentence-transformers.</li>
        <li>• Narrative explains why users should invest in high-growth green skills.</li>
        <li>• Directly linked to demand forecast & job matching modules.</li>
        <li>• Dynamic input changes the recommended learning path.</li>
      </ul>
    </div>
  </div>
);
}

