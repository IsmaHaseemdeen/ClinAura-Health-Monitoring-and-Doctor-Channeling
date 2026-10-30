import { useCallback, useEffect, useMemo, useState } from "react";
import {
  completeAppointment,
  getDoctorPendingAppointments
} from "../services/appointmentService";
import { getDoctorDocumentBlob } from "../services/doctorService";
import "../App.css";
import "./Doctor.css";

function DoctorPendingAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [completionData, setCompletionData] = useState({});

  const normalizeAppointments = (data) => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.$values)) return data.$values;
    if (Array.isArray(data?.items)) return data.items;
    return [];
  };

  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      setMessage("");

      const res = await getDoctorPendingAppointments();
      const normalized = normalizeAppointments(res.data);
      setAppointments(normalized);
    } catch (err) {
      console.error(err);

      const serverMessage =
        typeof err.response?.data === "string"
          ? err.response.data
          : err.response?.data?.message;

      setAppointments([]);
      setMessage(serverMessage || "Failed to load doctor appointments.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const pendingAppointments = useMemo(() => {
    return appointments.filter(
      (item) => String(item.status || "").toLowerCase() === "pending consultation"
    );
  }, [appointments]);

  const handleFieldChange = (appointmentId, field, value) => {
    setCompletionData((prev) => ({
      ...prev,
      [appointmentId]: {
        ...prev[appointmentId],
        [field]: value
      }
    }));
  };

  const handleComplete = async (appointment) => {
    const currentData = completionData[appointment.id] || {};

    if (!currentData.paymentAmount || Number(currentData.paymentAmount) <= 0) {
      setMessage("Please enter a valid payment amount.");
      return;
    }

    if (!String(currentData.consultationNotes || "").trim()) {
      setMessage("Please enter consultation notes before completing the consultation.");
      return;
    }

    try {
      setActionLoadingId(appointment.id);
      setMessage("");

      await completeAppointment(appointment.id, {
        status: "Completed",
        paymentAmount: Number(currentData.paymentAmount),
        consultationNotes: currentData.consultationNotes || "",
        recommendations: currentData.recommendations || ""
      });

      setAppointments((prev) => prev.filter((item) => item.id !== appointment.id));

      setCompletionData((prev) => ({
        ...prev,
        [appointment.id]: {
          paymentAmount: "",
          consultationNotes: "",
          recommendations: ""
        }
      }));

      setMessage("Appointment completed and payment assigned successfully.");
    } catch (err) {
      console.error(err);

      const serverMessage =
        typeof err.response?.data === "string"
          ? err.response.data
          : err.response?.data?.message;

      setMessage(serverMessage || "Failed to complete appointment.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleOpenDocument = async (documentId) => {
    try {
      setMessage("");

      const response = await getDoctorDocumentBlob(documentId);
      const blob = new Blob([response.data], {
        type: response.data?.type || "application/octet-stream"
      });

      const objectUrl = URL.createObjectURL(blob);
      window.open(objectUrl, "_blank", "noopener,noreferrer");
    } catch (error) {
      console.error(error);
      setMessage("Failed to open health record.");
    }
  };

  return (
    <div className="doctor-page-stack">
      <div className="doctor-page-header-card">
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
            <p className="doctor-page-eyebrow">Appointment Module</p>
            <h2 className="doctor-page-title">Pending Appointments</h2>
            <p className="doctor-page-subtitle">
              Review appointment details, patient summary, latest symptom check,
              uploaded health records, and complete the consultation with payment,
              consultation notes, and recommendations.
            </p>
          </div>

          <button
            type="button"
            className="btn-primary"
            onClick={fetchAppointments}
            disabled={loading}
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {!loading && (
        <div className="booking-status-note" style={{ marginBottom: "20px" }}>
          <strong>Doctor Queue Notice</strong>
          <p style={{ marginTop: "10px" }}>
            This page shows all appointments currently waiting for consultation under
            your doctor account. Completed appointments are removed from this pending list
            immediately after consultation is marked as completed.
          </p>
        </div>
      )}

      {loading && (
        <div className="dashboard-card">
          <p className="dashboard-subtitle">Loading pending appointments...</p>
        </div>
      )}

      {!loading && message && (
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

      {!loading && pendingAppointments.length === 0 && (
        <div className="dashboard-card">
          <p className="dashboard-subtitle">
            No pending consultation appointments available.
          </p>
        </div>
      )}

      {!loading && pendingAppointments.length > 0 && (
        <div className="doctor-notification-stack">
          {pendingAppointments.map((appointment) => (
            <div key={appointment.id} className="doctor-notification-card">
              <div className="doctor-notification-top">
                <div>
                  <p className="doctor-appointment-label">Patient Appointment</p>
                  <h3 className="doctor-appointment-title">
                    {appointment.patientName || "Unknown Patient"}
                  </h3>
                </div>

                <span className="status status-pending">
                  {appointment.status || "Pending Consultation"}
                </span>
              </div>

              <div className="profile-grid" style={{ marginTop: "18px" }}>
                <div className="profile-info-card">
                  <p className="profile-label">Date</p>
                  <h3 className="profile-value">
                    {appointment.appointmentDate
                      ? new Date(appointment.appointmentDate).toLocaleDateString()
                      : "-"}
                  </h3>
                </div>

                <div className="profile-info-card">
                  <p className="profile-label">Time Slot</p>
                  <h3 className="profile-value">{appointment.appointmentTime || "-"}</h3>
                </div>

                <div className="profile-info-card">
                  <p className="profile-label">Mode</p>
                  <h3 className="profile-value">{appointment.mode || "-"}</h3>
                </div>

                <div className="profile-info-card">
                  <p className="profile-label">Meeting / Location</p>
                  <h3 className="profile-value" style={{ wordBreak: "break-word" }}>
                    {appointment.mode === "Online"
                      ? appointment.onlineMeetingLink || "-"
                      : appointment.physicalLocation || "-"}
                  </h3>
                </div>

                <div className="profile-info-card">
                  <p className="profile-label">Patient Gender</p>
                  <h3 className="profile-value">{appointment.patient?.gender || "-"}</h3>
                </div>

                <div className="profile-info-card">
                  <p className="profile-label">Date of Birth</p>
                  <h3 className="profile-value">
                    {appointment.patient?.dateOfBirth
                      ? new Date(appointment.patient.dateOfBirth).toLocaleDateString()
                      : "-"}
                  </h3>
                </div>

                <div className="profile-info-card">
                  <p className="profile-label">Height / Weight</p>
                  <h3 className="profile-value">
                    {appointment.patient?.heightCm || "-"} cm / {appointment.patient?.weightKg || "-"} kg
                  </h3>
                </div>

                <div className="profile-info-card">
                  <p className="profile-label">Medical History</p>
                  <h3 className="profile-value">
                    {appointment.patient?.medicalHistory || "No history added"}
                  </h3>
                </div>
              </div>

              {appointment.notes && (
                <div className="profile-info-card" style={{ marginTop: "16px" }}>
                  <p className="profile-label">Appointment Notes</p>
                  <h3 className="profile-value">{appointment.notes}</h3>
                </div>
              )}

              {appointment.patient?.lifestyleNotes && (
                <div className="profile-info-card" style={{ marginTop: "16px" }}>
                  <p className="profile-label">Lifestyle Notes</p>
                  <h3 className="profile-value">{appointment.patient.lifestyleNotes}</h3>
                </div>
              )}

              <div className="profile-info-card" style={{ marginTop: "16px" }}>
                <p className="profile-label">Latest Symptom Checker Summary</p>

                {!appointment.latestSymptomCheck ? (
                  <p className="dashboard-subtitle" style={{ marginTop: "8px" }}>
                    No symptom checker result available.
                  </p>
                ) : (
                  <>
                    <h3 className="profile-value">
                      {appointment.latestSymptomCheck.predictedCategory || "-"}
                    </h3>
                    <p className="dashboard-subtitle" style={{ marginTop: "8px" }}>
                      Risk: {appointment.latestSymptomCheck.riskLevel || "-"} | Urgency:{" "}
                      {appointment.latestSymptomCheck.urgencyLevel || "-"}
                    </p>
                    <p className="dashboard-subtitle" style={{ marginTop: "8px" }}>
                      Symptoms: {appointment.latestSymptomCheck.symptomList || "-"}
                    </p>
                    <p className="dashboard-subtitle" style={{ marginTop: "8px" }}>
                      Advisory: {appointment.latestSymptomCheck.advisoryNote || "-"}
                    </p>
                  </>
                )}
              </div>

              <div className="profile-info-card" style={{ marginTop: "16px" }}>
                <p className="profile-label">Patient Health Records</p>

                {!appointment.healthDocuments || appointment.healthDocuments.length === 0 ? (
                  <p className="dashboard-subtitle" style={{ marginTop: "8px" }}>
                    No uploaded health records available.
                  </p>
                ) : (
                  <div style={{ display: "grid", gap: "10px", marginTop: "12px" }}>
                    {appointment.healthDocuments.map((doc) => (
                      <div
                        key={doc.id}
                        style={{
                          border: "1px solid rgba(148, 163, 184, 0.2)",
                          borderRadius: "12px",
                          padding: "12px"
                        }}
                      >
                        <strong>{doc.fileName}</strong>
                        <p className="dashboard-subtitle" style={{ marginTop: "6px" }}>
                          Category: {doc.documentCategory || "-"}
                        </p>
                        <p className="dashboard-subtitle" style={{ marginTop: "6px" }}>
                          Document Date:{" "}
                          {doc.documentDate
                            ? new Date(doc.documentDate).toLocaleDateString()
                            : "-"}
                        </p>
                        <button
                          className="btn-primary"
                          style={{ marginTop: "10px" }}
                          onClick={() => handleOpenDocument(doc.id)}
                        >
                          View Record
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="booking-form-card" style={{ marginTop: "18px" }}>
                <h3 className="upload-section-title">Complete Consultation</h3>

                <div className="form-grid two-col">
                  <div>
                    <label>Payment Amount (Rs.)</label>
                    <input
                      type="number"
                      placeholder="Enter payment amount"
                      value={completionData[appointment.id]?.paymentAmount || ""}
                      onChange={(e) =>
                        handleFieldChange(
                          appointment.id,
                          "paymentAmount",
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div>
                    <label>Consultation Mode</label>
                    <input type="text" value={appointment.mode || "-"} disabled />
                  </div>

                  <div className="full-width">
                    <label>Meeting / Location</label>
                    <input
                      type="text"
                      value={
                        appointment.mode === "Online"
                          ? appointment.onlineMeetingLink || "-"
                          : appointment.physicalLocation || "-"
                      }
                      disabled
                    />
                  </div>

                  <div className="full-width">
                    <label>Consultation Notes</label>
                    <textarea
                      rows="4"
                      placeholder="Enter the main consultation notes"
                      value={completionData[appointment.id]?.consultationNotes || ""}
                      onChange={(e) =>
                        handleFieldChange(
                          appointment.id,
                          "consultationNotes",
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div className="full-width">
                    <label>Recommendations</label>
                    <textarea
                      rows="3"
                      placeholder="Enter follow-up advice or recommendations"
                      value={completionData[appointment.id]?.recommendations || ""}
                      onChange={(e) =>
                        handleFieldChange(
                          appointment.id,
                          "recommendations",
                          e.target.value
                        )
                      }
                    />
                  </div>
                </div>

                <div style={{ marginTop: "18px" }}>
                  <button
                    className="btn-green"
                    onClick={() => handleComplete(appointment)}
                    disabled={actionLoadingId === appointment.id}
                  >
                    {actionLoadingId === appointment.id
                      ? "Processing..."
                      : "Complete Consultation"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default DoctorPendingAppointments;