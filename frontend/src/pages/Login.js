import { useState } from "react";
import { login } from "../services/authService";
import "../App.css";
import "./Auth.css";

/* Login page for authenticating users and providing quick demo access for viva */
function Login({ onLoginSuccess, onBack }) {
  /* Stores the email entered by the user */
  const [email, setEmail] = useState("");

  /* Stores the password entered by the user */
  const [password, setPassword] = useState("");

  /* Stores validation or login feedback messages */
  const [message, setMessage] = useState("");

  /* Prevents repeated clicks while a login request is in progress */
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* Demo users used for quick access during the viva */
  const demoUsers = [
    {
      label: "Admin",
      email: "admin101@clinaura.com",
      password: "Admin123!",
      role: "Admin",
    },
    {
      label: "Dr. Sarah",
      email: "sarah.fernando@clinaura.com",
      password: "Doctor123!",
      role: "Doctor",
    },
    {
      label: "Dr. Nimal",
      email: "nimal.perera@clinaura.com",
      password: "Doctor123!",
      role: "Doctor",
    },
    {
      label: "Ayesha",
      email: "ayesha.silva@clinaura.com",
      password: "Patient123!",
      role: "Patient",
    },
    {
      label: "Kamal",
      email: "kamal.jayasuriya@clinaura.com",
      password: "Patient123!",
      role: "Patient",
    },
  ];

  /* Handles normal login using manually entered credentials */
  const handleLogin = async () => {
    setMessage("");

    if (!email.trim() || !password.trim()) {
      setMessage("Please enter both email and password.");
      return;
    }

    try {
      setIsSubmitting(true);

      const res = await login({
        email: email.trim(),
        password,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);

      onLoginSuccess(res.data.role);
    } catch (err) {
      console.error(err);
      setMessage("Login failed. Please check your credentials.");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* Handles quick demo login for the predefined viva accounts */
  const handleDemoLogin = async (demoUser) => {
    setMessage("");

    try {
      setIsSubmitting(true);

      const res = await login({
        email: demoUser.email,
        password: demoUser.password,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);

      onLoginSuccess(res.data.role);
    } catch (err) {
      console.error(err);
      setMessage(`Quick login failed for ${demoUser.label}.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-shell">
        <div className="auth-left">
          <div className="auth-brand-badge">ClinAura</div>
          <h1>Welcome back to your health platform</h1>
          <p>
            Securely access health monitoring, reports, appointments, and
            consultation workflows through one connected system.
          </p>

          <div className="auth-feature-list">
            <div className="auth-feature-item">
              <span className="auth-feature-dot" />
              <span>AI-based symptom support</span>
            </div>
            <div className="auth-feature-item">
              <span className="auth-feature-dot" />
              <span>Doctor appointment tracking</span>
            </div>
            <div className="auth-feature-item">
              <span className="auth-feature-dot" />
              <span>Lab reports and trend visibility</span>
            </div>
            <div className="auth-feature-item">
              <span className="auth-feature-dot" />
              <span>Notifications and follow-up workflow</span>
            </div>
          </div>
        </div>

        <div className="auth-right">
          <div className="auth-card">
            <h2>Login</h2>
            <p className="auth-subtext">
              Enter your credentials to continue to your dashboard.
            </p>

            <div className="form-grid">
              <div>
                <label>Email Address</label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label>Password</label>
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {message && <div className="auth-message">{message}</div>}

            <div className="auth-actions">
              <button
                className="btn-primary"
                onClick={handleLogin}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Signing in..." : "Login"}
              </button>

              <button
                className="btn-secondary"
                onClick={onBack}
                disabled={isSubmitting}
              >
                Back
              </button>
            </div>

            <div className="demo-login-panel">
              <div className="demo-login-header">
                <h3>Quick Demo Access</h3>
                <p>
                  Shortcut accounts to enter each
                  module quickly.
                </p>
              </div>

              <div className="demo-login-groups">
                <div className="demo-login-group">
                  <span className="demo-login-group-title">Admin</span>
                  <button
                    className="demo-login-btn"
                    onClick={() => handleDemoLogin(demoUsers[0])}
                    disabled={isSubmitting}
                  >
                    Admin
                  </button>
                </div>

                <div className="demo-login-group">
                  <span className="demo-login-group-title">Doctors</span>
                  <div className="demo-login-row">
                    <button
                      className="demo-login-btn"
                      onClick={() => handleDemoLogin(demoUsers[1])}
                      disabled={isSubmitting}
                    >
                      Dr. Sarah
                    </button>
                    <button
                      className="demo-login-btn"
                      onClick={() => handleDemoLogin(demoUsers[2])}
                      disabled={isSubmitting}
                    >
                      Dr. Nimal
                    </button>
                  </div>
                </div>

                <div className="demo-login-group">
                  <span className="demo-login-group-title">Patients</span>
                  <div className="demo-login-row">
                    <button
                      className="demo-login-btn"
                      onClick={() => handleDemoLogin(demoUsers[3])}
                      disabled={isSubmitting}
                    >
                      Ayesha
                    </button>
                    <button
                      className="demo-login-btn"
                      onClick={() => handleDemoLogin(demoUsers[4])}
                      disabled={isSubmitting}
                    >
                      Kamal
                    </button>
                  </div>
                </div>
              </div>

              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;