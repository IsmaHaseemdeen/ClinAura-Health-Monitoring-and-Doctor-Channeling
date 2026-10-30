import { useEffect, useState } from "react";
import { getDoctorNotifications } from "../services/doctorService";
import API from "../services/api";
import "../App.css";

function DoctorNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [markingId, setMarkingId] = useState(null);
  const [markingAll, setMarkingAll] = useState(false);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setMessage("");

      const response = await getDoctorNotifications();
      setNotifications(response.data || []);
    } catch (error) {
      console.error(error);

      const serverMessage =
        typeof error.response?.data === "string"
          ? error.response.data
          : error.response?.data?.message;

      setMessage(serverMessage || "Failed to load doctor notifications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      setMarkingId(id);
      setMessage("");

      await API.put(`/notifications/${id}/read`);

      setNotifications((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, isRead: true } : item
        )
      );
    } catch (error) {
      console.error(error);
      setMessage("Failed to update notification.");
    } finally {
      setMarkingId(null);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setMarkingAll(true);
      setMessage("");

      await API.put("/notifications/read-all");

      setNotifications((prev) =>
        prev.map((item) => ({ ...item, isRead: true }))
      );
    } catch (error) {
      console.error(error);
      setMessage("Failed to mark all notifications as read.");
    } finally {
      setMarkingAll(false);
    }
  };

  const unreadCount = notifications.filter((item) => !item.isRead).length;

  return (
    <div className="doctor-page-stack">
      <div className="doctor-page-header-card">
        <p className="doctor-page-eyebrow">Notification Module</p>
        <h2 className="doctor-page-title">Doctor Notifications</h2>
        <p className="doctor-page-subtitle">
          Review meaningful booking, cancellation, and consultation updates for your appointments.
        </p>
      </div>

      {!loading && notifications.length > 0 && (
        <div className="dashboard-card" style={{ marginBottom: "16px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "12px",
              flexWrap: "wrap"
            }}
          >
            <p className="dashboard-subtitle" style={{ margin: 0 }}>
              Unread notifications: <strong>{unreadCount}</strong>
            </p>

            <button
              className="btn-primary"
              onClick={handleMarkAllAsRead}
              disabled={markingAll || unreadCount === 0}
            >
              {markingAll ? "Updating..." : "Mark All as Read"}
            </button>
          </div>
        </div>
      )}

      {loading && (
        <div className="dashboard-card">
          <p className="dashboard-subtitle">Loading notifications...</p>
        </div>
      )}

      {!loading && message && <div className="auth-message">{message}</div>}

      {!loading && !message && notifications.length === 0 && (
        <div className="dashboard-card">
          <p className="dashboard-subtitle">No notifications available.</p>
        </div>
      )}

      {!loading && !message && notifications.length > 0 && (
        <div className="doctor-notification-stack">
          {notifications.map((item) => (
            <div key={item.id} className="doctor-notification-card">
              <div className="doctor-notification-top">
                <div>
                  <p className="doctor-appointment-label">Notification</p>
                  <h3 className="doctor-appointment-title">
                    {item.title || "Untitled Notification"}
                  </h3>
                </div>

                <span
                  className={
                    item.isRead ? "status status-completed" : "status status-pending"
                  }
                >
                  {item.isRead ? "Read" : "Unread"}
                </span>
              </div>

              <p className="doctor-notification-text">
                {item.message || "No message content available."}
              </p>

              <div
                className="doctor-notification-footer"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "12px",
                  flexWrap: "wrap"
                }}
              >
                <small className="notification-date">
                  {item.createdAt
                    ? new Date(item.createdAt).toLocaleString()
                    : "Date unavailable"}
                </small>

                {!item.isRead && (
                  <button
                    className="btn-secondary"
                    onClick={() => handleMarkAsRead(item.id)}
                    disabled={markingId === item.id}
                  >
                    {markingId === item.id ? "Updating..." : "Mark as Read"}
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

export default DoctorNotifications;