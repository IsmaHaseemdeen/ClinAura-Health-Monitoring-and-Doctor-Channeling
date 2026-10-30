import { useEffect, useState } from "react";
import axios from "axios";
import "./Patient.css";

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setMessage("");

      const token = localStorage.getItem("token");

      const response = await axios.get("http://localhost:5284/api/notifications", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setNotifications(response.data || []);
    } catch (error) {
      console.error(error);
      setMessage("Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem("token");

      await axios.put(
        `http://localhost:5284/api/notifications/${id}/read`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setNotifications((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, isRead: true } : item
        )
      );
    } catch (error) {
      console.error(error);
      setMessage("Failed to mark notification as read.");
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem("token");

      await axios.put(
        "http://localhost:5284/api/notifications/read-all",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setNotifications((prev) =>
        prev.map((item) => ({ ...item, isRead: true }))
      );
    } catch (error) {
      console.error(error);
      setMessage("Failed to mark all notifications as read.");
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="dashboard-card">
      <div
        className="profile-page-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "12px",
          flexWrap: "wrap"
        }}
      >
        <div>
          <span className="page-eyebrow">Patient Alerts</span>
          <h2 className="page-title">Notifications</h2>
          <p className="page-subtitle">
            View your upcoming appointment and payment-related notifications.
          </p>
        </div>

        <button className="btn-primary" onClick={markAllAsRead}>
          Mark All as Read
        </button>
      </div>

      {message && <div className="auth-message">{message}</div>}

      <div className="booking-status-note" style={{ marginBottom: "20px" }}>
        <strong>Unread Notifications:</strong> {unreadCount}
      </div>

      {loading ? (
        <p className="dashboard-subtitle">Loading notifications...</p>
      ) : notifications.length === 0 ? (
        <p className="dashboard-subtitle">No notifications available.</p>
      ) : (
        <div style={{ display: "grid", gap: "14px" }}>
          {notifications.map((n) => (
            <div
              key={n.id}
              className="profile-info-card"
              style={{
                borderLeft: n.isRead ? "4px solid #cbd5e1" : "4px solid #dc2626",
                background: n.isRead ? "#ffffff" : "#fff7f7"
              }}
            >
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
                  <p className="profile-label">{n.isRead ? "Read" : "Unread"}</p>
                  <h3 className="profile-value" style={{ marginBottom: "8px" }}>
                    {n.title}
                  </h3>
                  <p style={{ margin: 0 }}>{n.message}</p>
                  <small style={{ display: "block", marginTop: "10px", color: "#64748b" }}>
                    {new Date(n.createdAt).toLocaleString()}
                  </small>
                </div>

                {!n.isRead && (
                  <button
                    className="btn-secondary"
                    onClick={() => markAsRead(n.id)}
                  >
                    Mark as Read
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

export default Notifications;