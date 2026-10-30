import { useCallback, useEffect, useMemo, useState } from "react";
import API from "../services/api";
import "../App.css";
import "./Admin.css";

function AdminHighRiskPatients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [sendingPatientId, setSendingPatientId] = useState(null);

  const [filters, setFilters] = useState(() => {
    const today = new Date();
    const pastThreeMonths = new Date();
    pastThreeMonths.setMonth(today.getMonth() - 3);

    return {
      startDate: pastThreeMonths.toISOString().split("T")[0],
      endDate: today.toISOString().split("T")[0],
      bookingStatus: ""
    };
  });

  const loadPatients = useCallback(async (activeFilters = filters) => {
    try {
      setLoading(true);
      setMessage("");

      const params = {};
      if (activeFilters.startDate) params.startDate = activeFilters.startDate;
      if (activeFilters.endDate) params.endDate = activeFilters.endDate;
      if (activeFilters.bookingStatus) params.bookingStatus = activeFilters.bookingStatus;

      const response = await API.get("/admin/high-risk-patients", { params });
      setPatients(response.data || []);
    } catch (error) {
      console.error(error);

      const serverMessage =
        typeof error.response?.data === "string"
          ? error.response.data
          : error.response?.data?.message;

      setMessage(serverMessage || "Failed to load high-risk patients.");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleApplyFilters = async () => {
    await loadPatients(filters);
  };

  const handleClearFilters = async () => {
    const today = new Date();
    const pastThreeMonths = new Date();
    pastThreeMonths.setMonth(today.getMonth() - 3);

    const resetFilters = {
      startDate: pastThreeMonths.toISOString().split("T")[0],
      endDate: today.toISOString().split("T")[0],
      bookingStatus: ""
    };

    setFilters(resetFilters);
    await loadPatients(resetFilters);
  };

  const handleSendReminder = async (patientProfileId) => {
    try {
      setSendingPatientId(patientProfileId);
      setMessage("");

      const response = await API.post(
        `/admin/high-risk-patients/${patientProfileId}/send-reminder`
      );

      setMessage(response.data?.message || "Consultation reminder sent successfully.");

      await loadPatients(filters);
    } catch (error) {
      console.error(error);

      const serverMessage =
        typeof error.response?.data === "string"
          ? error.response.data
          : error.response?.data?.message;

      setMessage(serverMessage || "Failed to send consultation reminder.");
    } finally {
      setSendingPatientId(null);
    }
  };

  const summary = useMemo(() => {
    return {
      total: patients.length,
      booked: patients.filter((p) => p.hasAppointment).length,
      notBooked: patients.filter((p) => !p.hasAppointment).length
    };
  }, [patients]);

  return (
    <div className="dashboard-card">
      <div className="profile-page-header">
        <div>
          <span className="page-eyebrow">Admin Monitoring</span>
          <h2 className="page-title">High Risk Patients</h2>
          <p className="page-subtitle">
            Review patients with high-risk symptom checks, check whether they booked a consultation,
            and send reminders to patients who have not booked yet.
          </p>
        </div>
      </div>

      {message && (
        <div
          className={
            message.toLowerCase().includes("successfully")
              ? "booking-success"
              : "auth-message"
          }
        >
          {message}
        </div>
      )}

      <div className="form-grid two-col" style={{ marginBottom: "20px" }}>
        <div>
          <label>Start Date</label>
          <input
            type="date"
            name="startDate"
            value={filters.startDate}
            onChange={handleFilterChange}
          />
        </div>

        <div>
          <label>End Date</label>
          <input
            type="date"
            name="endDate"
            value={filters.endDate}
            onChange={handleFilterChange}
          />
        </div>

        <div>
          <label>Consultation Status</label>
          <select
            name="bookingStatus"
            value={filters.bookingStatus}
            onChange={handleFilterChange}
          >
            <option value="">All</option>
            <option value="booked">Booked Consultation</option>
            <option value="notbooked">Not Booked Consultation</option>
          </select>
        </div>

        <div style={{ display: "flex", alignItems: "end", gap: "10px", flexWrap: "wrap" }}>
          <button type="button" className="btn-primary" onClick={handleApplyFilters}>
            Apply Filters
          </button>
          <button type="button" className="btn-secondary" onClick={handleClearFilters}>
            Clear Filters
          </button>
        </div>
      </div>

      <div className="profile-grid" style={{ marginBottom: "20px" }}>
        <div className="profile-info-card">
          <p className="profile-label">Total High Risk Patients</p>
          <h3 className="profile-value">{summary.total}</h3>
        </div>

        <div className="profile-info-card">
          <p className="profile-label">Booked Consultation</p>
          <h3 className="profile-value">{summary.booked}</h3>
        </div>

        <div className="profile-info-card">
          <p className="profile-label">Not Booked Consultation</p>
          <h3 className="profile-value">{summary.notBooked}</h3>
        </div>
      </div>

      {loading ? (
        <p className="dashboard-subtitle">Loading high-risk patients...</p>
      ) : patients.length === 0 ? (
        <p className="dashboard-subtitle">No high-risk patients found for the selected filters.</p>
      ) : (
        <div className="notification-stack">
          {patients.map((patient) => (
            <div key={patient.patientProfileId} className="notification-card">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "start",
                  gap: "12px",
                  flexWrap: "wrap"
                }}
              >
                <div>
                  <strong className="notification-title">{patient.patientName}</strong>
                  <p className="notification-text">Email: {patient.patientEmail || "-"}</p>
                  <p className="notification-text">
                    Risk Level: {patient.latestRiskLevel || "-"} | Urgency: {patient.urgencyLevel || "-"}
                  </p>
                  <p className="notification-text">
                    Predicted Category: {patient.predictedCategory || "-"}
                  </p>
                  <p className="notification-text">
                    Symptom Summary: {patient.symptomList || "-"}
                  </p>
                  <p className="notification-text">
                    Advisory Note: {patient.advisoryNote || "-"}
                  </p>
                  <p className="notification-text">
                    Symptom Check Date:{" "}
                    {patient.submittedAt ? new Date(patient.submittedAt).toLocaleString() : "-"}
                  </p>
                  <p className="notification-text">
                    Consultation Booking:{" "}
                    <strong>{patient.hasAppointment ? "Booked" : "Not Booked"}</strong>
                  </p>

                  {patient.hasAppointment && (
                    <p className="notification-text">
                      Latest Appointment:{" "}
                      {patient.latestAppointmentDate
                        ? new Date(patient.latestAppointmentDate).toLocaleDateString()
                        : "-"}{" "}
                      {patient.latestAppointmentTime || ""} | {patient.latestAppointmentStatus || "-"} | Doctor:{" "}
                      {patient.latestDoctorName || "-"}
                    </p>
                  )}
                </div>

                {!patient.hasAppointment && (
                  <button
                    className="btn-danger"
                    onClick={() => handleSendReminder(patient.patientProfileId)}
                    disabled={sendingPatientId === patient.patientProfileId}
                  >
                    {sendingPatientId === patient.patientProfileId
                      ? "Sending..."
                      : "Send Consultation Reminder"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminHighRiskPatients;