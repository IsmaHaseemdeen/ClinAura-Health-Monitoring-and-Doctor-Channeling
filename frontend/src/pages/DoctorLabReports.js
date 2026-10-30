import { useEffect, useMemo, useState } from "react";
import {
  getDoctorPatientHealthRecords,
  getDoctorDocumentViewUrl
} from "../services/doctorService";
import "../App.css";
import './Doctor.css';

function DoctorLabReports() {
  const [records, setRecords] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRecord, setSelectedRecord] = useState(null);

  /* =========================================================
     LOAD PATIENT HEALTH RECORDS
     Retrieves all document records currently visible to the
     logged-in doctor under the appointment access rules.
  ========================================================= */
  useEffect(() => {
    const fetchRecords = async () => {
      try {
        setLoading(true);
        setMessage("");

        const res = await getDoctorPatientHealthRecords();
        const data = res.data || [];

        setRecords(data);

        if (data.length > 0) {
          setSelectedRecord(data[0]);
        } else {
          setSelectedRecord(null);
        }
      } catch (err) {
        console.error(err);

        const serverMessage =
          typeof err.response?.data === "string"
            ? err.response.data
            : err.response?.data?.message;

        setMessage(serverMessage || "Failed to load patient health records.");
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, []);

  /* =========================================================
     SEARCH FILTER
     Filters records by patient name, file name, category,
     or appointment ID for easier review by the doctor.
  ========================================================= */
  const filteredRecords = useMemo(() => {
    const value = searchTerm.trim().toLowerCase();

    if (!value) return records;

    return records.filter((record) => {
      return (
        String(record.patientName || "").toLowerCase().includes(value) ||
        String(record.fileName || "").toLowerCase().includes(value) ||
        String(record.documentCategory || "").toLowerCase().includes(value) ||
        String(record.appointmentId || "").toLowerCase().includes(value)
      );
    });
  }, [records, searchTerm]);

  /* =========================================================
     HANDLE RECORD SELECTION
     Loads the chosen document into the preview panel.
  ========================================================= */
  const handleSelectRecord = (record) => {
    setSelectedRecord(record);
  };

  return (
    <div className="doctor-page-stack">
      <div className="doctor-page-header-card">
        <p className="doctor-page-eyebrow">Health Records Module</p>
        <h2 className="doctor-page-title">Patient Health Records</h2>
        <p className="doctor-page-subtitle">
          Search and review patient documents that are accessible during active,
          confirmed appointment periods only.
        </p>
      </div>

      <div className="upload-card" style={{ marginBottom: "20px" }}>
        <h3 className="upload-section-title">Search Records</h3>
        <input
          type="text"
          placeholder="Search by patient name, file name, category, or appointment ID"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading && (
        <div className="dashboard-card">
          <p className="dashboard-subtitle">Loading patient health records...</p>
        </div>
      )}

      {!loading && message && <div className="auth-message">{message}</div>}

      {!loading && !message && filteredRecords.length === 0 && (
        <div className="dashboard-card">
          <p className="dashboard-subtitle">No accessible health records found.</p>
        </div>
      )}

      {!loading && !message && filteredRecords.length > 0 && (
        <div className="upload-layout">
          <div className="upload-main-column">
            <div className="doctor-lab-report-grid">
              {filteredRecords.map((record) => (
                <div
                  key={record.id}
                  className="doctor-lab-report-card"
                >
                  <div className="doctor-appointment-top">
                    <div>
                      <p className="doctor-appointment-label">Patient</p>
                      <h3 className="doctor-appointment-title">
                        {record.patientName || "Unknown Patient"}
                      </h3>
                    </div>

                    <span className="status status-confirmed">
                      {record.documentCategory || "Health Record"}
                    </span>
                  </div>

                  <div className="doctor-appointment-details">
                    <div className="doctor-detail-box">
                      <p className="doctor-detail-label">Appointment ID</p>
                      <h4 className="doctor-detail-value">
                        {record.appointmentId || "-"}
                      </h4>
                    </div>

                    <div className="doctor-detail-box">
                      <p className="doctor-detail-label">Document Name</p>
                      <h4 className="doctor-detail-value">
                        {record.fileName || "-"}
                      </h4>
                    </div>

                    <div className="doctor-detail-box">
                      <p className="doctor-detail-label">Document Date</p>
                      <h4 className="doctor-detail-value">
                        {record.documentDate
                          ? new Date(record.documentDate).toLocaleDateString()
                          : "-"}
                      </h4>
                    </div>

                    <div className="doctor-detail-box">
                      <p className="doctor-detail-label">Uploaded On</p>
                      <h4 className="doctor-detail-value">
                        {record.uploadedAt
                          ? new Date(record.uploadedAt).toLocaleDateString()
                          : "-"}
                      </h4>
                    </div>
                  </div>

                  <div className="doctor-lab-report-extra">
                    <div className="doctor-detail-box">
                      <p className="doctor-detail-label">Notes</p>
                      <h4 className="doctor-detail-value">
                        {record.notes || "-"}
                      </h4>
                    </div>
                  </div>

                  {record.accessNote && (
                    <div className="doctor-lab-report-extra">
                      <div className="doctor-detail-box">
                        <p className="doctor-detail-label">Access Note</p>
                        <h4 className="doctor-detail-value">{record.accessNote}</h4>
                      </div>
                    </div>
                  )}

                  <div
                    className="doctor-appointment-actions"
                    style={{ marginTop: "12px" }}
                  >
                    <button
                      className="btn-primary"
                      onClick={() => handleSelectRecord(record)}
                    >
                      View Report
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="upload-side-column">
            <div className="upload-card">
              <h3 className="upload-section-title">Report Preview</h3>

              {!selectedRecord ? (
                <p className="dashboard-subtitle">
                  Select a report from the list to preview it.
                </p>
              ) : (
                <div>
                  <p><strong>Patient:</strong> {selectedRecord.patientName || "-"}</p>
                  <p><strong>Appointment ID:</strong> {selectedRecord.appointmentId || "-"}</p>
                  <p><strong>File Name:</strong> {selectedRecord.fileName || "-"}</p>
                  <p><strong>Category:</strong> {selectedRecord.documentCategory || "-"}</p>
                  <p>
                    <strong>Document Date:</strong>{" "}
                    {selectedRecord.documentDate
                      ? new Date(selectedRecord.documentDate).toLocaleDateString()
                      : "-"}
                  </p>
                  <p><strong>Notes:</strong> {selectedRecord.notes || "-"}</p>

                  <div style={{ marginTop: "14px" }}>
                    {selectedRecord.contentType === "application/pdf" ? (
                      <iframe
                        title="Doctor Document Preview"
                        src={getDoctorDocumentViewUrl(selectedRecord.id)}
                        width="100%"
                        height="500"
                        style={{ border: "1px solid #ddd", borderRadius: "10px" }}
                      />
                    ) : (
                      <img
                        src={getDoctorDocumentViewUrl(selectedRecord.id)}
                        alt={selectedRecord.fileName}
                        style={{
                          width: "100%",
                          maxHeight: "500px",
                          objectFit: "contain",
                          border: "1px solid #ddd",
                          borderRadius: "10px"
                        }}
                      />
                    )}
                  </div>

                  <div style={{ marginTop: "12px" }}>
                    <a
                      href={getDoctorDocumentViewUrl(selectedRecord.id)}
                      target="_blank"
                      rel="noreferrer"
                      className="booking-link"
                    >
                      Open Full Report
                    </a>
                  </div>
                </div>
              )}
            </div>

            <div className="upload-card">
              <h3 className="upload-section-title">Access Guidance</h3>
              <ul className="upload-help-list">
                <li>Records are visible only during valid confirmed appointments</li>
                <li>Access is limited to the assigned doctor</li>
                <li>Completed appointments no longer allow record viewing</li>
                <li>Use the search bar to filter records quickly by patient or appointment</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DoctorLabReports;