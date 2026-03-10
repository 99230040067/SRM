import React, { useEffect, useRef, useState } from "react";

const tooltip =
  "Uses the browser’s SpeechRecognition API to capture natural language like “Find jobs near me” and applies a keyword matcher to trigger searches.";

export default function VoiceSearch({ onQueryDetected }) {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition || null;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript;
      setTranscript(text);
      const lowered = text.toLowerCase();
      let keyword = null;
      if (lowered.includes("electrician") || lowered.includes("ev")) keyword = "Electrician";
      else if (lowered.includes("developer") || lowered.includes("software")) keyword = "Software Developer";
      else if (lowered.includes("drone")) keyword = "Drone Operator";
      if (lowered.includes("solar")) keyword = "Solar";
      if (lowered.includes("nurse") || lowered.includes("health")) keyword = "Healthcare";
      if (keyword && onQueryDetected) {
        onQueryDetected(keyword.toLowerCase());
      }
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognitionRef.current = recognition;
  }, [onQueryDetected]);

  const toggle = () => {
    const rec = recognitionRef.current;
    if (!rec) {
      alert("SpeechRecognition is not supported in this browser.");
      return;
    }
    if (listening) {
      rec.stop();
      setListening(false);
    } else {
      setTranscript("");
      rec.start();
      setListening(true);
    }
  };

  return (
    <div className="glass-panel p-5 md:p-6 max-w-xl mx-auto">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h2 className="text-lg font-semibold text-accent-cyan flex items-center gap-2">
            Voice Job Search
          </h2>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Say &quot;Find jobs near me&quot; to instantly filter matches.
          </p>
        </div>
        <button
          className="text-xs text-slate-400 border border-slate-700 rounded-full px-3 py-1 hover:border-accent-cyan hover:text-accent-cyan"
          title={tooltip}
        >
          How it works?
        </button>
      </div>

      <div className="flex flex-col items-center gap-4">
        <button
          onClick={toggle}
          className={`h-20 w-20 rounded-full border-2 flex items-center justify-center text-3xl transition-all ${
            listening
              ? "border-accent-amber bg-accent-amber/20 animate-pulse"
              : "border-accent-cyan bg-accent-cyan/10"
          }`}
        >
          🎙️
        </button>
        <div className="text-xs text-slate-400">
          {listening
            ? "Listening… speak naturally in English or Hinglish."
            : "Tap the mic, then say your query."}
        </div>
        <div className="w-full rounded-xl bg-slate-900/80 border border-slate-700 p-3 text-xs text-slate-200 min-h-[60px]">
          {transcript || "Transcript will appear here after you speak."}
        </div>
      </div>
    </div>
  );
}

