import "../App.css";
import './Doctor.css';

function DoctorProfile({
  doctorProfile,
  isEditingDoctorProfile,
  setIsEditingDoctorProfile,
  handleDoctorProfileChange,
  handleDoctorProfileSave,
  handleDoctorProfileCancel
}) {
  return (
    <div className="profile-page-card">
      <div className="profile-page-header">
        <div>
          <h2 className="dashboard-main-card-title">Doctor Profile</h2>
          <p className="dashboard-main-card-subtitle">
            View your doctor account details and update your consultation availability.
          </p>
        </div>

        {!isEditingDoctorProfile ? (
          <button
            className="btn-green"
            onClick={() => setIsEditingDoctorProfile(true)}
          >
            Update Availability
          </button>
        ) : (
          <div className="profile-header-actions">
            <button className="btn-primary" onClick={handleDoctorProfileSave}>
              Save Changes
            </button>
            <button className="btn-secondary" onClick={handleDoctorProfileCancel}>
              Cancel
            </button>
          </div>
        )}
      </div>

      {!isEditingDoctorProfile ? (
        <div className="profile-grid">
          <div className="profile-info-card">
            <p className="profile-label">Full Name</p>
            <h3 className="profile-value">{doctorProfile.fullName || "Not added"}</h3>
          </div>

          <div className="profile-info-card">
            <p className="profile-label">Specialization</p>
            <h3 className="profile-value">{doctorProfile.specialization || "Not added"}</h3>
          </div>

          <div className="profile-info-card">
            <p className="profile-label">Email Address</p>
            <h3 className="profile-value">{doctorProfile.email || "Not added"}</h3>
          </div>

          <div className="profile-info-card">
            <p className="profile-label">Phone Number</p>
            <h3 className="profile-value">{doctorProfile.phoneNumber || "Not added"}</h3>
          </div>

          <div className="profile-info-card">
            <p className="profile-label">License Number</p>
            <h3 className="profile-value">{doctorProfile.licenseNumber || "Not added"}</h3>
          </div>

          <div className="profile-info-card">
            <p className="profile-label">Qualification</p>
            <h3 className="profile-value">{doctorProfile.qualification || "Not added"}</h3>
          </div>

          <div className="profile-info-card">
            <p className="profile-label">Available Days</p>
            <h3 className="profile-value">{doctorProfile.availableDays || "Not added"}</h3>
          </div>

          <div className="profile-info-card">
            <p className="profile-label">Daily Capacity</p>
            <h3 className="profile-value">{doctorProfile.dailyCapacity || "Not added"}</h3>
          </div>

          <div className="profile-info-card">
            <p className="profile-label">Online Slots Per Day</p>
            <h3 className="profile-value">{doctorProfile.onlineSlotsPerDay || "Not added"}</h3>
          </div>

          <div className="profile-info-card">
            <p className="profile-label">Physical Slots Per Day</p>
            <h3 className="profile-value">{doctorProfile.physicalSlotsPerDay || "Not added"}</h3>
          </div>

          <div className="profile-info-card">
            <p className="profile-label">Online Consultation Time</p>
            <h3 className="profile-value">{doctorProfile.onlineConsultationTime || "Not added"}</h3>
          </div>

          <div className="profile-info-card">
            <p className="profile-label">Physical Consultation Time</p>
            <h3 className="profile-value">{doctorProfile.physicalConsultationTime || "Not added"}</h3>
          </div>

          <div className="profile-info-card">
            <p className="profile-label">Physical Location</p>
            <h3 className="profile-value">{doctorProfile.location || "Not added"}</h3>
          </div>

          <div className="profile-info-card">
            <p className="profile-label">Slot Duration (Minutes)</p>
            <h3 className="profile-value">{doctorProfile.slotDurationMinutes || "Not added"}</h3>
          </div>
        </div>
      ) : (
        <div className="profile-form-card">
          <div className="form-grid two-col">
            <div>
              <label>Full Name</label>
              <input type="text" value={doctorProfile.fullName || ""} disabled />
            </div>

            <div>
              <label>Specialization</label>
              <input type="text" value={doctorProfile.specialization || ""} disabled />
            </div>

            <div>
              <label>Email Address</label>
              <input type="email" value={doctorProfile.email || ""} disabled />
            </div>

            <div>
              <label>Phone Number</label>
              <input type="text" value={doctorProfile.phoneNumber || ""} disabled />
            </div>

            <div>
              <label>License Number</label>
              <input type="text" value={doctorProfile.licenseNumber || ""} disabled />
            </div>

            <div>
              <label>Qualification</label>
              <input type="text" value={doctorProfile.qualification || ""} disabled />
            </div>

            <div className="full-width">
              <label>Available Days</label>
              <input
                type="text"
                name="availableDays"
                value={doctorProfile.availableDays || ""}
                onChange={handleDoctorProfileChange}
                placeholder="e.g. Monday, Wednesday, Friday"
              />
            </div>

            <div>
              <label>Daily Capacity</label>
              <input
                type="number"
                name="dailyCapacity"
                value={doctorProfile.dailyCapacity || ""}
                onChange={handleDoctorProfileChange}
                placeholder="Enter total daily capacity"
              />
            </div>

            <div>
              <label>Online Slots Per Day</label>
              <input
                type="number"
                name="onlineSlotsPerDay"
                value={doctorProfile.onlineSlotsPerDay || ""}
                onChange={handleDoctorProfileChange}
                placeholder="Enter online slot count"
              />
            </div>

            <div>
              <label>Physical Slots Per Day</label>
              <input
                type="number"
                name="physicalSlotsPerDay"
                value={doctorProfile.physicalSlotsPerDay || ""}
                onChange={handleDoctorProfileChange}
                placeholder="Enter physical slot count"
              />
            </div>

            <div>
              <label>Online Consultation Time</label>
              <input
                type="text"
                name="onlineConsultationTime"
                value={doctorProfile.onlineConsultationTime || ""}
                onChange={handleDoctorProfileChange}
                placeholder="e.g. 09:00 AM - 12:00 PM"
              />
            </div>

            <div>
              <label>Physical Consultation Time</label>
              <input
                type="text"
                name="physicalConsultationTime"
                value={doctorProfile.physicalConsultationTime || ""}
                onChange={handleDoctorProfileChange}
                placeholder="e.g. 02:00 PM - 05:00 PM"
              />
            </div>

            <div>
              <label>Physical Location</label>
              <input
                type="text"
                name="location"
                value={doctorProfile.location || ""}
                onChange={handleDoctorProfileChange}
                placeholder="Enter consultation location"
              />
            </div>

            <div>
              <label>Slot Duration (Minutes)</label>
              <input
                type="number"
                name="slotDurationMinutes"
                value={doctorProfile.slotDurationMinutes || ""}
                onChange={handleDoctorProfileChange}
                placeholder="e.g. 30"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DoctorProfile;