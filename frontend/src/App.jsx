import { useState } from "react";

import Login from "./login";
import Register from "./register";
import Dashboard from "./Dashboard"

import "./App.css";

function App() {

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [userName,setUsername]=useState("");
  // Login successful
  function handleLogin() {
    setIsLoggedIn(true);
  }

  // User clicked Register
  function handleShowRegister() {
    setShowRegister(true);
  }

  // Registration successful
  function handleRegister() {
    setShowRegister(false);
  }

  // If logged in → show real-workspace
  if (isLoggedIn) {
    return (
      <Dashboard
        onLogout={() => setIsLoggedIn(false)}
      />
    );
  }

  // If user clicked Register → show Register page
  if (showRegister) {
    return (
      <Register
        onRegister={handleRegister}
      />
    );
  }

  // Otherwise → show Login page
  return (
    <Login
      onLogin={handleLogin}
      onShowRegister={handleShowRegister}
    />
  );
}

export default App;
