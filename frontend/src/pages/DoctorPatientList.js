import { useEffect, useState } from "react";
import { getPatients } from "../services/doctorService";
import "../App.css";
import './Doctor.css';

function DoctorPatientList() {
  const [patients, setPatients] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  /* =========================================================
     LOAD DOCTOR PATIENT LIST
  ========================================================= */
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true);
        setMessage("");

        const res = await getPatients();
        setPatients(res.data || []);
      } catch (err) {
        console.error(err);
        setMessage("Failed to load patient list.");
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  /* =========================================================
     STATUS BADGE HELPER
  ========================================================= */
  const getStatusClass = (status) => {
    const value = String(status || "").toLowerCase();

    if (value.includes("pending")) return "status status-pending";
    if (value === "confirmed") return "status status-confirmed";
    if (value === "rejected") return "status status-rejected";
    if (value === "completed") return "status status-completed";

    return "status status-completed";
  };

  return (
    <div className="doctor-page-stack">
      <div className="doctor-page-header-card">
        <p className="doctor-page-eyebrow">Patient Module</p>
        <h2 className="doctor-page-title">Patient List</h2>
        <p className="doctor-page-subtitle">
          View patients linked to your appointments and access their health records
          during valid consultation periods.
        </p>
      </div>

      {loading && (
        <div className="dashboard-card">
          <p className="dashboard-subtitle">Loading patient list...</p>
        </div>
      )}

      {!loading && message && <div className="auth-message">{message}</div>}

      {!loading && !message && patients.length === 0 && (
        <div className="dashboard-card">
          <p className="dashboard-subtitle">No patients found.</p>
        </div>
      )}

      {!loading && !message && patients.length > 0 && (
        <div className="doctor-patient-grid">
          {patients.map((patient) => (
            <div
              key={patient.patientProfileId || patient.patientName}
              className="doctor-patient-card"
            >
              <div className="doctor-patient-top">
                <div className="doctor-patient-avatar">
                  {patient.patientName?.charAt(0)?.toUpperCase() || "P"}
                </div>

                <div className="doctor-patient-heading">
                  <p className="doctor-appointment-label">Patient</p>
                  <h3 className="doctor-appointment-title">
                    {patient.patientName || "Unknown Patient"}
                  </h3>
                </div>

                <span className={getStatusClass(patient.status)}>
                  {patient.status || "Unknown"}
                </span>
              </div>

              <div className="doctor-appointment-details">
                <div className="doctor-detail-box">
                  <p className="doctor-detail-label">Latest Appointment Date</p>
                  <h4 className="doctor-detail-value">
                    {patient.latestAppointmentDate
                      ? new Date(patient.latestAppointmentDate).toLocaleDateString()
                      : "-"}
                  </h4>
                </div>

                <div className="doctor-detail-box">
                  <p className="doctor-detail-label">Latest Appointment Time</p>
                  <h4 className="doctor-detail-value">
                    {patient.latestAppointmentTime || "-"}
                  </h4>
                </div>

                <div className="doctor-detail-box">
                  <p className="doctor-detail-label">Consultation Mode</p>
                  <h4 className="doctor-detail-value">
                    {patient.mode || "-"}
                  </h4>
                </div>

                <div className="doctor-detail-box">
                  <p className="doctor-detail-label">Queue Position</p>
                  <h4 className="doctor-detail-value">
                    {patient.queuePosition || "-"}
                  </h4>
                </div>

                <div className="doctor-detail-box">
                  <p className="doctor-detail-label">Waiting List</p>
                  <h4 className="doctor-detail-value">
                    {patient.isWaitingList ? "Yes" : "No"}
                  </h4>
                </div>
              </div>

              {/* =========================================================
                 ACTION BUTTONS
                 (Simple version for now)
              ========================================================= */}
              <div className="doctor-appointment-actions">
                <button
                  className="btn-primary"
                  onClick={() =>
                    alert("Patient profile view can be added here.")
                  }
                >
                  View Patient Profile
                </button>

                <button
                  className="btn-green"
                  onClick={() =>
                    alert("Go to Health Records tab to view documents.")
                  }
                >
                  View Health Records
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default DoctorPatientList;