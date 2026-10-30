import { useCallback, useEffect, useState } from "react";
import {
  cancelAppointment,
  getMyAppointments,
  payForAppointment
} from "../services/appointmentService";
import "../App.css";
import "./Booking.css";

function BookingStatus() {
  const [appointments, setAppointments] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [paymentFormForId, setPaymentFormForId] = useState(null);
  const [paymentForm, setPaymentForm] = useState({
    paymentMethod: "Card",
    cardHolderName: "",
    cardNumber: "",
    expiryDate: "",
    cvv: ""
  });

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

      const response = await getMyAppointments();
      const normalized = normalizeAppointments(response.data);
      setAppointments(normalized);
    } catch (error) {
      console.error("Failed to load appointments:", error);

      const serverMessage =
        typeof error.response?.data === "string"
          ? error.response.data
          : error.response?.data?.message;

      setAppointments([]);
      setMessage(serverMessage || "Failed to load bookings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  useEffect(() => {
    const handleWindowFocus = () => {
      fetchAppointments();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchAppointments();
      }
    };

    window.addEventListener("focus", handleWindowFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("focus", handleWindowFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [fetchAppointments]);

  const getStatusClass = (status) => {
    const value = String(status || "").toLowerCase();

    if (value.includes("pending")) return "status status-pending";
    if (value === "completed") return "status status-completed";
    if (value === "cancelled") return "status status-rejected";

    return "status status-confirmed";
  };

  const getPaymentStatusClass = (status) => {
    const value = String(status || "").toLowerCase();

    if (value === "successful" || value === "advance paid") {
      return "status status-confirmed";
    }

    if (value === "pending") return "status status-pending";
    if (value === "not due") return "status status-completed";

    return "status status-completed";
  };

  const formatAmount = (amount) => {
    if (amount === null || amount === undefined) return "-";
    return `Rs. ${Number(amount).toFixed(2)}`;
  };

  const handleCancel = async (appointmentId) => {
    try {
      setActionLoadingId(appointmentId);
      setMessage("");

      await cancelAppointment(appointmentId);
      setMessage("Appointment cancelled successfully.");
      await fetchAppointments();
    } catch (error) {
      console.error(error);

      const serverMessage =
        typeof error.response?.data === "string"
          ? error.response.data
          : error.response?.data?.message;

      setMessage(serverMessage || "Failed to cancel appointment.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const openPaymentForm = (appointmentId) => {
    setMessage("");
    setPaymentFormForId(appointmentId);
    setPaymentForm({
      paymentMethod: "Card",
      cardHolderName: "",
      cardNumber: "",
      expiryDate: "",
      cvv: ""
    });
  };

  const closePaymentForm = () => {
    setPaymentFormForId(null);
    setPaymentForm({
      paymentMethod: "Card",
      cardHolderName: "",
      cardNumber: "",
      expiryDate: "",
      cvv: ""
    });
  };

  const handlePaymentFieldChange = (e) => {
    const { name, value } = e.target;
    setPaymentForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitPayment = async (appointmentId) => {
    if (!paymentForm.cardHolderName.trim()) {
      setMessage("Please enter the card holder name.");
      return;
    }

    if (!paymentForm.cardNumber.trim()) {
      setMessage("Please enter the card number.");
      return;
    }

    if (!paymentForm.expiryDate.trim()) {
      setMessage("Please enter the expiry date.");
      return;
    }

    if (!paymentForm.cvv.trim()) {
      setMessage("Please enter the CVV.");
      return;
    }

    try {
      setActionLoadingId(appointmentId);
      setMessage("");

      await payForAppointment(appointmentId, {
        paymentMethod: paymentForm.paymentMethod
      });

      setMessage("Payment completed successfully.");
      closePaymentForm();
      await fetchAppointments();
    } catch (error) {
      console.error(error);

      const serverMessage =
        typeof error.response?.data === "string"
          ? error.response.data
          : error.response?.data?.message;

      setMessage(serverMessage || "Failed to complete payment.");
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="booking-page">
      <div className="booking-header-card">
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
            <p className="booking-eyebrow">Appointment Tracking</p>
            <h2 className="booking-title">My Bookings</h2>
            <p className="booking-subtitle">
              Track your booked appointments, queue position, cancellation window,
              consultation details, consultation notes, recommendations, payment amount,
              and payment status from one place.
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

      <div className="booking-status-note" style={{ marginBottom: "20px" }}>
        <strong>Important Notice</strong>
        <p style={{ marginTop: "10px" }}>
          You can cancel an appointment only within 12 hours from the booking
          time. After that, cancellation is no longer allowed.
        </p>
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

      {loading ? (
        <div className="booking-form-card">
          <p className="dashboard-subtitle">Loading bookings...</p>
        </div>
      ) : appointments.length === 0 ? (
        <div className="booking-form-card">
          <p className="dashboard-subtitle">No bookings found.</p>
        </div>
      ) : (
        <div className="booking-status-grid">
          {appointments.map((item) => (
            <div key={item.id} className="booking-status-card">
              <div className="booking-status-top">
                <div>
                  <p className="booking-status-label">Doctor</p>
                  <h3 className="booking-status-title">{item.doctorName || "-"}</h3>
                </div>

                <span className={getStatusClass(item.status)}>
                  {item.status || "Unknown"}
                </span>
              </div>

              <div className="booking-status-details">
                <div className="booking-detail-box">
                  <p className="booking-detail-label">Date</p>
                  <h4 className="booking-detail-value">
                    {item.appointmentDate
                      ? new Date(item.appointmentDate).toLocaleDateString()
                      : "-"}
                  </h4>
                </div>

                <div className="booking-detail-box">
                  <p className="booking-detail-label">Time</p>
                  <h4 className="booking-detail-value">
                    {item.appointmentTime || "-"}
                  </h4>
                </div>

                <div className="booking-detail-box">
                  <p className="booking-detail-label">Mode</p>
                  <h4 className="booking-detail-value">{item.mode || "-"}</h4>
                </div>

                <div className="booking-detail-box">
                  <p className="booking-detail-label">Queue Position</p>
                  <h4 className="booking-detail-value">
                    {item.queuePosition ?? "-"}
                  </h4>
                </div>

                <div className="booking-detail-box">
                  <p className="booking-detail-label">Waiting List</p>
                  <h4 className="booking-detail-value">
                    {item.isWaitingList ? "Yes" : "No"}
                  </h4>
                </div>

                <div className="booking-detail-box">
                  <p className="booking-detail-label">Payment Status</p>
                  <span className={getPaymentStatusClass(item.paymentStatus)}>
                    {item.paymentStatus || "Not Due"}
                  </span>
                </div>

                <div className="booking-detail-box">
                  <p className="booking-detail-label">Payment Amount</p>
                  <h4 className="booking-detail-value">
                    {formatAmount(item.paymentAmount)}
                  </h4>
                </div>
              </div>

              {item.notes && (
                <div className="booking-extra-info">
                  <div className="booking-extra-box">
                    <p className="booking-detail-label">Appointment Notes</p>
                    <h4 className="booking-detail-value">{item.notes}</h4>
                  </div>
                </div>
              )}

              {item.consultationNotes && (
                <div className="booking-extra-info">
                  <div className="booking-extra-box">
                    <p className="booking-detail-label">Consultation Notes</p>
                    <h4 className="booking-detail-value">{item.consultationNotes}</h4>
                  </div>
                </div>
              )}

              {item.recommendations && (
                <div className="booking-extra-info">
                  <div className="booking-extra-box">
                    <p className="booking-detail-label">Recommendations</p>
                    <h4 className="booking-detail-value">{item.recommendations}</h4>
                  </div>
                </div>
              )}

              {item.mode === "Online" && item.onlineMeetingLink && (
                <div className="booking-extra-info">
                  <div className="booking-extra-box">
                    <p className="booking-detail-label">Meeting Link</p>
                    <a
                      href={item.onlineMeetingLink}
                      target="_blank"
                      rel="noreferrer"
                      className="booking-link"
                    >
                      Join Meeting
                    </a>
                  </div>
                </div>
              )}

              {item.mode === "Physical" && item.physicalLocation && (
                <div className="booking-extra-info">
                  <div className="booking-extra-box">
                    <p className="booking-detail-label">Consultation Location</p>
                    <h4 className="booking-detail-value">
                      {item.physicalLocation}
                    </h4>
                  </div>
                </div>
              )}

              <div className="booking-extra-info">
                <div className="booking-extra-box">
                  <p className="booking-detail-label">Booked At</p>
                  <h4 className="booking-detail-value">
                    {item.requestedAt
                      ? new Date(item.requestedAt).toLocaleString()
                      : "-"}
                  </h4>
                </div>

                <div className="booking-extra-box">
                  <p className="booking-detail-label">Cancellation Allowed Until</p>
                  <h4 className="booking-detail-value">
                    {item.cancellationDeadlineUtc
                      ? new Date(item.cancellationDeadlineUtc).toLocaleString()
                      : "-"}
                  </h4>
                </div>
              </div>

              <div className="booking-progress-row">
                <div className="booking-progress-step active">Booked</div>
                <div
                  className={
                    item.status === "Completed"
                      ? "booking-progress-step active"
                      : "booking-progress-step"
                  }
                >
                  Consultation Completed
                </div>
                <div
                  className={
                    item.paymentStatus === "Successful"
                      ? "booking-progress-step active"
                      : "booking-progress-step"
                  }
                >
                  Payment Done
                </div>
              </div>

              <div
                className="booking-actions"
                style={{ display: "flex", gap: "12px", marginTop: "18px", flexWrap: "wrap" }}
              >
                {item.canCancel && item.status === "Pending Consultation" && (
                  <button
                    className="btn-danger"
                    onClick={() => handleCancel(item.id)}
                    disabled={actionLoadingId === item.id}
                  >
                    {actionLoadingId === item.id ? "Cancelling..." : "Cancel Appointment"}
                  </button>
                )}

                {item.status === "Completed" && item.paymentStatus === "Pending" && (
                  <button
                    className="btn-green"
                    onClick={() => openPaymentForm(item.id)}
                    disabled={actionLoadingId === item.id}
                  >
                    Pay Now
                  </button>
                )}
              </div>

              {paymentFormForId === item.id && (
                <div className="booking-form-card" style={{ marginTop: "18px" }}>
                  <h3 className="upload-section-title">Payment Details</h3>

                  <div className="form-grid two-col">
                    <div>
                      <label>Payment Method</label>
                      <select
                        name="paymentMethod"
                        value={paymentForm.paymentMethod}
                        onChange={handlePaymentFieldChange}
                      >
                        <option value="Card">Card</option>
                      </select>
                    </div>

                    <div>
                      <label>Amount</label>
                      <input
                        type="text"
                        value={formatAmount(item.paymentAmount)}
                        disabled
                      />
                    </div>

                    <div className="full-width">
                      <label>Card Holder Name</label>
                      <input
                        type="text"
                        name="cardHolderName"
                        value={paymentForm.cardHolderName}
                        onChange={handlePaymentFieldChange}
                        placeholder="Enter card holder name"
                      />
                    </div>

                    <div className="full-width">
                      <label>Card Number</label>
                      <input
                        type="text"
                        name="cardNumber"
                        value={paymentForm.cardNumber}
                        onChange={handlePaymentFieldChange}
                        placeholder="Enter card number"
                      />
                    </div>

                    <div>
                      <label>Expiry Date</label>
                      <input
                        type="text"
                        name="expiryDate"
                        value={paymentForm.expiryDate}
                        onChange={handlePaymentFieldChange}
                        placeholder="MM/YY"
                      />
                    </div>

                    <div>
                      <label>CVV</label>
                      <input
                        type="password"
                        name="cvv"
                        value={paymentForm.cvv}
                        onChange={handlePaymentFieldChange}
                        placeholder="CVV"
                      />
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "12px", marginTop: "18px" }}>
                    <button
                      className="btn-green"
                      onClick={() => handleSubmitPayment(item.id)}
                      disabled={actionLoadingId === item.id}
                    >
                      {actionLoadingId === item.id ? "Processing..." : "Submit Payment"}
                    </button>

                    <button className="btn-secondary" onClick={closePaymentForm}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default BookingStatus;