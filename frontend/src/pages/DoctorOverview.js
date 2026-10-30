import "../App.css";
import './Doctor.css';

const UNSPLASH = {
  doctor: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=900&q=80&auto=format&fit=crop",
  stethoscope: "https://images.unsplash.com/photo-1584982751601-97dcc096659c?w=600&q=80&auto=format&fit=crop",
  records: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&q=80&auto=format&fit=crop",
  patients: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=600&q=80&auto=format&fit=crop",
};

/* ── tiny reusable stat pill ── */
function StatPill({ value, label, accent }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      background: "rgba(255,255,255,.12)", backdropFilter: "blur(8px)",
      border: "1px solid rgba(255,255,255,.18)",
      borderRadius: 14, padding: "16px 20px", minWidth: 100, textAlign: "center",
    }}>
      <span style={{ fontSize: 26, fontFamily: "var(--font-serif)", fontWeight: 400, color: accent || "#fff", lineHeight: 1 }}>{value}</span>
      <span style={{ fontSize: 11, color: "rgba(255,255,255,.65)", fontWeight: 600, letterSpacing: ".06em", textTransform: "uppercase", marginTop: 4 }}>{label}</span>
    </div>
  );
}

/* ── module card ── */
function ModuleCard({ image, eyebrow, title, text, btnLabel, btnClass, onClick }) {
  return (
    <div style={{
      background: "#fff",
      border: "1px solid var(--border)",
      borderRadius: 20,
      overflow: "hidden",
      boxShadow: "var(--shadow-sm)",
      display: "flex", flexDirection: "column",
      transition: "box-shadow .25s ease, transform .25s ease",
    }}
    onMouseEnter={e => { e.currentTarget.style.boxShadow = "var(--shadow-lg)"; e.currentTarget.style.transform = "translateY(-4px)"; }}
    onMouseLeave={e => { e.currentTarget.style.boxShadow = "var(--shadow-sm)"; e.currentTarget.style.transform = "translateY(0)"; }}
    >
      <div style={{ height: 160, overflow: "hidden", position: "relative" }}>
        <img src={image} alt={title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to top, rgba(10,29,79,.55) 0%, transparent 60%)",
        }} />
      </div>
      <div style={{ padding: "20px 22px", display: "flex", flexDirection: "column", flex: 1, gap: 8 }}>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--emerald)" }}>{eyebrow}</span>
        <h3 style={{ margin: 0, fontSize: 19, fontFamily: "var(--font-serif)", fontWeight: 400, color: "var(--navy)", lineHeight: 1.2 }}>{title}</h3>
        <p style={{ margin: 0, fontSize: 13.5, color: "var(--slate)", lineHeight: 1.7, flex: 1 }}>{text}</p>
        {btnLabel && (
          <button className={btnClass || "btn-primary"} onClick={onClick}
            style={{ marginTop: 12, alignSelf: "flex-start", fontSize: 13, padding: "9px 20px" }}>
            {btnLabel} →
          </button>
        )}
      </div>
    </div>
  );
}

/* ── info row inside hero ── */
function HeroInfoRow({ icon, label, value }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <span style={{ fontSize: 15 }}>{icon}</span>
      <div>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,.55)", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase" }}>{label}</div>
        <div style={{ fontSize: 14, color: "#fff", fontWeight: 500 }}>{value}</div>
      </div>
    </div>
  );
}

