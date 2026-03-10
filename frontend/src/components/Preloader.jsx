import React, { useState, useEffect } from "react";

export default function Preloader({ onComplete }) {
  const [loadingTextIndex, setLoadingTextIndex] = useState(0);
  
  const loadingTexts = [
    "Analyzing workforce data...",
    "Predicting job opportunities...",
    "Preparing your AI dashboard..."
  ];

  useEffect(() => {
    // Change text every 1 second
    const textInterval = setInterval(() => {
      setLoadingTextIndex((prev) => (prev < loadingTexts.length - 1 ? prev + 1 : prev));
    }, 1000);

    // Complete preloader after 3 seconds
    const completionTimer = setTimeout(() => {
      onComplete();
    }, 3000);

    return () => {
      clearInterval(textInterval);
      clearTimeout(completionTimer);
    };
  }, [onComplete, loadingTexts.length]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background accent-gradient overflow-hidden">
      <div className="relative flex flex-col items-center">
        {/* Simple animation structure for workers */}
        <div className="flex gap-4 mb-8">
          <div className="text-5xl animate-bounce" style={{ animationDelay: "0ms" }}>👷🏽‍♂️</div>
          <div className="text-5xl animate-bounce" style={{ animationDelay: "200ms" }}>🧑🏽‍🔧</div>
          <div className="text-5xl animate-bounce" style={{ animationDelay: "400ms" }}>👩🏽‍🏭</div>
        </div>
        
        {/* Loading Spinner */}
        <div className="w-16 h-16 border-4 border-slate-700 border-t-accent-cyan rounded-full animate-spin mb-6"></div>
        
        {/* Loading Text */}
        <div className="text-accent-cyan font-medium text-lg h-8 transition-opacity duration-300">
          {loadingTexts[loadingTextIndex]}
        </div>
      </div>
    </div>
  );
}
