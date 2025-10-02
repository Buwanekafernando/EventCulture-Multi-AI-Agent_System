import React from "react";
import { GoogleOAuthProvider,GoogleLogin } from "@react-oauth/google";
import axios from "axios";

function App() {
  const handleLogin = () => {
    window.location.href = "http://localhost:5000/auth/login";
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Event Finder</h1>
      <button onClick={handleLogin} style={{ padding: "10px 20px", fontSize: "16px" }}>
        Login with Google
      </button>
    </div>
  );
}


export default App;
