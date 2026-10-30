import { useEffect, useState } from "react";
import API from "../services/api";
import { uploadReport } from "../services/documentService";
import "../App.css";
import './Upload.css';

function UploadReport({ onLogout }) {
  /* =========================================================
     DOCUMENT FORM STATE
     Stores the selected file and its related metadata.
  ========================================================= */
  const [file, setFile] = useState(null);
  const [documentCategory, setDocumentCategory] = useState("Medical Report");
  const [documentDate, setDocumentDate] = useState("");
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState("");

  /* =========================================================
     NOTIFICATION STATE
     Loads patient notifications related to uploads and booking.
  ========================================================= */
  const [notifications, setNotifications] = useState([]);
  const [notificationMessage, setNotificationMessage] = useState("");

  /* =========================================================
     LOAD NOTIFICATIONS
  ========================================================= */
  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await API.get("/notifications");
      setNotifications(response.data || []);
    } catch (error) {
      console.error(error);
      setNotificationMessage("Failed to load notifications.");
    }
  };

  /* =========================================================
     LOGOUT HANDLER
     Clears the session using the shared app logout flow.
  ========================================================= */
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    onLogout();
  };

  /* =========================================================
     SUBMIT DOCUMENT
     Uploads the selected health document with basic details.
  ========================================================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      if (!file) {
        setMessage("Please choose a document to upload.");
        return;
      }

      if (!documentDate) {
        setMessage("Please select the document date.");
        return;
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("documentCategory", documentCategory);
      formData.append("documentDate", documentDate);
      formData.append("notes", notes);

      const response = await uploadReport(formData);

      setMessage(response.data?.message || "Document uploaded successfully.");

      /* =====================================================
         RESET FORM AFTER SUCCESS
      ===================================================== */
      setFile(null);
      setDocumentCategory("Medical Report");
      setDocumentDate("");
      setNotes("");

      const fileInput = document.getElementById("healthDocumentFile");
      if (fileInput) {
        fileInput.value = "";
      }

      fetchNotifications();
    } catch (error) {
      console.error(error);

      const serverMessage =
        typeof error.response?.data === "string"
          ? error.response.data
          : error.response?.data?.message;

      setMessage(serverMessage || "Upload failed.");
    }
  };

  return (
    <div className="upload-page">
      <div className="upload-header-card">
        <div>
          <p className="upload-eyebrow">Patient Records Module</p>
          <h2 className="upload-title">Upload Health Document</h2>
          <p className="upload-subtitle">
            Upload and store your medical documents securely so they can be used
            during your care journey when needed.
          </p>
        </div>

        <button className="btn-danger" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <div className="upload-layout">
        <div className="upload-main-column">
          <div className="upload-card">
            <h3 className="upload-section-title">Document Upload</h3>

            <form onSubmit={handleSubmit} className="form-grid">
              <div className="form-grid two-col">
                <div>
                  <label>Document Category</label>
                  <select
                    value={documentCategory}
                    onChange={(e) => setDocumentCategory(e.target.value)}
                  >
                    <option value="Medical Report">Medical Report</option>
                    <option value="Prescription">Prescription</option>
                    <option value="Medical Note">Medical Note</option>
                    <option value="Scan Report">Scan Report</option>
                    <option value="Discharge Summary">Discharge Summary</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label>Document Date</label>
                  <input
                    type="date"
                    value={documentDate}
                    onChange={(e) => setDocumentDate(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label>Upload File</label>
                <input
                  id="healthDocumentFile"
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={(e) => setFile(e.target.files[0])}
                />
              </div>

              <div>
                <label>Notes</label>
                <textarea
                  rows="4"
                  placeholder="Add any notes related to this document"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <div className="upload-message-wrap">
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
              </div>

              <div>
                <button type="submit" className="btn-primary">
                  Upload Document
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="upload-side-column">
          <div className="upload-card">
            <h3 className="upload-section-title">Notifications</h3>

            {notificationMessage && (
              <div className="auth-message">{notificationMessage}</div>
            )}

            {notifications.length === 0 ? (
              <p className="dashboard-subtitle">No notifications available.</p>
            ) : (
              <div className="notification-stack">
                {notifications.map((notification) => (
                  <div key={notification.id} className="notification-card">
                    <strong className="notification-title">
                      {notification.title}
                    </strong>
                    <p className="notification-text">{notification.message}</p>
                    <small className="notification-date">
                      {new Date(notification.createdAt).toLocaleString()}
                    </small>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="upload-card">
            <h3 className="upload-section-title">Helpful Guidance</h3>
            <ul className="upload-help-list">
              <li>Upload files in PDF, PNG, JPG, or JPEG format</li>
              <li>Choose the correct document date for better record history</li>
              <li>Add clear notes if the document needs extra explanation</li>
              <li>Your uploaded records are stored securely for your care journey</li>
              <li>Doctors can view records only during valid appointment access periods</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UploadReport;