function DoctorOverview() {
  const today = new Date().toLocaleDateString("en-GB", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>

      {/* ═══ HERO BANNER ═══ */}
      <div style={{
        borderRadius: 22,
        overflow: "hidden",
        position: "relative",
        minHeight: 340,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        boxShadow: "var(--shadow-xl)",
      }}>
        <img
          src={UNSPLASH.doctor}
          alt="Doctor at work"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
        />
        {/* gradient overlay */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(100deg, rgba(6,19,46,.92) 0%, rgba(6,19,46,.70) 50%, rgba(6,19,46,.30) 100%)",
        }} />

        {/* content */}
        <div style={{ position: "relative", padding: "36px 40px", display: "flex", flexDirection: "column", gap: 20 }}>
          {/* top row */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
            <div>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 7,
                background: "rgba(255,255,255,.12)", border: "1px solid rgba(255,255,255,.18)",
                borderRadius: 50, padding: "5px 14px", marginBottom: 14,
              }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#4ade80" }} />
                <span style={{ fontSize: 12, color: "rgba(255,255,255,.88)", fontWeight: 600, letterSpacing: ".04em" }}>
                  {today}
                </span>
              </div>

              <h2 style={{
                margin: 0, fontSize: "clamp(26px,3.5vw,42px)",
                fontFamily: "var(--font-serif)", fontWeight: 400,
                color: "#fff", lineHeight: 1.1, letterSpacing: "-.02em",
              }}>
                Welcome back, Doctor.
              </h2>
              <p style={{ margin: "10px 0 0", fontSize: 16, color: "rgba(255,255,255,.75)", fontWeight: 300, maxWidth: 460, lineHeight: 1.7 }}>
                Your patients are waiting. Here's a quick overview of your clinical workspace for today.
              </p>
            </div>

            {/* info column */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <HeroInfoRow icon="🕐" label="Session" value="Active since 08:00 AM" />
              <HeroInfoRow icon="📍" label="Location" value="Main Consultation Wing" />
              <HeroInfoRow icon="📋" label="Next patient" value="09:30 AM · Room 3" />
            </div>
          </div>

          {/* stat pills */}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <StatPill value="8"  label="Today's appts"    accent="#86efac" />
            <StatPill value="3"  label="Pending review"   accent="#fde68a" />
            <StatPill value="24" label="Active patients"  accent="#93c5fd" />
            <StatPill value="5"  label="New records"      accent="#f9a8d4" />
          </div>
        </div>
      </div>

      {/* ═══ SECTION LABEL ═══ */}
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: "linear-gradient(135deg,rgba(10,29,79,.06),rgba(20,83,45,.06))",
          border: "1px solid var(--border)", borderRadius: 50, padding: "5px 14px",
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "linear-gradient(135deg,var(--navy),var(--emerald))" }} />
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--navy)" }}>Clinical Modules</span>
        </div>
        <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
      </div>

      {/* ═══ MODULE CARDS ═══ */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 20 }}>
        <ModuleCard
          image={UNSPLASH.stethoscope}
          eyebrow="Appointments"
          title="Pending Appointment Queue"
          text="Review active appointment requests, confirm or reschedule bookings, and manage your daily patient flow with clear status visibility."
          btnLabel="Open queue"
          btnClass="btn-primary"
        />
        <ModuleCard
          image={UNSPLASH.patients}
          eyebrow="Patients"
          title="Your Patient List"
          text="Access the full list of patients linked to your confirmed appointments. Review health summaries, histories, and prior visit notes in one place."
          btnLabel="View patients"
          btnClass="btn-green"
        />
        <ModuleCard
          image={UNSPLASH.records}
          eyebrow="Health Records"
          title="Lab Reports & Documents"
          text="Review structured patient-uploaded lab values, diagnostic reports, and health documents — accessible only during active confirmed appointment windows."
          btnLabel="Browse records"
          btnClass="btn-primary"
        />
      </div>

      {/* ═══ QUICK TIPS / GUIDANCE ROW ═══ */}
      <div style={{
        background: "linear-gradient(135deg, rgba(10,29,79,.04) 0%, rgba(20,83,45,.04) 100%)",
        border: "1px solid var(--border)",
        borderRadius: 18, padding: "24px 28px",
        display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 20,
      }}>
        {[
          { icon: "🔒", title: "Access control", text: "Patient documents are only visible during active confirmed appointments." },
          { icon: "📊", title: "Structured records", text: "Lab values and uploaded reports are presented in a structured, reviewable format." },
          { icon: "🔔", title: "Notifications", text: "Receive automatic alerts when new appointment requests or patient updates arrive." },
          { icon: "💬", title: "Consultation notes", text: "Add clinical notes directly against each appointment for audit and continuity." },
        ].map((tip, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ fontSize: 22, marginBottom: 4 }}>{tip.icon}</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--navy)" }}>{tip.title}</div>
            <p style={{ margin: 0, fontSize: 13, color: "var(--slate)", lineHeight: 1.7 }}>{tip.text}</p>
          </div>
        ))}
      </div>

      {/* ═══ FOOTER NOTE ═══ */}
      <div style={{
        borderTop: "1px solid var(--border)",
        paddingTop: 16,
        display: "flex", justifyContent: "space-between", alignItems: "center",
        flexWrap: "wrap", gap: 8,
      }}>
        <span style={{ fontSize: 12, color: "var(--muted)" }}>
          ClinAura Doctor Portal · Advisory outputs are non-diagnostic and do not replace clinical judgement.
        </span>
        <span style={{ fontSize: 12, color: "var(--muted)" }}>
          Last synced: just now
        </span>
      </div>

    </div>
  );
}

export default DoctorOverview;
