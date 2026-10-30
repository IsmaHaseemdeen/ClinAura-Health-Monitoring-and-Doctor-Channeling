import { useMemo, useState } from "react";
import "../App.css";

function Analytics() {
  /* This page belongs to the Admin module and acts as the main entry point for analytics viewing. */
  /* It allows the admin to switch between the operational dashboard and the symptom checker dashboard. */
  /* Both dashboards are embedded from Power BI and shown inside the system using an iframe. */

  const [activeDashboard, setActiveDashboard] = useState("operational");
  const [isFullscreen, setIsFullscreen] = useState(false);

  /* These are the Power BI embed URLs for the two report pages. */
  /* Each URL points to a specific Power BI report page using the pageName parameter. */
  /* This allows the system to switch dashboards without leaving the application. */
  const operationalDashboardUrl =
    "https://app.powerbi.com/reportEmbed?reportId=8115151f-0a95-4118-9fe2-1334fc2243d8&autoAuth=true&ctid=fe8ccb52-ca53-49de-a5b4-50faf33a9cc2&pageName=43e61f605101a5a78bbb";

  const symptomDashboardUrl =
    "https://app.powerbi.com/reportEmbed?reportId=8115151f-0a95-4118-9fe2-1334fc2243d8&autoAuth=true&ctid=fe8ccb52-ca53-49de-a5b4-50faf33a9cc2&pageName=b4bd1be034ebe070b32b";

  /* Select the correct Power BI URL depending on the dashboard chosen by the admin. */
  const currentDashboardUrl =
    activeDashboard === "operational"
      ? operationalDashboardUrl
      : symptomDashboardUrl;

  /* Build a cleaner embed URL by disabling extra Power BI panes where possible. */
  const optimizedDashboardUrl = useMemo(() => {
    const separator = currentDashboardUrl.includes("?") ? "&" : "?";

    return (
      `${currentDashboardUrl}` +
      `${separator}navContentPaneEnabled=false` +
      `&filterPaneEnabled=false`
    );
  }, [currentDashboardUrl]);

  return (
    <div className="doctor-page-stack">
      {/* Fullscreen dashboard overlay shown inside the app */}
      {isFullscreen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            width: "100vw",
            height: "100vh",
            background: "#0f172a",
            zIndex: 9999,
            display: "flex",
            flexDirection: "column"
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "14px 18px",
              background: "rgba(255,255,255,0.08)",
              borderBottom: "1px solid rgba(255,255,255,0.12)"
            }}
          >
            <div style={{ color: "#ffffff", fontWeight: 600 }}>
              {activeDashboard === "operational"
                ? "Operational Analytics Dashboard"
                : "Symptom Checker Analytics Dashboard"}
            </div>

            <button
              type="button"
              className="quick-nav-btn active"
              onClick={() => setIsFullscreen(false)}
            >
              Close Full Screen
            </button>
          </div>

          <iframe
            title={
              activeDashboard === "operational"
                ? "Operational Analytics Dashboard Fullscreen"
                : "Symptom Checker Analytics Dashboard Fullscreen"
            }
            src={optimizedDashboardUrl}
            width="100%"
            height="100%"
            style={{
              border: "none",
              display: "block",
              flex: 1,
              background: "#ffffff"
            }}
            allowFullScreen
          />
        </div>
      )}

      {/* Page header introducing the analytics module to the admin user. */}
      <div className="doctor-page-header-card">
        <p className="doctor-page-eyebrow">Analytics Module</p>
        <h2 className="doctor-page-title">Admin Analytics Dashboard</h2>
        <p className="doctor-page-subtitle">
          View both the operational analytics dashboard and the symptom checker
          analytics dashboard from one place. Use the interactive filters and
          slicers inside each Power BI report to explore the data dynamically.
        </p>
      </div>

      {/* Dashboard selector and fullscreen action */}
      <div
        className="dashboard-card"
        style={{
          padding: "16px",
          display: "flex",
          gap: "12px",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between"
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "12px",
            flexWrap: "wrap",
            alignItems: "center"
          }}
        >
          <button
            className={
              activeDashboard === "operational"
                ? "quick-nav-btn active"
                : "quick-nav-btn"
            }
            onClick={() => setActiveDashboard("operational")}
          >
            Operational Analytics
          </button>

          <button
            className={
              activeDashboard === "symptom"
                ? "quick-nav-btn active"
                : "quick-nav-btn"
            }
            onClick={() => setActiveDashboard("symptom")}
          >
            Symptom Checker Analytics
          </button>
        </div>

        <button
          type="button"
          className="quick-nav-btn active"
          onClick={() => setIsFullscreen(true)}
        >
          Open Full Screen
        </button>
      </div>

      {/* This information card changes based on the currently selected dashboard. */}
      <div className="dashboard-card" style={{ padding: "18px" }}>
        {activeDashboard === "operational" ? (
          <div>
            <h3
              className="dashboard-main-card-title"
              style={{ marginBottom: "8px" }}
            >
              Operational Analytics
            </h3>
            <p className="dashboard-main-card-subtitle">
              Analyze healthcare system operations including appointments,
              revenue, doctor performance, consultation modes, and service
              trends.
            </p>
          </div>
        ) : (
          <div>
            <h3
              className="dashboard-main-card-title"
              style={{ marginBottom: "8px" }}
            >
              Symptom Checker Analytics
            </h3>
            <p className="dashboard-main-card-subtitle">
              Analyze symptom checker usage, AI prediction categories, risk
              levels, urgency classifications, red-flag detection, and model
              output patterns.
            </p>
          </div>
        )}
      </div>

      {/* Main embedded dashboard area sized to use much more of the screen */}
      <div
        className="dashboard-card"
        style={{
          padding: "0px",
          width: "100%"
        }}
      >
        <div
          style={{
            width: "100%",
            height: "calc(100vh - 120px)",
            minHeight: "820px",
            borderRadius: "16px",
            overflow: "hidden",
            border: "1px solid rgba(148, 163, 184, 0.2)",
            background: "#ffffff"
          }}
        >
          <iframe
            title={
              activeDashboard === "operational"
                ? "Operational Analytics Dashboard"
                : "Symptom Checker Analytics Dashboard"
            }
            src={optimizedDashboardUrl}
            width="100%"
            height="100%"
            style={{
              border: "none",
              display: "block"
            }}
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
}

export default Analytics;