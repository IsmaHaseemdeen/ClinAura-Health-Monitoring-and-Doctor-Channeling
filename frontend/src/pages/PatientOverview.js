import { useEffect, useMemo, useState } from "react";
import { getLatestSymptomResult, getSymptomHistory } from "../services/symptomService";
import "../App.css";

/* ─────────────────────────────────────────────────────────────
   DESIGN TOKENS  (identical to DoctorOverview / AdminOverview)
───────────────────────────────────────────────────────────── */
const C = {
  navy:      "#0a1d4f",
  navyDark:  "#06132e",
  emerald:   "#14532d",
  white:     "#ffffff",
  offWhite:  "#fafbff",
  slate:     "#475569",
  muted:     "#94a3b8",
  border:    "rgba(10,29,79,0.09)",
  danger:    "#dc2626",
  gold:      "#c9a84c",
};

const KF = `
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600&display=swap');
@keyframes poFadeUp { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:none} }
@keyframes poPulse  { 0%,100%{transform:scale(1);opacity:.7} 50%{transform:scale(1.15);opacity:1} }
@keyframes poSlideR { from{opacity:0;transform:translateX(-14px)} to{opacity:1;transform:none} }
@keyframes poBarFill{ from{width:0} to{width:var(--bar-w,100%)} }
`;

const UNSPLASH = {
  hero:    "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1400&q=85&auto=format&fit=crop",
  symptom: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600&q=80&auto=format&fit=crop",
  records: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&q=80&auto=format&fit=crop",
  appt:    "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=600&q=80&auto=format&fit=crop",
  docs:    "https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=600&q=80&auto=format&fit=crop",
};

/* ─────────────────────────────────────────────────────────────
   RISK PALETTE
───────────────────────────────────────────────────────────── */
const RISK = {
  high:     { bg: "#fee2e2", color: "#991b1b", dot: "#ef4444", label: "High Risk" },
  moderate: { bg: "#fef3c7", color: "#92400e", dot: "#f59e0b", label: "Moderate Risk" },
  low:      { bg: "#dcfce7", color: "#166534", dot: "#22c55e", label: "Low Risk" },
  default:  { bg: "#dbeafe", color: "#1e40af", dot: "#3b82f6", label: "Assessed" },
};
const getRisk = (r) => RISK[String(r || "").toLowerCase()] || RISK.default;

/* ─────────────────────────────────────────────────────────────
   PRIMITIVES  — identical structure to DoctorOverview /
                 AdminOverview so all three share the same look
───────────────────────────────────────────────────────────── */

function StatPill({ value, label, accent }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      background: "rgba(255,255,255,.12)", backdropFilter: "blur(8px)",
      border: "1px solid rgba(255,255,255,.18)",
      borderRadius: 14, padding: "16px 20px", minWidth: 100, textAlign: "center",
    }}>
      <span style={{
        fontSize: 26,
        fontFamily: "'DM Serif Display', Georgia, serif",
        fontWeight: 400, color: accent || "#fff", lineHeight: 1,
      }}>{value}</span>
      <span style={{
        fontSize: 11, color: "rgba(255,255,255,.65)", fontWeight: 600,
        letterSpacing: ".06em", textTransform: "uppercase", marginTop: 4,
      }}>{label}</span>
    </div>
  );
}

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

function SectionDivider({ label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
      <div style={{
        display: "inline-flex", alignItems: "center", gap: 8,
        background: "linear-gradient(135deg,rgba(10,29,79,.06),rgba(20,83,45,.06))",
        border: `1px solid ${C.border}`, borderRadius: 50, padding: "5px 14px",
      }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: `linear-gradient(135deg,${C.navy},${C.emerald})` }} />
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: C.navy }}>{label}</span>
      </div>
      <div style={{ flex: 1, height: 1, background: C.border }} />
    </div>
  );
}

