import { loginUser } from "../services/api";
import { useState } from "react";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
  const data = { email, password };
  try {
    const res = await loginUser(data);
    console.log("Backend response:", res);
    alert("Login response: " + JSON.stringify(res));
  } catch (error) {
    console.error("Login error:", error);
    alert("Failed to connect to backend. Make sure backend is running on port 8000");
  }
};

  return (
    <div style={{ padding: "20px", maxWidth: "300px", margin: "0 auto" }}>
      <h2>Login</h2>
      <div>
        <input
          type="email"
          placeholder="Email"
          style={{ width: "100%", padding: "8px", margin: "8px 0" }}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div>
        <input
          type="password"
          placeholder="Password"
          style={{ width: "100%", padding: "8px", margin: "8px 0" }}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <button 
        onClick={handleLogin}
        style={{ width: "100%", padding: "10px", marginTop: "10px" }}
      >
        Login
      </button>
    </div>
  );
}

export default Login;