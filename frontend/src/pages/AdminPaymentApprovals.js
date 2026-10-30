import { useEffect, useMemo, useState } from "react";
import { getUpcomingAppointmentsForAdmin } from "../services/appointmentService";
import "../App.css";
import './Admin.css';

function AdminPaymentApprovals() {
  const [appointments, setAppointments] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const loadPayments = async () => {
    try {
      setLoading(true);
      setMessage("");

      const res = await getUpcomingAppointmentsForAdmin();
      setAppointments(res.data || []);
    } catch (err) {
      console.error(err);
      setMessage("Failed to load payment monitoring data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const paymentRelatedAppointments = useMemo(() => {
    return appointments.filter((item) => {
      const status = String(item.status || "").toLowerCase();
      const paymentStatus = String(item.paymentStatus || "").toLowerCase();

      return status === "completed" || paymentStatus === "pending" || paymentStatus === "successful";
    });
  }, [appointments]);

  const getPaymentStatusClass = (status) => {
    const value = String(status || "").toLowerCase();

    if (value === "successful") return "status status-confirmed";
    if (value === "pending") return "status status-pending";

    return "status status-completed";
  };

  return (
    <div className="doctor-page-stack">
      <div className="doctor-page-header-card">
        <p className="doctor-page-eyebrow">Payment Monitoring Module</p>
        <h2 className="doctor-page-title">Payment Overview</h2>
        <p className="doctor-page-subtitle">
          View consultation payments across the system. Admin does not approve
          payments here; this page is now for monitoring only.
        </p>
      </div>

      {loading && (
        <div className="dashboard-card">
          <p className="dashboard-subtitle">Loading payment overview...</p>
        </div>
      )}

      {!loading && message && <div className="auth-message">{message}</div>}

      {!loading && !message && paymentRelatedAppointments.length === 0 && (
        <div className="dashboard-card">
          <p className="dashboard-subtitle">
            No payment-related appointments found.
          </p>
        </div>
      )}

      {!loading && !message && paymentRelatedAppointments.length > 0 && (
        <div className="doctor-appointment-grid">
          {paymentRelatedAppointments.map((appointment) => (
            <div key={appointment.id} className="doctor-appointment-card">
              <div className="doctor-appointment-top">
                <div>
                  <p className="doctor-appointment-label">Payment Record</p>
                  <h3 className="doctor-appointment-title">
                    {appointment.patientName || "Unknown Patient"}
                  </h3>
                </div>

                <span className={getPaymentStatusClass(appointment.paymentStatus)}>
                  {appointment.paymentStatus || "Not Due"}
                </span>
              </div>

              <div className="doctor-appointment-details">
                <div className="doctor-detail-box">
                  <p className="doctor-detail-label">Doctor</p>
                  <h4 className="doctor-detail-value">
                    {appointment.doctorName || "-"}
                  </h4>
                </div>

                <div className="doctor-detail-box">
                  <p className="doctor-detail-label">Appointment Date</p>
                  <h4 className="doctor-detail-value">
                    {appointment.appointmentDate
                      ? new Date(appointment.appointmentDate).toLocaleDateString()
                      : "-"}
                  </h4>
                </div>

                <div className="doctor-detail-box">
                  <p className="doctor-detail-label">Appointment Time</p>
                  <h4 className="doctor-detail-value">
                    {appointment.appointmentTime || "-"}
                  </h4>
                </div>

                <div className="doctor-detail-box">
                  <p className="doctor-detail-label">Consultation Mode</p>
                  <h4 className="doctor-detail-value">
                    {appointment.mode || "-"}
                  </h4>
                </div>

                <div className="doctor-detail-box">
                  <p className="doctor-detail-label">Appointment Status</p>
                  <h4 className="doctor-detail-value">
                    {appointment.status || "-"}
                  </h4>
                </div>

                <div className="doctor-detail-box">
                  <p className="doctor-detail-label">Queue Position</p>
                  <h4 className="doctor-detail-value">
                    {appointment.queuePosition || "-"}
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

export default AdminPaymentApprovals;