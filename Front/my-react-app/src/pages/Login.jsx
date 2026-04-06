import { useState } from "react";
import { loginUser } from "../services/api";

// Login component with role selection and improved UI
function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("STUDENT");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const containerStyle = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    backgroundColor: "#f0f2f5"
  };

  const boxStyle = {
    background: "white",
    padding: "2rem",
    borderRadius: "12px",
    width: "350px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
  };

  const inputStyle = {
    width: "100%",
    padding: "10px",
    margin: "10px 0",
    borderRadius: "8px",
    border: "1px solid #ccc",
    boxSizing: "border-box"
  };

  const buttonStyle = {
    width: "100%",
    padding: "10px",
    backgroundColor: loading ? "#aaa" : "#2c3e50",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "16px",
    marginTop: "10px"
  };

  const handleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await loginUser({ email, password, role });
      console.log("Backend response:", res);
      alert("Login response: " + JSON.stringify(res));
      // Handle successful login (e.g., store token, redirect)
      if (res.token) {
        localStorage.setItem("token", res.token);
        localStorage.setItem("role", res.role);
        // Redirect to dashboard or home page
        

      } 
    }catch (err) {
        setError("Something went wrong. Try again.");
      } finally {
        setLoading(false);
      }
    };

    return (
      <div style={containerStyle}>
        <div style={boxStyle}>
          <h2 style={{ textAlign: "center", color: "#2c3e50" }}>ILES System</h2>
          <p style={{ textAlign: "center", color: "#888" }}>Sign in to your account</p>
          {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}

          <input
            type="email"
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
          />

          <input
            type="password"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
          />

          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            style={inputStyle}
          >

            <option value="STUDENT">Student</option>
            <option value="WORKPLACE_SUPERVISOR">Workplace Supervisor</option>
            <option value="ACADEMIC_SUPERVISOR">Academic Supervisor</option>
            <option value="INTERNSHIP_ADMIN">Internship Admin</option>
          </select>

          <button
            onClick={handleLogin}
            disabled={loading}
            style={buttonStyle}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </div>
      </div>
    );
  }

  export default Login;