function ModuleCard({ image, eyebrow, title, text, btnLabel, btnClass, onClick, badge, badgeStyle }) {
  return (
    <div
      style={{
        background: C.white, border: `1px solid ${C.border}`,
        borderRadius: 20, overflow: "hidden",
        boxShadow: "0 4px 20px rgba(10,29,79,.07)",
        display: "flex", flexDirection: "column",
        transition: "box-shadow .25s ease, transform .25s ease",
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 20px 52px rgba(10,29,79,.14)"; e.currentTarget.style.transform = "translateY(-4px)"; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 4px 20px rgba(10,29,79,.07)"; e.currentTarget.style.transform = "translateY(0)"; }}
    >
      <div style={{ height: 160, overflow: "hidden", position: "relative" }}>
        <img src={image} alt={title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(10,29,79,.55) 0%, transparent 60%)" }} />
        {badge && (
          <span style={{ position: "absolute", top: 12, right: 12, fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 999, ...badgeStyle }}>
            {badge}
          </span>
        )}
      </div>
      <div style={{ padding: "20px 22px", display: "flex", flexDirection: "column", flex: 1, gap: 8 }}>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: C.emerald }}>{eyebrow}</span>
        <h3 style={{ margin: 0, fontSize: 19, fontFamily: "'DM Serif Display',Georgia,serif", fontWeight: 400, color: C.navy, lineHeight: 1.2 }}>{title}</h3>
        <p style={{ margin: 0, fontSize: 13.5, color: C.slate, lineHeight: 1.7, flex: 1 }}>{text}</p>
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

function SnapshotBox({ label, value }) {
  const empty = !value || value === "Not added";
  return (
    <div style={{ background: C.offWhite, border: `1px solid ${C.border}`, borderRadius: 14, padding: "16px 18px" }}>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: C.muted, marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 17, fontWeight: 600, color: empty ? C.muted : C.navy, fontStyle: empty ? "italic" : "normal" }}>{value}</div>
    </div>
  );
}

function NoteCard({ label, text }) {
  const empty = !text || text.trim() === "";
  return (
    <div style={{ background: C.offWhite, border: `1px solid ${C.border}`, borderRadius: 14, padding: "18px 20px" }}>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: C.muted, marginBottom: 10 }}>{label}</div>
      <p style={{ margin: 0, fontSize: 14, color: empty ? C.muted : C.slate, lineHeight: 1.75, fontStyle: empty ? "italic" : "normal" }}>
        {empty ? "Not added yet." : text}
      </p>
    </div>
  );
}

function Chip({ label }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", padding: "5px 12px",
      background: "rgba(10,29,79,.06)", border: `1px solid ${C.border}`,
      borderRadius: 999, fontSize: 13, fontWeight: 600, color: C.navy,
    }}>{label}</span>
  );
}

