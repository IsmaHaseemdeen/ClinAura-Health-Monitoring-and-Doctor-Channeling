import { useState } from "react";
import { register } from "../services/authService";
import "../App.css";
import "./Auth.css";

/* Register page used for creating a new patient account */
function Register({ onBack, onRegisterSuccess }) {
  /* Stores all registration form values */
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  /* Stores validation, success, or error messages */
  const [message, setMessage] = useState("");

  /* Prevents repeated form submission while request is in progress */
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* Updates the corresponding form field when the user types */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  /* Validates input and submits registration data to the backend */
  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage("");

    const { firstName, lastName, email, password, confirmPassword } = formData;

    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !email.trim() ||
      !password.trim() ||
      !confirmPassword.trim()
    ) {
      setMessage("Please fill in all required fields.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setMessage("Password must be at least 6 characters long.");
      return;
    }

    /* Combines first name and last name into a single full name */
    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();

    try {
      setIsSubmitting(true);

      await register({
        fullName,
        email: email.trim(),
        password
      });

      setMessage("Registration successful. Please login to continue.");

      /* Resets the form after successful registration */
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: ""
      });

      /* Returns the user to login after a short delay */
      if (onRegisterSuccess) {
        setTimeout(() => {
          onRegisterSuccess();
        }, 800);
      }
    } catch (err) {
      console.error(err);

      const serverMessage =
        typeof err.response?.data === "string"
          ? err.response.data
          : err.response?.data?.message;

      setMessage(serverMessage || "Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-shell register-shell">
        <div className="auth-left">
          <div className="auth-brand-badge">ClinAura</div>
          <h1>Create your patient account</h1>
          <p>
            Register to manage your health profile, upload reports, check
            symptoms, book appointments, and monitor your health journey from
            one unified platform.
          </p>

          <div className="auth-feature-list">
            <div className="auth-feature-item">
              <span className="auth-feature-dot" />
              <span>Secure patient account access</span>
            </div>
            <div className="auth-feature-item">
              <span className="auth-feature-dot" />
              <span>Report and lab record management</span>
            </div>
            <div className="auth-feature-item">
              <span className="auth-feature-dot" />
              <span>Symptom checker and advisory support</span>
            </div>
            <div className="auth-feature-item">
              <span className="auth-feature-dot" />
              <span>Doctor booking and status tracking</span>
            </div>
          </div>
        </div>

        <div className="auth-right">
          <div className="auth-card register-card">
            <h2>Patient Registration</h2>
            <p className="auth-subtext">
              Complete your details to create a new ClinAura patient account.
            </p>

            <form onSubmit={handleRegister} className="form-grid two-col">
              <div>
                <label>First Name</label>
                <input
                  type="text"
                  name="firstName"
                  placeholder="Enter first name"
                  value={formData.firstName}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label>Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  placeholder="Enter last name"
                  value={formData.lastName}
                  onChange={handleChange}
                />
              </div>

              <div className="full-width">
                <label>Email Address</label>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter email address"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  placeholder="Enter password"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label>Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Re-enter password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>

              {message && (
                <div
                  className={`full-width ${
                    message.toLowerCase().includes("successful")
                      ? "booking-success"
                      : "auth-message"
                  }`}
                >
                  {message}
                </div>
              )}

              <div className="auth-actions full-width">
                <button type="submit" className="btn-green" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create Account"}
                </button>

                <button type="button" className="btn-secondary" onClick={onBack}>
                  Back
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;