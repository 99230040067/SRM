import React from "react";

export default function Login({ onLogin }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    onLogin({
      name: formData.get("name"),
      skills: formData.get("skills"),
      city: formData.get("city"),
      experience: formData.get("experience")
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background accent-gradient p-4">
      <div className="glass-panel w-full max-w-md p-8 space-y-8 rounded-2xl shadow-2xl relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-accent-cyan/20 blur-3xl rounded-full mix-blend-screen pointer-events-none"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-accent-amber/20 blur-3xl rounded-full mix-blend-screen pointer-events-none"></div>
        
        <div className="text-center relative z-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-slate-800 to-slate-900 border border-slate-700 shadow-lg text-3xl mb-4">
            🌱
          </div>
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-accent-cyan to-accent-amber mb-2">
            EconoMind AI
          </h1>
          <p className="text-sm font-medium text-slate-300">
            Workforce Intelligence Platform
          </p>
          <p className="text-xs text-slate-400 mt-2">
            Understand the future of jobs and prepare your skills.
          </p>
        </div>

        <form className="space-y-5 relative z-10" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 px-1">Full Name</label>
              <input
                required
                name="name"
                placeholder="e.g. Harshitha"
                className="w-full rounded-xl bg-slate-900/50 border border-slate-700/50 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-accent-cyan/50 focus:border-accent-cyan transition-all"
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 px-1">City</label>
              <input
                required
                name="city"
                placeholder="e.g. Chennai"
                className="w-full rounded-xl bg-slate-900/50 border border-slate-700/50 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-accent-cyan/50 focus:border-accent-cyan transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 px-1">Primary Skill</label>
              <input
                required
                name="skills"
                placeholder="e.g. Electrician, Software Developer"
                className="w-full rounded-xl bg-slate-900/50 border border-slate-700/50 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-accent-cyan/50 focus:border-accent-cyan transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 px-1">Experience Level</label>
              <select
                required
                name="experience"
                className="w-full rounded-xl bg-slate-900/50 border border-slate-700/50 px-4 py-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-accent-cyan/50 focus:border-accent-cyan transition-all appearance-none"
              >
                <option value="" disabled selected>Select your experience</option>
                <option value="Beginner">Beginner (0-2 years)</option>
                <option value="Intermediate">Intermediate (3-5 years)</option>
                <option value="Expert">Expert (5+ years)</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-6 bg-gradient-to-r from-accent-cyan to-teal-400 text-slate-950 font-bold py-3.5 rounded-xl hover:opacity-90 transform hover:-translate-y-0.5 transition-all shadow-lg shadow-accent-cyan/20"
          >
            Start Analysis
          </button>
        </form>
      </div>
    </div>
  );
}
