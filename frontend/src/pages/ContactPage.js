import { useEffect, useState } from "react";
import {
  createInquiry,
  getMyInquiries
} from "../services/inquiryService";
import "../App.css";
import './ContactPage.css';

function ContactPage() {
  const [form, setForm] = useState({
    subject: "",
    message: ""
  });

  const [inquiries, setInquiries] = useState([]);
  const [message, setMessage] = useState("");

  /* =========================
     LOAD MY INQUIRIES
  ========================= */
  const loadInquiries = async () => {
    try {
      const res = await getMyInquiries();
      setInquiries(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadInquiries();
  }, []);

  /* =========================
     SUBMIT INQUIRY
  ========================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.subject || !form.message) {
      setMessage("Please fill all fields.");
      return;
    }

    try {
      await createInquiry(form);

      setMessage("Inquiry sent successfully.");
      setForm({ subject: "", message: "" });
      loadInquiries();
    } catch (err) {
      console.error(err);
      setMessage("Failed to send inquiry.");
    }
  };

  return (
    <div className="booking-page">
      <div className="booking-header-card">
        <h2>Contact Admin</h2>
        <p>Send inquiries and receive replies directly in the system.</p>
      </div>

      {/* FORM */}
      <div className="booking-form-card">
        <form onSubmit={handleSubmit}>
          <label>Subject</label>
          <input
            type="text"
            value={form.subject}
            onChange={(e) =>
              setForm({ ...form, subject: e.target.value })
            }
          />

          <label>Message</label>
          <textarea
            rows="4"
            value={form.message}
            onChange={(e) =>
              setForm({ ...form, message: e.target.value })
            }
          />

          <button className="btn-primary">Send Inquiry</button>
        </form>

        {message && <p className="auth-message">{message}</p>}
      </div>

      {/* INQUIRIES LIST */}
      <div style={{ marginTop: "30px" }}>
        <h3>My Inquiries</h3>

        {inquiries.length === 0 ? (
          <p>No inquiries yet.</p>
        ) : (
          inquiries.map((item) => (
            <div key={item.id} className="booking-status-card">
              <h4>{item.subject}</h4>
              <p>{item.message}</p>

              <p><strong>Status:</strong> {item.status}</p>

              {item.reply && (
                <div style={{ marginTop: "10px" }}>
                  <strong>Admin Reply:</strong>
                  <p>{item.reply}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ContactPage;