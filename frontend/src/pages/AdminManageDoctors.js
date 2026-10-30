import { useEffect, useMemo, useState } from "react";
import { getAllDoctors } from "../services/adminService";
import "../App.css";
import './Admin.css';

function AdminManageDoctors() {
  /* =========================================================
     STATE
     - doctors: full doctor list from backend
     - searchTerm: used to filter doctors on the page
     - message/loading: standard UI status handling
  ========================================================= */
  const [doctors, setDoctors] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  /* =========================================================
     LOAD ALL DOCTORS
     Admin uses this page to review registered doctors in a
     tabular format with quick search support.
  ========================================================= */
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        setMessage("");

        const res = await getAllDoctors();
        setDoctors(res.data || []);
      } catch (err) {
        console.error(err);

        const serverMessage =
          typeof err.response?.data === "string"
            ? err.response.data
            : err.response?.data?.message;

        setMessage(serverMessage || "Failed to load doctors.");
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  /* =========================================================
     SEARCH FILTER
     Filters doctors by common admin search fields.
  ========================================================= */
  const filteredDoctors = useMemo(() => {
    const value = searchTerm.trim().toLowerCase();

    if (!value) return doctors;

    return doctors.filter((doctor) => {
      const fullName = String(doctor.fullName || "").toLowerCase();
      const email = String(doctor.email || "").toLowerCase();
      const specialization = String(doctor.specialization || "").toLowerCase();
      const phoneNumber = String(doctor.phoneNumber || "").toLowerCase();
      const availableDays = String(doctor.availableDays || "").toLowerCase();

      return (
        fullName.includes(value) ||
        email.includes(value) ||
        specialization.includes(value) ||
        phoneNumber.includes(value) ||
        availableDays.includes(value)
      );
    });
  }, [doctors, searchTerm]);

  return (
    <div className="doctor-page-stack">
      <div className="doctor-page-header-card">
        <p className="doctor-page-eyebrow">Doctor Management Module</p>
        <h2 className="doctor-page-title">Manage Doctors</h2>
        <p className="doctor-page-subtitle">
          View registered doctors in a structured table and quickly search by doctor name,
          email, specialization, phone number, or available days.
        </p>
      </div>

      {/* =====================================================
         SEARCH BAR
      ===================================================== */}
      <div className="dashboard-card" style={{ marginBottom: "16px" }}>
        <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>
          Search Doctors
        </label>
        <input
          type="text"
          placeholder="Search by name, specialization, email, phone, or available days"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading && (
        <div className="dashboard-card">
          <p className="dashboard-subtitle">Loading doctors...</p>
        </div>
      )}

      {!loading && message && <div className="auth-message">{message}</div>}

      {!loading && !message && filteredDoctors.length === 0 && (
        <div className="dashboard-card">
          <p className="dashboard-subtitle">No doctors found.</p>
        </div>
      )}

      {/* =====================================================
         TABULAR DOCTOR VIEW
         This format is cleaner for admin review than cards.
      ===================================================== */}
      {!loading && !message && filteredDoctors.length > 0 && (
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
                <th style={tableHeaderStyle}>Doctor Name</th>
                <th style={tableHeaderStyle}>Specialization</th>
                <th style={tableHeaderStyle}>Email</th>
                <th style={tableHeaderStyle}>Phone</th>
                <th style={tableHeaderStyle}>Available Days</th>
                <th style={tableHeaderStyle}>Daily Capacity</th>
                <th style={tableHeaderStyle}>Online Slots</th>
                <th style={tableHeaderStyle}>Physical Slots</th>
                <th style={tableHeaderStyle}>Location</th>
                <th style={tableHeaderStyle}>Status</th>
              </tr>
            </thead>

            <tbody>
              {filteredDoctors.map((doctor) => (
                <tr key={doctor.id || doctor.email}>
                  <td style={tableCellStyle}>{doctor.fullName || "-"}</td>
                  <td style={tableCellStyle}>{doctor.specialization || "-"}</td>
                  <td style={tableCellStyle}>{doctor.email || "-"}</td>
                  <td style={tableCellStyle}>{doctor.phoneNumber || "-"}</td>
                  <td style={tableCellStyle}>{doctor.availableDays || "-"}</td>
                  <td style={tableCellStyle}>{doctor.dailyCapacity ?? "-"}</td>
                  <td style={tableCellStyle}>{doctor.onlineSlotsPerDay ?? "-"}</td>
                  <td style={tableCellStyle}>{doctor.physicalSlotsPerDay ?? "-"}</td>
                  <td style={tableCellStyle}>{doctor.location || doctor.physicalLocation || "-"}</td>
                  <td style={tableCellStyle}>
                    <span className={doctor.isActive ? "status status-confirmed" : "status status-rejected"}>
                      {doctor.isActive ? "Active" : "Inactive"}
                    </span>
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

/* =========================================================
   SIMPLE INLINE TABLE STYLES
   Kept inside file for easy copy-paste and viva explanation.
========================================================= */
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

export default AdminManageDoctors;