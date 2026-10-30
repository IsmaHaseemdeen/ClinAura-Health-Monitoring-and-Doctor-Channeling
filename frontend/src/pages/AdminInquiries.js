import { useEffect, useState } from "react";
import {
  getAllInquiries,
  replyToInquiry
} from "../services/inquiryService";
import "../App.css";
import './Admin.css';

function AdminInquiries() {
  const [inquiries, setInquiries] = useState([]);
  const [replyMap, setReplyMap] = useState({});
  const [message, setMessage] = useState("");

  const loadInquiries = async () => {
    try {
      const res = await getAllInquiries();
      setInquiries(res.data || []);
    } catch (err) {
      console.error(err);
      setMessage("Failed to load inquiries.");
    }
  };

  useEffect(() => {
    loadInquiries();
  }, []);

  const handleReply = async (id) => {
    try {
      await replyToInquiry(id, {
        reply: replyMap[id] || ""
      });

      setMessage("Reply sent.");
      loadInquiries();
    } catch (err) {
      console.error(err);
      setMessage("Failed to send reply.");
    }
  };

  return (
    <div className="doctor-page-stack">
      <h2>Admin Inquiries</h2>

      {message && <p className="auth-message">{message}</p>}

      {inquiries.map((item) => (
        <div key={item.id} className="doctor-appointment-card">
          <h3>{item.userName}</h3>
          <p><strong>Subject:</strong> {item.subject}</p>
          <p>{item.message}</p>

          <p><strong>Status:</strong> {item.status}</p>

          {item.reply ? (
            <div>
              <strong>Reply:</strong>
              <p>{item.reply}</p>
            </div>
          ) : (
            <>
              <textarea
                placeholder="Write reply..."
                value={replyMap[item.id] || ""}
                onChange={(e) =>
                  setReplyMap({
                    ...replyMap,
                    [item.id]: e.target.value
                  })
                }
              />

              <button
                className="btn-primary"
                onClick={() => handleReply(item.id)}
              >
                Send Reply
              </button>
            </>
          )}
        </div>
      ))}
    </div>
  );
}

export default AdminInquiries;