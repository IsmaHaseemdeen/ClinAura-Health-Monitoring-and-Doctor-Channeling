import { useEffect, useMemo, useState } from "react";
import {
  createAppointment,
  getDoctorsForBooking
} from "../services/appointmentService";
import "../App.css";
import "./Booking.css";

const BANK_ACCOUNTS = [
  {
    bankName: "Bank of Ceylon",
    accountName: "ClinAura Health Services",
    accountNumber: "1234567890",
    branch: "Colombo Main Branch"
  },
  {
    bankName: "Commercial Bank",
    accountName: "ClinAura Health Services",
    accountNumber: "9876543210",
    branch: "Maharagama Branch"
  },
  {
    bankName: "Sampath Bank",
    accountName: "ClinAura Health Services",
    accountNumber: "4561237890",
    branch: "Nugegoda Branch"
  }
];

function BookAppointment() {
  const [formData, setFormData] = useState({
    doctorProfileId: "",
    appointmentDate: "",
    mode: "",
    notes: "",

    // Store advance payment details collected during booking.
    advancePaymentMethod: "Card",
    advancePaymentAmount: "1000.00",

    // Store card payment fields.
    cardHolderName: "",
    cardNumber: "",
    cardExpiryMonth: "",
    cardExpiryYear: "",
    cardCvv: "",

    // Store online transfer details.
    transferBankName: "",
    transferReferenceNumber: "",
    transferReceiptBase64: "",
    transferReceiptFileName: ""
  });

  const [message, setMessage] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoadingDoctors(true);
        setMessage("");
        const response = await getDoctorsForBooking();
        setDoctors(response.data || []);
      } catch (error) {
        console.error(error);
        setMessage("Failed to load doctors.");
      } finally {
        setLoadingDoctors(false);
      }
    };

    fetchDoctors();
  }, []);

  /* Resolve the selected doctor details for booking guidance display */
  const selectedDoctor = useMemo(() => {
    return doctors.find((d) => String(d.id) === String(formData.doctorProfileId)) || null;
  }, [doctors, formData.doctorProfileId]);

  /* Update the booking form state whenever the user changes a field */
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "advancePaymentMethod"
        ? {
            cardHolderName: "",
            cardNumber: "",
            cardExpiryMonth: "",
            cardExpiryYear: "",
            cardCvv: "",
            transferBankName: "",
            transferReferenceNumber: "",
            transferReceiptBase64: "",
            transferReceiptFileName: ""
          }
        : {})
    }));
  };

  /* Convert uploaded receipt files into base64 for backend transfer */
  const handleReceiptUpload = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onloadend = () => {
      const result = reader.result || "";
      const base64 = String(result).split(",")[1] || "";

      setFormData((prev) => ({
        ...prev,
        transferReceiptBase64: base64,
        transferReceiptFileName: file.name
      }));
    };

    reader.readAsDataURL(file);
  };

  /* Validate advance payment fields before sending the booking request */
  const validatePaymentSection = () => {
    if (!formData.advancePaymentMethod) {
      return "Please select an advance payment method.";
    }

    if (!formData.advancePaymentAmount || Number(formData.advancePaymentAmount) <= 0) {
      return "Please enter a valid advance payment amount.";
    }

    if (formData.advancePaymentMethod === "Card") {
      if (
        !formData.cardHolderName.trim() ||
        !formData.cardNumber.trim() ||
        !formData.cardExpiryMonth.trim() ||
        !formData.cardExpiryYear.trim() ||
        !formData.cardCvv.trim()
      ) {
        return "Please complete all card payment fields.";
      }

      if (formData.cardNumber.replace(/\s/g, "").length < 12) {
        return "Please enter a valid card number.";
      }

      if (formData.cardCvv.trim().length < 3) {
        return "Please enter a valid CVV.";
      }
    }

    if (formData.advancePaymentMethod === "Online Transfer") {
      if (!formData.transferBankName.trim()) {
        return "Please select the bank account used for the transfer.";
      }

      if (!formData.transferReferenceNumber.trim()) {
        return "Please enter the transfer reference number.";
      }

      if (!formData.transferReceiptBase64) {
        return "Please upload the transfer receipt.";
      }
    }

    return "";
  };

  /* Submit the booking request to the backend after validation */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!formData.doctorProfileId || !formData.appointmentDate || !formData.mode) {
      setMessage("Please complete doctor, date, and consultation mode.");
      return;
    }

    const paymentValidationMessage = validatePaymentSection();
    if (paymentValidationMessage) {
      setMessage(paymentValidationMessage);
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await createAppointment({
        doctorProfileId: Number(formData.doctorProfileId),
        appointmentDate: formData.appointmentDate,
        appointmentTime: null,
        mode: formData.mode,
        autoAssign: true,
        notes: formData.notes,

        advancePaymentMethod: formData.advancePaymentMethod,
        advancePaymentAmount: Number(formData.advancePaymentAmount),

        cardHolderName: formData.advancePaymentMethod === "Card" ? formData.cardHolderName : null,
        cardNumber: formData.advancePaymentMethod === "Card" ? formData.cardNumber : null,
        cardExpiryMonth: formData.advancePaymentMethod === "Card" ? formData.cardExpiryMonth : null,
        cardExpiryYear: formData.advancePaymentMethod === "Card" ? formData.cardExpiryYear : null,
        cardCvv: formData.advancePaymentMethod === "Card" ? formData.cardCvv : null,

        transferBankName:
          formData.advancePaymentMethod === "Online Transfer"
            ? formData.transferBankName
            : null,
        transferReferenceNumber:
          formData.advancePaymentMethod === "Online Transfer"
            ? formData.transferReferenceNumber
            : null,
        transferReceiptBase64:
          formData.advancePaymentMethod === "Online Transfer"
            ? formData.transferReceiptBase64
            : null,
        transferReceiptFileName:
          formData.advancePaymentMethod === "Online Transfer"
            ? formData.transferReceiptFileName
            : null
      });

      const bookedDate = response.data?.appointmentDate
        ? new Date(response.data.appointmentDate).toLocaleDateString()
        : formData.appointmentDate;

      const bookedTime = response.data?.appointmentTime || "-";

      setMessage(
        `Appointment booked successfully. The system auto-assigned your consultation for ${bookedDate} at ${bookedTime}. Advance payment completed successfully.`
      );

      setFormData({
        doctorProfileId: "",
        appointmentDate: "",
        mode: "",
        notes: "",
        advancePaymentMethod: "Card",
        advancePaymentAmount: "1000.00",
        cardHolderName: "",
        cardNumber: "",
        cardExpiryMonth: "",
        cardExpiryYear: "",
        cardCvv: "",
        transferBankName: "",
        transferReferenceNumber: "",
        transferReceiptBase64: "",
        transferReceiptFileName: ""
      });
    } catch (error) {
      console.error(error);

      const serverMessage =
        typeof error.response?.data === "string"
          ? error.response.data
          : error.response?.data?.message;

      setMessage(serverMessage || "Failed to submit appointment request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="booking-page">
      <div className="booking-header-card">
        <p className="booking-eyebrow">Appointment Module</p>
        <h2 className="booking-title">Book a Doctor Appointment</h2>
        <p className="booking-subtitle">
          Choose a doctor, date, and consultation mode. The system will automatically
          assign the earliest available slot based on the doctor’s queue and daily slot limits.
          An advance payment is required to confirm the booking.
        </p>
      </div>

      <div className="booking-layout">
        <div className="booking-form-card">
          <form onSubmit={handleSubmit} className="form-grid two-col">
            <div className="full-width">
              <label>Select Doctor</label>
              <select
                name="doctorProfileId"
                value={formData.doctorProfileId}
                onChange={handleChange}
                disabled={loadingDoctors}
              >
                <option value="">
                  {loadingDoctors ? "Loading doctors..." : "Choose a doctor"}
                </option>

                {doctors.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.fullName} - {doctor.specialization}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label>Preferred Starting Date</label>
              <input
                type="date"
                name="appointmentDate"
                value={formData.appointmentDate}
                onChange={handleChange}
              />
            </div>

            <div>
              <label>Consultation Mode</label>
              <select
                name="mode"
                value={formData.mode}
                onChange={handleChange}
              >
                <option value="">Select mode</option>
                <option value="Online">Online</option>
                <option value="Physical">Physical</option>
              </select>
            </div>

            <div className="full-width">
              <div className="booking-status-note">
                <strong>Auto Assignment Only</strong>
                <p style={{ marginTop: "10px" }}>
                  Patients cannot manually choose a time slot. The system automatically assigns
                  the earliest available slot for the selected doctor and mode.
                </p>
              </div>
            </div>

            <div className="full-width">
              <label>Additional Notes</label>
              <textarea
                rows="4"
                name="notes"
                placeholder="Add appointment-related notes if needed"
                value={formData.notes}
                onChange={handleChange}
              />
            </div>

            <div className="full-width">
              <div className="booking-status-note">
                <strong>Advance Payment</strong>
                <p style={{ marginTop: "10px" }}>
                  A fixed advance payment is required to confirm your booking.
                </p>
              </div>
            </div>

            <div>
              <label>Advance Payment Amount</label>
              <input
                type="number"
                min="0"
                step="0.01"
                name="advancePaymentAmount"
                value={formData.advancePaymentAmount}
                onChange={handleChange}
              />
            </div>

            <div>
              <label>Payment Method</label>
              <select
                name="advancePaymentMethod"
                value={formData.advancePaymentMethod}
                onChange={handleChange}
              >
                <option value="Card">Card</option>
                <option value="Online Transfer">Online Transfer</option>
              </select>
            </div>

            {formData.advancePaymentMethod === "Card" && (
              <>
                <div className="full-width">
                  <label>Card Holder Name</label>
                  <input
                    type="text"
                    name="cardHolderName"
                    value={formData.cardHolderName}
                    onChange={handleChange}
                    placeholder="Enter card holder name"
                  />
                </div>

                <div className="full-width">
                  <label>Card Number</label>
                  <input
                    type="text"
                    name="cardNumber"
                    value={formData.cardNumber}
                    onChange={handleChange}
                    placeholder="Enter card number"
                  />
                </div>

                <div>
                  <label>Expiry Month</label>
                  <input
                    type="text"
                    name="cardExpiryMonth"
                    value={formData.cardExpiryMonth}
                    onChange={handleChange}
                    placeholder="MM"
                  />
                </div>

                <div>
                  <label>Expiry Year</label>
                  <input
                    type="text"
                    name="cardExpiryYear"
                    value={formData.cardExpiryYear}
                    onChange={handleChange}
                    placeholder="YYYY"
                  />
                </div>

                <div className="full-width">
                  <label>CVV</label>
                  <input
                    type="password"
                    name="cardCvv"
                    value={formData.cardCvv}
                    onChange={handleChange}
                    placeholder="Enter CVV"
                  />
                </div>
              </>
            )}

            {formData.advancePaymentMethod === "Online Transfer" && (
              <>
                <div className="full-width">
                  <label>Available Bank Accounts</label>
                  <div className="booking-help-list" style={{ paddingLeft: "0", listStyle: "none" }}>
                    {BANK_ACCOUNTS.map((bank, index) => (
                      <div
                        key={index}
                        className="booking-status-note"
                        style={{ marginBottom: "12px" }}
                      >
                        <strong>{bank.bankName}</strong>
                        <p style={{ marginTop: "8px" }}>Account Name: {bank.accountName}</p>
                        <p>Account Number: {bank.accountNumber}</p>
                        <p>Branch: {bank.branch}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label>Select Transferred Bank</label>
                  <select
                    name="transferBankName"
                    value={formData.transferBankName}
                    onChange={handleChange}
                  >
                    <option value="">Select bank</option>
                    {BANK_ACCOUNTS.map((bank) => (
                      <option key={bank.bankName} value={bank.bankName}>
                        {bank.bankName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label>Transfer Reference Number</label>
                  <input
                    type="text"
                    name="transferReferenceNumber"
                    value={formData.transferReferenceNumber}
                    onChange={handleChange}
                    placeholder="Enter transfer reference"
                  />
                </div>

                <div className="full-width">
                  <label>Upload Receipt</label>
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={handleReceiptUpload}
                  />
                  {formData.transferReceiptFileName && (
                    <p className="dashboard-subtitle" style={{ marginTop: "8px" }}>
                      Uploaded: {formData.transferReceiptFileName}
                    </p>
                  )}
                </div>
              </>
            )}

            {message && (
              <div
                className={`full-width ${
                  message.toLowerCase().includes("successfully")
                    ? "booking-success"
                    : "auth-message"
                }`}
              >
                {message}
              </div>
            )}

            <div className="full-width booking-actions">
              <button type="submit" className="btn-danger" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Book Now"}
              </button>
            </div>
          </form>
        </div>

        <div className="booking-side-card">
          <h3>Booking Guidance</h3>
          <ul className="booking-help-list">
            <li>Only one patient can be assigned to one slot</li>
            <li>Patients cannot manually choose slots; the system auto-assigns only</li>
            <li>If a patient cancels, that slot becomes available again for the next booking</li>
            <li>If cancellation is attempted after 12 hours, the booking will not be cancelled</li>
            <li>Doctors are assigned only up to their configured daily slot limit</li>
            <li>If a day is full, the system automatically assigns the next available doctor day</li>
            <li>An advance payment is required during booking</li>
            <li>For online appointments, the system generates the meeting link automatically</li>
            <li>For physical appointments, the system uses the doctor’s saved location automatically</li>
          </ul>

          {selectedDoctor && (
            <div className="booking-status-note" style={{ marginTop: "20px" }}>
              <strong>Selected Doctor Details</strong>
              <p style={{ marginTop: "10px" }}>
                {selectedDoctor.fullName} - {selectedDoctor.specialization}
              </p>
              <p style={{ marginTop: "10px" }}>
                Available Days: {selectedDoctor.availableDays || "-"}
              </p>
              <p style={{ marginTop: "10px" }}>
                Online Time: {selectedDoctor.onlineConsultationTime || "-"}
              </p>
              <p style={{ marginTop: "10px" }}>
                Physical Time: {selectedDoctor.physicalConsultationTime || "-"}
              </p>
              <p style={{ marginTop: "10px" }}>
                Location: {selectedDoctor.location || selectedDoctor.Location || "-"}
              </p>
              <p style={{ marginTop: "10px" }}>
                Online Slots Per Day: {selectedDoctor.onlineSlotsPerDay ?? "-"}
              </p>
              <p style={{ marginTop: "10px" }}>
                Physical Slots Per Day: {selectedDoctor.physicalSlotsPerDay ?? "-"}
              </p>
            </div>
          )}

          <div className="booking-status-note" style={{ marginTop: "20px" }}>
            <strong>Status Flow</strong>
            <p>Advance Paid → Pending Consultation → Completed → Payment Pending → Successful</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookAppointment;