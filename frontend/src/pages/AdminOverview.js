import "../App.css";
import './Admin.css';

const UNSPLASH = {
  admin:      "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=1200&q=80&auto=format&fit=crop",
  payments:   "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=600&q=80&auto=format&fit=crop",
  doctors:    "https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=600&q=80&auto=format&fit=crop",
  patients:   "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=600&q=80&auto=format&fit=crop",
  calendar:   "https://images.unsplash.com/photo-1506784365847-bbad939e9501?w=600&q=80&auto=format&fit=crop",
};

/* ── stat pill inside hero ── */
function StatPill({ value, label, accent }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      background: "rgba(255,255,255,.11)", backdropFilter: "blur(8px)",
      border: "1px solid rgba(255,255,255,.17)",
      borderRadius: 14, padding: "16px 22px", minWidth: 110, textAlign: "center",
    }}>
      <span style={{ fontSize: 26, fontFamily: "var(--font-serif)", fontWeight: 400, color: accent || "#fff", lineHeight: 1 }}>{value}</span>
      <span style={{ fontSize: 11, color: "rgba(255,255,255,.60)", fontWeight: 600, letterSpacing: ".06em", textTransform: "uppercase", marginTop: 4 }}>{label}</span>
    </div>
  );
}

/* ── module card ── */
function ModuleCard({ image, eyebrow, title, text, badge, badgeClass }) {
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
      <div style={{ height: 150, overflow: "hidden", position: "relative" }}>
        <img src={image} alt={title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(10,29,79,.50) 0%, transparent 60%)" }} />
        {badge && (
          <span className={`status ${badgeClass || "status-confirmed"}`} style={{ position: "absolute", top: 12, right: 12, fontSize: 11 }}>
            {badge}
          </span>
        )}
      </div>
      <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 6 }}>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--emerald)" }}>{eyebrow}</span>
        <h3 style={{ margin: 0, fontSize: 18, fontFamily: "var(--font-serif)", fontWeight: 400, color: "var(--navy)", lineHeight: 1.25 }}>{title}</h3>
        <p style={{ margin: 0, fontSize: 13.5, color: "var(--slate)", lineHeight: 1.7 }}>{text}</p>
      </div>
    </div>
  );
}

