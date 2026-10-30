import { useEffect, useMemo, useState } from "react";
import { getUpcomingAppointmentsForAdmin } from "../services/appointmentService";
import "../App.css";
import './Admin.css';

function AdminUpcomingAppointments() {
  /* =========================================================
     STATE
     Admin only needs read-only monitoring here.
  ========================================================= */
  const [appointments, setAppointments] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  /* =========================================================
     LOAD UPCOMING APPOINTMENTS
     This page is now a clean tabular monitoring page.
  ========================================================= */
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        setMessage("");

        const res = await getUpcomingAppointmentsForAdmin();
        setAppointments(res.data || []);
      } catch (err) {
        console.error(err);
        setMessage("Failed to load upcoming appointments.");
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  /* =========================================================
     FILTER
     Admin only monitors non-cancelled appointments here.
  ========================================================= */
  const upcomingAppointments = useMemo(() => {
    return appointments.filter(
      (item) => String(item.status || "").toLowerCase() !== "cancelled"
    );
  }, [appointments]);

  const getStatusClass = (status) => {
    const value = String(status || "").toLowerCase();

    if (value.includes("pending")) return "status status-pending";
    if (value === "completed") return "status status-completed";
    if (value === "cancelled") return "status status-rejected";

    return "status status-confirmed";
  };

  const getPaymentStatusClass = (status) => {
    const value = String(status || "").toLowerCase();

    if (value === "successful") return "status status-confirmed";
    if (value === "pending") return "status status-pending";

    return "status status-completed";
  };

  return (
    <div className="doctor-page-stack">
      <div className="doctor-page-header-card">
        <p className="doctor-page-eyebrow">Appointment Monitoring</p>
        <h2 className="doctor-page-title">Upcoming Appointments</h2>
        <p className="doctor-page-subtitle">
          View all active system appointments in one table with doctor, patient,
          schedule, consultation mode, and payment status details.
        </p>
      </div>

      {loading && (
        <div className="dashboard-card">
          <p className="dashboard-subtitle">Loading upcoming appointments...</p>
        </div>
      )}

      {!loading && message && <div className="auth-message">{message}</div>}

      {!loading && !message && upcomingAppointments.length === 0 && (
        <div className="dashboard-card">
          <p className="dashboard-subtitle">No upcoming appointments found.</p>
        </div>
      )}

      {/* =====================================================
         TABULAR APPOINTMENT VIEW
         Easier for admins to audit many appointments quickly.
      ===================================================== */}
      {!loading && !message && upcomingAppointments.length > 0 && (
        <div className="dashboard-card" style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              minWidth: "1100px"
            }}
          >
            <thead>
              <tr>
                <th style={tableHeaderStyle}>Patient</th>
                <th style={tableHeaderStyle}>Doctor</th>
                <th style={tableHeaderStyle}>Date</th>
                <th style={tableHeaderStyle}>Time Slot</th>
                <th style={tableHeaderStyle}>Mode</th>
                <th style={tableHeaderStyle}>Status</th>
                <th style={tableHeaderStyle}>Payment Status</th>
                <th style={tableHeaderStyle}>Payment Amount</th>
                <th style={tableHeaderStyle}>Meeting / Location</th>
              </tr>
            </thead>

            <tbody>
              {upcomingAppointments.map((appointment) => (
                <tr key={appointment.id}>
                  <td style={tableCellStyle}>{appointment.patientName || "-"}</td>
                  <td style={tableCellStyle}>{appointment.doctorName || "-"}</td>
                  <td style={tableCellStyle}>
                    {appointment.appointmentDate
                      ? new Date(appointment.appointmentDate).toLocaleDateString()
                      : "-"}
                  </td>
                  <td style={tableCellStyle}>{appointment.appointmentTime || "-"}</td>
                  <td style={tableCellStyle}>{appointment.mode || "-"}</td>
                  <td style={tableCellStyle}>
                    <span className={getStatusClass(appointment.status)}>
                      {appointment.status || "Unknown"}
                    </span>
                  </td>
                  <td style={tableCellStyle}>
                    <span className={getPaymentStatusClass(appointment.paymentStatus)}>
                      {appointment.paymentStatus || "Not Due"}
                    </span>
                  </td>
                  <td style={tableCellStyle}>
                    {appointment.paymentAmount != null
                      ? `Rs. ${Number(appointment.paymentAmount).toFixed(2)}`
                      : "-"}
                  </td>
                  <td style={tableCellStyle}>
                    {appointment.mode === "Online"
                      ? appointment.onlineMeetingLink || "-"
                      : appointment.physicalLocation || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const tableHeaderStyle = {
  textAlign: "left",
  padding: "12px",
  borderBottom: "1px solid #e5e7eb",
  whiteSpace: "nowrap"
};

const tableCellStyle = {
  padding: "12px",
  borderBottom: "1px solid #f1f5f9",
  verticalAlign: "top"
};

export default AdminUpcomingAppointments;