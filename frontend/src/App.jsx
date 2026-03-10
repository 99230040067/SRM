import React, { useState, useEffect } from "react";
import Dashboard from "./components/Dashboard.jsx";
import Preloader from "./components/Preloader.jsx";
import Login from "./components/Login.jsx";

export default function App() {
  const [appState, setAppState] = useState("preloader"); // 'preloader', 'login', 'dashboard'
  const [user, setUser] = useState(null);

  const handlePreloaderComplete = () => {
    setAppState("login");
  };

  const handleLogin = (userData) => {
    setUser(userData);
    setAppState("dashboard");
  };

  if (appState === "preloader") {
    return <Preloader onComplete={handlePreloaderComplete} />;
  }

  if (appState === "login" || !user) {
    return <Login onLogin={handleLogin} />;
  }

  return <Dashboard user={user} onEditProfile={() => setAppState("login")} />;
}