/* ─────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────── */
function PatientOverview({ setActivePage, patientProfile }) {
  const [latestResult, setLatestResult] = useState(null);
  const [history, setHistory]           = useState([]);
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [latestRes, histRes] = await Promise.all([
          getLatestSymptomResult().catch(() => ({ data: null })),
          getSymptomHistory().catch(() => ({ data: [] })),
        ]);
        setLatestResult(latestRes.data || null);
        setHistory(histRes.data || []);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const profileCompletion = useMemo(() => {
    const fields = [
      patientProfile?.fullName, patientProfile?.email,
      patientProfile?.dateOfBirth, patientProfile?.gender,
      patientProfile?.heightCm, patientProfile?.weightKg,
      patientProfile?.medicalHistory, patientProfile?.lifestyleNotes,
    ];
    const filled = fields.filter(v => v !== null && v !== undefined && String(v).trim() !== "").length;
    return Math.round((filled / fields.length) * 100);
  }, [patientProfile]);

  const latestCheckDate = useMemo(() => {
    if (!latestResult?.submittedAt && !latestResult?.createdAt) return null;
    return new Date(latestResult.submittedAt || latestResult.createdAt)
      .toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  }, [latestResult]);

  const latestSymptoms = useMemo(() => {
    if (!latestResult?.enteredSymptoms) return [];
    return latestResult.enteredSymptoms.split(",").map(s => s.trim()).filter(Boolean);
  }, [latestResult]);

  const risk       = getRisk(latestResult?.riskLevel);
  const today      = new Date().toLocaleDateString("en-GB", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  const firstName  = patientProfile?.fullName?.split(" ")[0] || "Patient";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28, fontFamily: "'DM Sans',system-ui,sans-serif" }}>
      <style>{KF}</style>

      {/* ═══════════════════════════════════════════════════
          HERO BANNER — same structure as DoctorOverview
      ═══════════════════════════════════════════════════ */}
      <div style={{
        borderRadius: 22, overflow: "hidden", position: "relative",
        minHeight: 340, display: "flex", flexDirection: "column", justifyContent: "flex-end",
        boxShadow: "0 28px 72px rgba(10,29,79,.20)",
        animation: "poFadeUp .6s ease both",
      }}>
        <img
          src={UNSPLASH.hero}
          alt="Patient health dashboard"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
        />
        {/* same gradient angle as Doctor */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(100deg, rgba(6,19,46,.92) 0%, rgba(6,19,46,.70) 50%, rgba(6,19,46,.30) 100%)",
        }} />
        {/* grid texture */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          backgroundImage: `linear-gradient(rgba(255,255,255,.03) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,.03) 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
        }} />

        <div style={{ position: "relative", padding: "36px 40px", display: "flex", flexDirection: "column", gap: 20 }}>

          {/* top row */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
            <div>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 7,
                background: "rgba(255,255,255,.12)", border: "1px solid rgba(255,255,255,.18)",
                borderRadius: 50, padding: "5px 14px", marginBottom: 14,
              }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#4ade80", animation: "poPulse 2s ease-in-out infinite" }} />
                <span style={{ fontSize: 12, color: "rgba(255,255,255,.88)", fontWeight: 600, letterSpacing: ".04em" }}>{today}</span>
              </div>

              <h2 style={{
                margin: 0, fontSize: "clamp(26px,3.5vw,42px)",
                fontFamily: "'DM Serif Display',Georgia,serif",
                fontWeight: 400, color: "#fff", lineHeight: 1.1, letterSpacing: "-.02em",
              }}>
                Welcome back, {firstName}.
              </h2>
              <p style={{ margin: "10px 0 0", fontSize: 16, color: "rgba(255,255,255,.75)", fontWeight: 300, maxWidth: 460, lineHeight: 1.7 }}>
                Your health dashboard is ready. Track symptoms, manage records, and stay connected with your care team — all from one place.
              </p>
            </div>

            {/* right info column — mirrors Doctor's layout */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <HeroInfoRow icon="📋" label="Profile completion"  value={`${profileCompletion}%`} />
              <HeroInfoRow icon="🔬" label="Symptom checks"      value={history.length > 0 ? `${history.length} recorded` : "None yet"} />
              <HeroInfoRow icon="⚠️" label="Latest risk level"   value={latestResult ? (latestResult.riskLevel || "Assessed") : "No check yet"} />
            </div>
          </div>

          {/* stat pills — same row as Doctor/Admin */}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <StatPill value={`${profileCompletion}%`} label="Profile complete"  accent="#86efac" />
            <StatPill value={history.length}          label="Symptom checks"    accent="#fde68a" />
            <StatPill
              value={latestResult?.riskLevel || "None"}
              label="Latest risk"
              accent={
                !latestResult                                                ? "#93c5fd"
                : latestResult.riskLevel?.toLowerCase() === "high"          ? "#fca5a5"
                : latestResult.riskLevel?.toLowerCase() === "moderate"      ? "#fde68a"
                : "#86efac"
              }
            />
            <StatPill value={latestCheckDate || "—"} label="Last check date"   accent="#c4b5fd" />
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════
          SECTION LABEL — identical to Doctor/Admin
      ═══════════════════════════════════════════════════ */}
      <SectionDivider label="Patient Modules" />

      {/* ═══════════════════════════════════════════════════
          MODULE CARDS — same grid + ModuleCard component
      ═══════════════════════════════════════════════════ */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 20 }}>
        <ModuleCard
          image={UNSPLASH.symptom}
          eyebrow="Health Check"
          title="AI Symptom Checker"
          text="Describe your symptoms and receive structured, category-based advisory insights with risk stratification — powered by clinically-aware AI."
          btnLabel="Run a check"
          btnClass="btn-primary"
          onClick={() => setActivePage("symptoms")}
          badge={latestResult ? `${latestResult.riskLevel || "Assessed"} risk` : undefined}
          badgeStyle={latestResult ? { background: risk.bg, color: risk.color } : {}}
        />
        <ModuleCard
          image={UNSPLASH.records}
          eyebrow="Records"
          title="Upload Health Record"
          text="Securely upload lab reports, prescriptions, and diagnostic documents. Stored safely and available during your consultations."
          btnLabel="Upload record"
          btnClass="btn-green"
          onClick={() => setActivePage("upload")}
        />
        <ModuleCard
          image={UNSPLASH.appt}
          eyebrow="Appointments"
          title="Book a Consultation"
          text="Choose a verified physician, select your appointment mode and time slot, upload payment proof, and track every stage of your booking."
          btnLabel="Book now"
          btnClass="btn-primary"
          onClick={() => setActivePage("bookappointment")}
        />
        <ModuleCard
          image={UNSPLASH.docs}
          eyebrow="My Health"
          title="Documents & History"
          text="Access all your uploaded health documents, past symptom check results, and your full longitudinal health record in one organised hub."
          btnLabel="View documents"
          btnClass="btn-green"
          onClick={() => setActivePage("documents")}
        />
      </div>

      {/* ═══════════════════════════════════════════════════
          LATEST SYMPTOM RESULT CARD
      ═══════════════════════════════════════════════════ */}
      {!loading && latestResult && (
        <>
          <SectionDivider label="Latest Symptom Result" />

          <div style={{
            background: C.white, border: `1px solid ${C.border}`,
            borderRadius: 20, overflow: "hidden",
            boxShadow: "0 4px 20px rgba(10,29,79,.07)",
          }}>
            {/* coloured top accent strip */}
            <div style={{ height: 5, background: risk.dot }} />

            <div style={{ padding: "28px 32px" }}>
              {/* heading + badge */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 24 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: C.emerald, marginBottom: 8 }}>
                    Latest check result
                  </div>
                  <h3 style={{
                    margin: 0, fontSize: "clamp(20px,2.5vw,28px)",
                    fontFamily: "'DM Serif Display',Georgia,serif",
                    fontWeight: 400, color: C.navy, lineHeight: 1.15,
                  }}>
                    {latestResult.topCategoryDisplayName || "Health Summary"}
                  </h3>
                </div>
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  background: risk.bg, border: `1px solid ${risk.dot}44`,
                  borderRadius: 999, padding: "8px 18px",
                }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: risk.dot, animation: "poPulse 2s ease-in-out infinite" }} />
                  <span style={{ fontSize: 13.5, fontWeight: 700, color: risk.color }}>{risk.label}</span>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }} className="po-result-grid">

                {/* LEFT — advisory note + meta */}
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div style={{
                    background: C.offWhite, border: `1px solid ${C.border}`,
                    borderLeft: `4px solid ${risk.dot}`,
                    borderRadius: 14, padding: "18px 20px",
                  }}>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: C.muted, marginBottom: 8 }}>Advisory note</div>
                    <p style={{ margin: 0, fontSize: 14.5, color: C.slate, lineHeight: 1.8 }}>
                      {latestResult.advisoryNote || "No advisory note available for this result."}
                    </p>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    {[
                      { label: "Last checked",  value: latestCheckDate || "—" },
                      { label: "Urgency level", value: latestResult.urgencyLevel || "Not specified" },
                      { label: "Risk level",    value: latestResult.riskLevel || "Assessed" },
                      { label: "Total checks",  value: history.length },
                    ].map(({ label, value }) => (
                      <div key={label} style={{ background: C.offWhite, border: `1px solid ${C.border}`, borderRadius: 12, padding: "12px 14px" }}>
                        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".07em", textTransform: "uppercase", color: C.muted, marginBottom: 4 }}>{label}</div>
                        <div style={{ fontSize: 16, fontWeight: 600, color: C.navy }}>{value}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 4 }}>
                    <button className="btn-primary" style={{ fontSize: 13, padding: "9px 20px" }} onClick={() => setActivePage("symptoms")}>
                      View full result →
                    </button>
                    {(latestResult.riskLevel || "").toLowerCase() === "high" && (
                      <button className="btn-danger" style={{ fontSize: 13, padding: "9px 20px" }} onClick={() => setActivePage("bookappointment")}>
                        Book appointment →
                      </button>
                    )}
                  </div>
                </div>

                {/* RIGHT — symptoms + red flag + history strip */}
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {latestSymptoms.length > 0 && (
                    <div style={{ background: C.offWhite, border: `1px solid ${C.border}`, borderRadius: 14, padding: "18px 20px" }}>
                      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: C.muted, marginBottom: 12 }}>Symptoms entered</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                        {latestSymptoms.slice(0, 8).map(s => <Chip key={s} label={s} />)}
                        {latestSymptoms.length > 8 && <Chip label={`+${latestSymptoms.length - 8} more`} />}
                      </div>
                    </div>
                  )}

                  {latestResult.redFlagDetected && (
                    <div style={{ background: "#fff5f5", border: "1px solid #fecaca", borderLeft: "4px solid #ef4444", borderRadius: 14, padding: "18px 20px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                        <span style={{ fontSize: 18 }}>⚠️</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: "#991b1b" }}>Warning Signs Detected</span>
                      </div>
                      <p style={{ margin: "0 0 14px", fontSize: 14, color: "#7f1d1d", lineHeight: 1.7 }}>
                        Your latest check flagged potential red-flag symptoms. Please review and consider booking a consultation promptly.
                      </p>
                      <button className="btn-danger" style={{ fontSize: 13, padding: "9px 18px" }} onClick={() => setActivePage("bookappointment")}>
                        Book now →
                      </button>
                    </div>
                  )}

                  {history.length > 1 && (
                    <div style={{ background: C.offWhite, border: `1px solid ${C.border}`, borderRadius: 14, padding: "18px 20px" }}>
                      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: C.muted, marginBottom: 12 }}>Recent check history</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                        {history.slice(0, 4).map((h, i) => {
                          const r = getRisk(h.riskLevel);
                          return (
                            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, animation: `poSlideR .4s ${i * .07}s ease both` }}>
                              <div style={{ width: 8, height: 8, borderRadius: "50%", background: r.dot, flexShrink: 0 }} />
                              <span style={{ fontSize: 13, color: C.slate, flex: 1 }}>{h.topCategoryDisplayName || "Health Check"}</span>
                              <span style={{ fontSize: 11, fontWeight: 700, color: r.color, background: r.bg, padding: "3px 9px", borderRadius: 999 }}>{h.riskLevel || "—"}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* no checks yet — empty prompt */}
      {!loading && !latestResult && (
        <>
          <SectionDivider label="Symptom Checker" />
          <div style={{
            background: "linear-gradient(135deg,rgba(10,29,79,.03),rgba(20,83,45,.04))",
            border: `1px dashed ${C.border}`, borderRadius: 20, padding: "40px 32px",
            display: "flex", alignItems: "center", gap: 28, flexWrap: "wrap",
          }}>
            <div style={{ fontSize: 52 }}>🩺</div>
            <div style={{ flex: 1, minWidth: 220 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: C.emerald, marginBottom: 8 }}>No checks yet</div>
              <h3 style={{ margin: "0 0 10px", fontSize: 22, fontFamily: "'DM Serif Display',serif", fontWeight: 400, color: C.navy }}>
                Start your first symptom check
              </h3>
              <p style={{ margin: "0 0 20px", fontSize: 14.5, color: C.slate, lineHeight: 1.75, maxWidth: 480 }}>
                Describe what you're experiencing and receive structured, advisory health insights in minutes — no appointment needed.
              </p>
              <button className="btn-primary" style={{ fontSize: 13, padding: "10px 22px" }} onClick={() => setActivePage("symptoms")}>
                Run a symptom check →
              </button>
            </div>
          </div>
        </>
      )}

      {/* ═══════════════════════════════════════════════════
          HEALTH SNAPSHOT  — styled like Admin guidance strip
      ═══════════════════════════════════════════════════ */}
      <SectionDivider label="Health Snapshot" />

      <div style={{
        background: "linear-gradient(135deg, rgba(10,29,79,.04) 0%, rgba(20,83,45,.04) 100%)",
        border: `1px solid ${C.border}`, borderRadius: 20, padding: "28px 32px",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 22 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: C.emerald, marginBottom: 6 }}>Your profile vitals</div>
            <h3 style={{ margin: 0, fontSize: 22, fontFamily: "'DM Serif Display',serif", fontWeight: 400, color: C.navy }}>Health profile summary</h3>
          </div>
          <button className="btn-green" style={{ fontSize: 13, padding: "9px 20px" }} onClick={() => setActivePage("profile")}>
            Edit profile →
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 12, marginBottom: 20 }}>
          <SnapshotBox label="Date of birth" value={patientProfile?.dateOfBirth || "Not added"} />
          <SnapshotBox label="Gender"        value={patientProfile?.gender || "Not added"} />
          <SnapshotBox label="Height"        value={patientProfile?.heightCm ? `${patientProfile.heightCm} cm` : "Not added"} />
          <SnapshotBox label="Weight"        value={patientProfile?.weightKg ? `${patientProfile.weightKg} kg` : "Not added"} />
        </div>

        {/* BMI — only when both height + weight exist */}
        {patientProfile?.heightCm && patientProfile?.weightKg && (() => {
          const bmi = (patientProfile.weightKg / Math.pow(patientProfile.heightCm / 100, 2)).toFixed(1);
          const cat =
            bmi < 18.5 ? { label: "Underweight", color: "#2563eb" }
            : bmi < 25  ? { label: "Normal range", color: C.emerald }
            : bmi < 30  ? { label: "Overweight",   color: "#d97706" }
            :              { label: "Obese",         color: C.danger };
          return (
            <div style={{
              display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap",
              background: C.white, border: `1px solid ${C.border}`,
              borderRadius: 14, padding: "14px 20px", marginBottom: 20,
            }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: C.muted }}>Calculated BMI</div>
                <div style={{ fontSize: 28, fontFamily: "'DM Serif Display',serif", color: C.navy, marginTop: 2 }}>{bmi}</div>
              </div>
              <div style={{ background: `${cat.color}15`, border: `1px solid ${cat.color}44`, borderRadius: 999, padding: "5px 14px", fontSize: 13, fontWeight: 700, color: cat.color }}>
                {cat.label}
              </div>
              <p style={{ margin: 0, fontSize: 12.5, color: C.muted, lineHeight: 1.6 }}>
                BMI is a general indicator and does not replace clinical assessment.
              </p>
            </div>
          );
        })()}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }} className="po-notes-grid">
          <NoteCard label="Medical history" text={patientProfile?.medicalHistory} />
          <NoteCard label="Lifestyle notes" text={patientProfile?.lifestyleNotes} />
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════
          GUIDANCE STRIP — identical layout to Doctor/Admin
      ═══════════════════════════════════════════════════ */}
      <div style={{
        background: "linear-gradient(135deg, rgba(10,29,79,.04) 0%, rgba(20,83,45,.04) 100%)",
        border: `1px solid ${C.border}`,
        borderRadius: 18, padding: "24px 28px",
        display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 20,
      }}>
        {[
          { icon: "🔒", title: "Your data is private",   text: "Only you and your treating doctor — during an active confirmed appointment — can access your records and health data." },
          { icon: "📊", title: "Track trends over time", text: "Upload lab values regularly to build longitudinal trends that give your doctor richer context during consultations." },
          { icon: "🔔", title: "Stay notified",          text: "Receive automatic alerts for appointment confirmations, reminders, and important updates from your care team." },
          { icon: "🩺", title: "Advisory outputs",       text: "Symptom check results are advisory only and do not constitute a medical diagnosis. Always consult a clinician." },
        ].map((tip, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ fontSize: 22, marginBottom: 4 }}>{tip.icon}</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.navy }}>{tip.title}</div>
            <p style={{ margin: 0, fontSize: 13, color: C.slate, lineHeight: 1.7 }}>{tip.text}</p>
          </div>
        ))}
      </div>

      {/* ═══════════════════════════════════════════════════
          FOOTER NOTE — identical to Doctor/Admin
      ═══════════════════════════════════════════════════ */}
      <div style={{
        borderTop: `1px solid ${C.border}`, paddingTop: 16,
        display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8,
      }}>
        <span style={{ fontSize: 12, color: C.muted }}>
          ClinAura Patient Portal · Advisory outputs are non-diagnostic and do not replace professional medical advice.
        </span>
        <span style={{ fontSize: 12, color: C.muted }}>Last synced: just now</span>
      </div>

      <style>{`
        @media (max-width: 860px) {
          .po-result-grid { grid-template-columns: 1fr !important; }
          .po-notes-grid  { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

export default PatientOverview;
