import { useCallback, useEffect, useState } from "react";
import { getSymptomHistory } from "../services/symptomService";

function PatientSymptomHistory() {
  const [history, setHistory] = useState([]);
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    riskLevel: ""
  });

  const load = useCallback(async (activeFilters) => {
    try {
      const res = await getSymptomHistory(activeFilters);
      setHistory(res.data || []);
    } catch (error) {
      console.error("Failed to load symptom history:", error);
      setHistory([]);
    }
  }, []);

  useEffect(() => {
    load(filters);
  }, [load, filters]);

  const handleApplyFilters = () => {
    load(filters);
  };

  const getRiskClass = (risk) => {
    if (!risk) return "";
    const r = risk.toLowerCase();
    if (r === "low") return "risk-low";
    if (r === "moderate") return "risk-moderate";
    if (r === "high") return "risk-high";
    return "";
  };

  return (
    <div className="symptom-history-page">
      <div className="symptom-history-header">
        <h2 className="symptom-history-title">Symptom History</h2>
        <p className="symptom-history-subtitle">
          Review your past symptom checks and risk levels
        </p>
      </div>

      <div className="symptom-history-filters">
        <input
          type="date"
          value={filters.startDate}
          onChange={(e) =>
            setFilters({ ...filters, startDate: e.target.value })
          }
        />

        <input
          type="date"
          value={filters.endDate}
          onChange={(e) =>
            setFilters({ ...filters, endDate: e.target.value })
          }
        />

        <select
          value={filters.riskLevel}
          onChange={(e) =>
            setFilters({ ...filters, riskLevel: e.target.value })
          }
        >
          <option value="">All Risk Levels</option>
          <option value="Low">Low</option>
          <option value="Moderate">Moderate</option>
          <option value="High">High</option>
        </select>

        <button className="btn-primary" onClick={handleApplyFilters}>
          Apply Filters
        </button>
      </div>

      <div className="symptom-history-list">
        {history.length === 0 ? (
          <div className="symptom-history-empty">
            No symptom history found.
          </div>
        ) : (
          history.map((h) => (
            <div key={h.id} className="symptom-history-card">
              <div className="symptom-history-top">
                <div className="symptom-history-category">
                  {h.predictedCategory}
                </div>

                <span className={`risk-badge ${getRiskClass(h.riskLevel)}`}>
                  {h.riskLevel}
                </span>
              </div>

              <div className="symptom-history-details">
                <p><strong>Symptoms:</strong> {h.symptomList}</p>
                <p><strong>Severity:</strong> {h.severityLevel}</p>
                <p><strong>Confidence:</strong> {h.probabilityScore}%</p>
              </div>

              <div className="symptom-history-date">
                {new Date(h.submittedAt).toLocaleString()}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default PatientSymptomHistory;