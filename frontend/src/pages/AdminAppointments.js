import { useEffect, useState } from "react";
import API from "../services/api";
import './Admin.css';

function AdminAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [message, setMessage] = useState("");

  /* Load all appointments when the page opens */
  const fetchAppointments = async () => {
    try {
      const response = await API.get("/admin/appointments");
      setAppointments(response.data);
    } catch (error) {
      console.error(error);
      setMessage("Failed to load appointments.");
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  /* Update an appointment status from the admin side */
  const handleUpdate = async (appointmentId, status) => {
    const reason = prompt("Enter verification reason:");
    const onlineMeetingLink =
      status === "Confirmed" ? prompt("Enter online meeting link (or leave blank):") : "";
    const physicalLocation =
      status === "Confirmed" ? prompt("Enter physical location (or leave blank):") : "";

    try {
      await API.put(`/admin/appointments/${appointmentId}`, {
        status,
        verificationReason: reason || "",
        onlineMeetingLink: onlineMeetingLink || "",
        physicalLocation: physicalLocation || ""
      });

      alert("Appointment updated successfully.");
      fetchAppointments();
    } catch (error) {
      console.error(error);
      alert("Failed to update appointment.");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Admin Appointment Management</h2>

      {message && <p>{message}</p>}

      {appointments.length === 0 ? (
        <p>No appointments found.</p>
      ) : (
        <table border="1" cellPadding="10" style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead>
            <tr>
              <th>Patient</th>
              <th>Doctor</th>
              <th>Date</th>
              <th>Time</th>
              <th>Mode</th>
              <th>Status</th>
              <th>Reason</th>
              <th>Receipt Path</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((item) => (
              <tr key={item.id}>
                <td>{item.patientName}</td>
                <td>{item.doctorName}</td>
                <td>{new Date(item.appointmentDate).toLocaleDateString()}</td>
                <td>{item.appointmentTime}</td>
                <td>{item.mode}</td>
                <td>{item.status}</td>
                <td>{item.verificationReason || "-"}</td>
                <td>{item.paymentReceiptPath || "-"}</td>
                <td>
                  <button
                    onClick={() => handleUpdate(item.id, "Confirmed")}
                    style={{ marginRight: "8px" }}
                  >
                    Confirm
                  </button>

                  <button onClick={() => handleUpdate(item.id, "Rejected")}>
                    Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AdminAppointments;