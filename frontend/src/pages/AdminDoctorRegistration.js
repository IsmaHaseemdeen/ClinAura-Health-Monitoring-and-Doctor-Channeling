import { useState } from "react";
import { registerDoctor } from "../services/adminService";
import "../App.css";
import './Admin.css';

function AdminDoctorRegistration() {
  const [formData, setFormData] = useState({
    fullName: "",
    specialization: "General Physician",
    email: "",
    phone: "",
    experience: "",
    qualifications: "",
    availableDays: "",
    slotsPerDay: "",
    onlineTime: "",
    physicalTime: "",
    physicalLocation: "",
    password: ""
  });

  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  /* =========================================================
     FORM CHANGE HANDLER
  ========================================================= */
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  /* =========================================================
     SUBMIT DOCTOR REGISTRATION
  ========================================================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (
      !formData.fullName.trim() ||
      !formData.specialization.trim() ||
      !formData.email.trim() ||
      !formData.password.trim()
    ) {
      setMessage("Please fill in all required doctor account details.");
      return;
    }

    try {
      setSubmitting(true);

      await registerDoctor({
        ...formData,
        slotsPerDay: formData.slotsPerDay === "" ? 0 : Number(formData.slotsPerDay)
      });

      setMessage("Doctor registered successfully.");

      setFormData({
        fullName: "",
        specialization: "General Physician",
        email: "",
        phone: "",
        experience: "",
        qualifications: "",
        availableDays: "",
        slotsPerDay: "",
        onlineTime: "",
        physicalTime: "",
        physicalLocation: "",
        password: ""
      });
    } catch (err) {
      console.error(err);

      const serverMessage =
        typeof err.response?.data === "string"
          ? err.response.data
          : err.response?.data?.message;

      setMessage(serverMessage || "Failed to register doctor.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="doctor-page-stack">
      <div className="doctor-page-header-card">
        <p className="doctor-page-eyebrow">Doctor Management Module</p>
        <h2 className="doctor-page-title">Register Doctors</h2>
        <p className="doctor-page-subtitle">
          Create doctor accounts and define their consultation details and availability.
        </p>
      </div>

      <div className="admin-form-card">
        <form onSubmit={handleSubmit} className="form-grid two-col">
          <div>
            <label>Full Name</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Enter doctor full name"
            />
          </div>

          <div>
            <label>Specialization</label>
            <input
              type="text"
              name="specialization"
              value={formData.specialization}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email address"
            />
          </div>

          <div>
            <label>Phone Number</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter phone number"
            />
          </div>

          <div>
            <label>Experience</label>
            <input
              type="text"
              name="experience"
              value={formData.experience}
              onChange={handleChange}
              placeholder="e.g. 8 years"
            />
          </div>

          <div>
            <label>Available Number of Slots Per Day</label>
            <input
              type="number"
              name="slotsPerDay"
              value={formData.slotsPerDay}
              onChange={handleChange}
              placeholder="Enter slot count"
            />
          </div>

          <div className="full-width">
            <label>Qualifications</label>
            <textarea
              rows="3"
              name="qualifications"
              value={formData.qualifications}
              onChange={handleChange}
              placeholder="Add doctor qualifications"
            />
          </div>

          <div className="full-width">
            <label>Available Days</label>
            <input
              type="text"
              name="availableDays"
              value={formData.availableDays}
              onChange={handleChange}
              placeholder="e.g. Monday, Wednesday, Friday"
            />
          </div>

          <div>
            <label>Online Consultation Time</label>
            <input
              type="text"
              name="onlineTime"
              value={formData.onlineTime}
              onChange={handleChange}
              placeholder="e.g. 09:00 AM - 12:00 PM"
            />
          </div>

          <div>
            <label>Physical Consultation Time</label>
            <input
              type="text"
              name="physicalTime"
              value={formData.physicalTime}
              onChange={handleChange}
              placeholder="e.g. 02:00 PM - 05:00 PM"
            />
          </div>

          <div className="full-width">
            <label>Physical Location</label>
            <input
              type="text"
              name="physicalLocation"
              value={formData.physicalLocation}
              onChange={handleChange}
              placeholder="Enter physical consultation location"
            />
          </div>

          <div className="full-width">
            <label>Temporary Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create temporary password"
            />
          </div>

          {message && (
            <div
              className={`full-width ${
                message.toLowerCase().includes("successfully")
                  ? "booking-success"
                  : "auth-message"
              }`}
            >
              {message}
            </div>
          )}

          <div className="full-width admin-form-actions">
            <button
              type="submit"
              className="btn-primary"
              disabled={submitting}
            >
              {submitting ? "Registering..." : "Register Doctor"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AdminDoctorRegistration;