/* ── metric card ── */
function MetricCard({ value, label, change, changePositive, icon }) {
  return (
    <div style={{
      background: "#fff",
      border: "1px solid var(--border)",
      borderRadius: 16, padding: "18px 20px",
      boxShadow: "var(--shadow-xs)",
      display: "flex", alignItems: "flex-start", gap: 14,
      transition: "box-shadow .2s, transform .2s",
    }}
    onMouseEnter={e => { e.currentTarget.style.boxShadow = "var(--shadow-md)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
    onMouseLeave={e => { e.currentTarget.style.boxShadow = "var(--shadow-xs)"; e.currentTarget.style.transform = "translateY(0)"; }}
    >
      <div style={{
        width: 44, height: 44, borderRadius: 12, flexShrink: 0,
        background: "linear-gradient(135deg, var(--navy), var(--emerald))",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 18, boxShadow: "0 6px 16px rgba(10,29,79,.2)",
      }}>{icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".07em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 4 }}>{label}</div>
        <div style={{ fontSize: 24, fontFamily: "var(--font-serif)", fontWeight: 400, color: "var(--navy)", lineHeight: 1 }}>{value}</div>
        {change && (
          <div style={{ fontSize: 12, color: changePositive ? "#16a34a" : "#dc2626", fontWeight: 600, marginTop: 4 }}>
            {changePositive ? "↑" : "↓"} {change}
          </div>
        )}
      </div>
    </div>
  );
}

function AdminOverview() {
  const today = new Date().toLocaleDateString("en-GB", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>

      {/* ═══ HERO BANNER ═══ */}
      <div style={{
        borderRadius: 22,
        overflow: "hidden",
        position: "relative",
        minHeight: 320,
        display: "flex", flexDirection: "column", justifyContent: "flex-end",
        boxShadow: "var(--shadow-xl)",
      }}>
        <img
          src={UNSPLASH.admin}
          alt="Admin workspace"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
        />
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(108deg, rgba(6,19,46,.94) 0%, rgba(6,19,46,.72) 55%, rgba(20,83,45,.45) 100%)",
        }} />

        <div style={{ position: "relative", padding: "36px 40px", display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 20 }}>
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
                ClinAura Administration.
              </h2>
              <p style={{ margin: "10px 0 0", fontSize: 16, color: "rgba(255,255,255,.72)", fontWeight: 300, maxWidth: 520, lineHeight: 1.7 }}>
                Oversee platform-wide operations — appointments, payments, doctors, and patients — from your centralised admin workspace.
              </p>
            </div>

            {/* right: key alerts */}
            <div style={{
              background: "rgba(255,255,255,.10)", backdropFilter: "blur(10px)",
              border: "1px solid rgba(255,255,255,.16)",
              borderRadius: 16, padding: "16px 20px",
              display: "flex", flexDirection: "column", gap: 10, minWidth: 200,
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "rgba(255,255,255,.55)", marginBottom: 2 }}>
                Needs attention
              </div>
              {[
                { dot: "#fbbf24", text: "4 payments awaiting review" },
                { dot: "#f87171", text: "2 appointment conflicts" },
                { dot: "#86efac", text: "1 new doctor application" },
              ].map((a, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: a.dot, flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: "rgba(255,255,255,.85)", fontWeight: 500 }}>{a.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* stat pills */}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <StatPill value="42"  label="Appointments today" accent="#86efac" />
            <StatPill value="7"   label="Pending payments"   accent="#fde68a" />
            <StatPill value="18"  label="Active doctors"     accent="#93c5fd" />
            <StatPill value="320" label="Registered patients" accent="#f9a8d4" />
          </div>
        </div>
      </div>

      {/* ═══ METRICS ROW ═══ */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 14 }}>
        <MetricCard icon="📅" label="This week's bookings" value="118"  change="12% vs last week" changePositive />
        <MetricCard icon="💳" label="Payment approvals"    value="94%"  change="2% improvement"   changePositive />
        <MetricCard icon="🩺" label="Active doctors"       value="18"   change="1 new this month"  changePositive />
        <MetricCard icon="👥" label="Total patients"       value="1,284" />
        <MetricCard icon="⚠️" label="Open inquiries"       value="6"    change="3 unread"          changePositive={false} />
      </div>

      {/* ═══ SECTION LABEL ═══ */}
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: "linear-gradient(135deg,rgba(10,29,79,.06),rgba(20,83,45,.06))",
          border: "1px solid var(--border)", borderRadius: 50, padding: "5px 14px",
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "linear-gradient(135deg,var(--navy),var(--emerald))" }} />
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--navy)" }}>Admin Modules</span>
        </div>
        <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
      </div>

      {/* ═══ MODULE CARDS ═══ */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 20 }}>
        <ModuleCard
          image={UNSPLASH.calendar}
          eyebrow="Scheduling"
          title="Upcoming Appointments"
          text="Browse all scheduled consultations across the platform. Filter by date, doctor, or status to maintain clear operational oversight."
          badge="Today: 42"
          badgeClass="status-confirmed"
        />
        <ModuleCard
          image={UNSPLASH.payments}
          eyebrow="Finance"
          title="Payment Overview"
          text="Review and approve or reject patient payment submissions. Verify receipts and ensure all bookings are financially reconciled before confirmation."
          badge="7 pending"
          badgeClass="status-pending"
        />
        <ModuleCard
          image={UNSPLASH.doctors}
          eyebrow="Staff Management"
          title="Doctor Registration"
          text="Onboard new doctors, set their availability, assign specialisations, and manage existing doctor profiles with full administrative access."
          badge="1 new"
          badgeClass="status-completed"
        />
        <ModuleCard
          image={UNSPLASH.patients}
          eyebrow="Patient Records"
          title="Patient List"
          text="View all registered patients, their profile completion status, appointment histories, and account activity for full platform-wide visibility."
        />
      </div>

      {/* ═══ GUIDANCE STRIP ═══ */}
      <div style={{
        background: "linear-gradient(135deg, rgba(10,29,79,.04), rgba(20,83,45,.04))",
        border: "1px solid var(--border)",
        borderRadius: 18, padding: "22px 28px",
        display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: 20,
      }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          <span style={{ fontSize: 20, marginTop: 2 }}>🔐</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--navy)", marginBottom: 4 }}>Role-based access</div>
            <p style={{ margin: 0, fontSize: 12.5, color: "var(--slate)", lineHeight: 1.7 }}>Doctors and patients can only see what is relevant to their role and active sessions.</p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          <span style={{ fontSize: 20, marginTop: 2 }}>📩</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--navy)", marginBottom: 4 }}>Auto-notifications</div>
            <p style={{ margin: 0, fontSize: 12.5, color: "var(--slate)", lineHeight: 1.7 }}>The system sends automated confirmations and reminders at every key appointment milestone.</p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          <span style={{ fontSize: 20, marginTop: 2 }}>📊</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--navy)", marginBottom: 4 }}>Audit trail</div>
            <p style={{ margin: 0, fontSize: 12.5, color: "var(--slate)", lineHeight: 1.7 }}>All payment approvals, appointment changes, and record accesses are logged for compliance.</p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          <span style={{ fontSize: 20, marginTop: 2 }}>⚡</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--navy)", marginBottom: 4 }}>Real-time updates</div>
            <p style={{ margin: 0, fontSize: 12.5, color: "var(--slate)", lineHeight: 1.7 }}>Dashboard data reflects the latest platform state — no manual refresh required for status changes.</p>
          </div>
        </div>
      </div>

      {/* ═══ FOOTER NOTE ═══ */}
      <div style={{
        borderTop: "1px solid var(--border)",
        paddingTop: 16,
        display: "flex", justifyContent: "space-between", alignItems: "center",
        flexWrap: "wrap", gap: 8,
      }}>
        <span style={{ fontSize: 12, color: "var(--muted)" }}>
          ClinAura Admin Portal · For platform administration use only. All actions are logged.
        </span>
        <span style={{ fontSize: 12, color: "var(--muted)" }}>
          Last synced: just now
        </span>
      </div>

    </div>
  );
}

export default AdminOverview;
