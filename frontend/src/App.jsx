"use client";

import { useState } from "react";

import Login from "./login";
import Register from "./register";
import Dashboard from "./Dashboard";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() =>
    Boolean(localStorage.getItem("token")),
  );
  const [showRegister, setShowRegister] = useState(false);
  // Login successful
  function handleLogin(session) {
    if (session?.token) localStorage.setItem("token", session.token);
    if (session?.user)
      localStorage.setItem("user", JSON.stringify(session.user));
    setIsLoggedIn(true);
  }

  // User clicked Register
  function handleShowRegister() {
    setShowRegister(true);
  }

  // Registration successful
  function handleRegister(session) {
    if (session?.token) localStorage.setItem("token", session.token);
    if (session?.user)
      localStorage.setItem("user", JSON.stringify(session.user));
    setShowRegister(false);
    if (session?.token) setIsLoggedIn(true);
  }

  // If logged in → show real-workspace
  if (isLoggedIn) {
    return (
      <Dashboard
        onLogout={() => {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setIsLoggedIn(false);
        }}
      />
    );
  }

  // If user clicked Register → show Register page
  if (showRegister) {
    return <Register onRegister={handleRegister} />;
  }

  // Otherwise → show Login page
  return <Login onLogin={handleLogin} onShowRegister={handleShowRegister} />;
}

export default App;
