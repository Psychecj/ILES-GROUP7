import { useState } from "react";
import { requestPasswordReset } from "../services/api";
import { Link } from "react-router-dom";
import "./Register.css";  // reuse the same styling as Register page

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsError(false);
    setLoading(true);

    try {
      await requestPasswordReset({ email });
      setMessage("A reset link has been sent to your email. Check your inbox.");
      setEmail("");
    } catch (err) {
      setIsError(true);
      setMessage(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Forgot Password</h2>
        <p className="auth-subtitle">Enter your email to receive a password reset link</p>

        {message && (
          <p className={isError ? "error-msg" : "success-msg"}>{message}</p>
        )}

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email address"
            className="auth-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button
            type="submit"
            className={`auth-btn ${loading ? "disabled" : ""}`}
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <p className="auth-link">
          <Link to="/">Back to Login</Link>
        </p>
      </div>
    </div>
  );
}