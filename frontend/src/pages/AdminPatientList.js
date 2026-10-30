import { useEffect, useState } from "react";
import { getAllPatients } from "../services/adminService";
import "../App.css";
import './Admin.css';

function AdminPatientList() {
  const [patients, setPatients] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  /* =========================================================
     LOAD ALL PATIENTS FOR ADMIN
  ========================================================= */
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true);
        setMessage("");

        const res = await getAllPatients();
        setPatients(res.data || []);
      } catch (err) {
        console.error(err);

        const serverMessage =
          typeof err.response?.data === "string"
            ? err.response.data
            : err.response?.data?.message;

        setMessage(serverMessage || "Failed to load patient list.");
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  return (
    <div className="doctor-page-stack">
      <div className="doctor-page-header-card">
        <p className="doctor-page-eyebrow">Patient Administration Module</p>
        <h2 className="doctor-page-title">Patient List</h2>
        <p className="doctor-page-subtitle">
          View registered patients and their basic account details across the system.
          Medical documents are not visible here.
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
              key={patient.id || patient.email}
              className="doctor-patient-card"
            >
              <div className="doctor-patient-top">
                <div className="doctor-patient-avatar">
                  {(patient.patientName?.charAt(0) || "P").toUpperCase()}
                </div>

                <div className="doctor-patient-heading">
                  <p className="doctor-appointment-label">Patient</p>
                  <h3 className="doctor-appointment-title">
                    {patient.patientName || "Unknown Patient"}
                  </h3>
                </div>

                <span className="status status-confirmed">Active</span>
              </div>

              <div className="doctor-appointment-details">
                <div className="doctor-detail-box">
                  <p className="doctor-detail-label">Email Address</p>
                  <h4 className="doctor-detail-value">
                    {patient.email || "-"}
                  </h4>
                </div>

                <div className="doctor-detail-box">
                  <p className="doctor-detail-label">Date of Birth</p>
                  <h4 className="doctor-detail-value">
                    {patient.dateOfBirth
                      ? new Date(patient.dateOfBirth).toLocaleDateString()
                      : "-"}
                  </h4>
                </div>

                <div className="doctor-detail-box">
                  <p className="doctor-detail-label">Gender</p>
                  <h4 className="doctor-detail-value">
                    {patient.gender || "-"}
                  </h4>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminPatientList;