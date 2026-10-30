import { useEffect, useMemo, useRef, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  LineChart,
  Line,
  Legend,
  Cell
} from "recharts";
import {
  submitSymptoms,
  getSymptomHistory
} from "../services/symptomService";
import "../App.css";
import "./SymptomChecker.css";

function SymptomChecker({ onBookAppointment }) {
  const [step, setStep] = useState(1);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);

  const chatScrollRef = useRef(null);

  const [formData, setFormData] = useState({
    concernArea: "",
    symptoms: [],
    severityLevel: "",
    duration: "",
    smoking: "no",
    physicalActivity: "moderate",
    sleepQuality: "good",
    knownCondition: "none",
    redFlagAnswers: []
  });

  const concernAreaOptions = useMemo(
    () => [
      { value: "breathing_throat", label: "Breathing, cold, or throat problems" },
      { value: "stomach_digestion", label: "Stomach or digestion problems" },
      { value: "body_pain", label: "Body pain, muscle, or joint problems" },
      { value: "head_balance", label: "Headache, dizziness, or balance problems" },
      { value: "general_unwell", label: "Fever, weakness, or feeling generally unwell" },
      { value: "skin", label: "Skin irritation, rash, or itching" },
      { value: "urinary", label: "Urination or lower stomach problems" },
      { value: "stress_sleep", label: "Stress, sleep, or emotional well-being concerns" }
    ],
    []
  );

  const symptomOptionsByArea = {
    breathing_throat: [
      "Cough",
      "Fever",
      "Sore throat",
      "Runny nose",
      "Sneezing",
      "Chest pain",
      "Shortness of breath",
      "Wheezing"
    ],
    stomach_digestion: [
      "Stomach pain",
      "Nausea",
      "Vomiting",
      "Diarrhea",
      "Bloating",
      "Heartburn",
      "Constipation",
      "Loss of appetite"
    ],
    body_pain: [
      "Back pain",
      "Joint pain",
      "Muscle cramps",
      "Neck pain",
      "Shoulder pain",
      "Body stiffness",
      "Swelling",
      "Trouble moving"
    ],
    head_balance: [
      "Headache",
      "Dizziness",
      "Blurred vision",
      "Nausea",
      "Confusion",
      "Poor balance",
      "Light sensitivity",
      "Fainting"
    ],
    general_unwell: [
      "Fever",
      "Chills",
      "Weakness",
      "Fatigue",
      "Low energy",
      "Body aches",
      "Sweating",
      "Severe dehydration"
    ],
    skin: [
      "Skin rash",
      "Itching",
      "Redness",
      "Swelling",
      "Dry skin",
      "Skin irritation",
      "Hives",
      "Inflammation"
    ],
    urinary: [
      "Burning when passing urine",
      "Frequent urination",
      "Lower stomach pain",
      "Back pain",
      "Urinary discomfort",
      "Pelvic discomfort",
      "Fever",
      "Urgency to pass urine"
    ],
    stress_sleep: [
      "Stress",
      "Anxiety",
      "Poor sleep",
      "Low mood",
      "Panic feelings",
      "Fatigue",
      "Restlessness",
      "Headache"
    ]
  };

  const redFlagOptions = [
    "Shortness of breath",
    "Chest pain",
    "Confusion",
    "Fainting",
    "Heavy bleeding",
    "Severe dehydration"
  ];

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const response = await getSymptomHistory({});
        setHistory(response.data || []);
      } catch (error) {
        console.error(error);
      }
    };

    loadHistory();
  }, []);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [step, formData, result, message, loading]);

  const chartData = useMemo(() => {
    if (!result?.top3Predictions) return [];
    return result.top3Predictions.map((item) => ({
      name: item.displayName,
      probability: item.probability
    }));
  }, [result]);

  const latestTwoChecks = useMemo(() => {
    return (history || []).slice(0, 2);
  }, [history]);

  const comparisonChartData = useMemo(() => {
    if (latestTwoChecks.length < 2) return [];

    const older = latestTwoChecks[1];
    const latest = latestTwoChecks[0];

    return [
      {
        label: "Previous Check",
        probability: Number(older.probabilityScore || 0),
        riskScore: mapRiskLevelToNumber(older.riskLevel)
      },
      {
        label: "Latest Check",
        probability: Number(latest.probabilityScore || 0),
        riskScore: mapRiskLevelToNumber(latest.riskLevel)
      }
    ];
  }, [latestTwoChecks]);

  const comparisonNote = useMemo(() => {
    if (latestTwoChecks.length < 2) return "";

    const latest = latestTwoChecks[0];
    const previous = latestTwoChecks[1];

    const latestRisk = mapRiskLevelToNumber(latest.riskLevel);
    const previousRisk = mapRiskLevelToNumber(previous.riskLevel);

    if (latestRisk > previousRisk) {
      return "Your latest symptom check suggests a higher level of concern than the previous one. Please monitor your symptoms carefully and seek medical advice if needed.";
    }

    if (latestRisk < previousRisk) {
      return "Your latest symptom check suggests a lower level of concern than the previous one. This may mean your symptoms are improving, but continue to monitor how you feel.";
    }

    if (
      String(latest.predictedCategory || "").toLowerCase() !==
      String(previous.predictedCategory || "").toLowerCase()
    ) {
      return "Your latest symptom check points to a different health area from the previous one. Review the advice carefully and monitor any new or changing symptoms.";
    }

    return "Your latest symptom check is broadly similar to the previous one. If symptoms continue, worsen, or begin to affect daily life more, consider medical review.";
  }, [latestTwoChecks]);

  const getConcernAreaLabel = (value) => {
    return concernAreaOptions.find((item) => item.value === value)?.label || value || "-";
  };

  const getSelectedListText = (items) => {
    if (!items || items.length === 0) return "None selected";
    return items.join(", ");
  };

  const getYesNoLabel = (value) => {
    return value === "yes" ? "Yes" : "No";
  };

  const getSeverityLabel = (value) => {
    if (!value) return "-";
    return value.charAt(0).toUpperCase() + value.slice(1);
  };

  const getKnownConditionLabel = (value) => {
    if (value === "hypertension") return "High blood pressure";
    if (!value) return "-";
    return value.charAt(0).toUpperCase() + value.slice(1);
  };

  const getRiskBadgeClass = (riskLevel) => {
    const value = String(riskLevel || "").toLowerCase();

    if (value === "low") return "status status-confirmed";
    if (value === "moderate") return "status status-pending";
    if (value === "high") return "status status-rejected";

    return "status status-completed";
  };

  const handleFieldChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleConcernAreaSelect = (value) => {
    setFormData((prev) => ({
      ...prev,
      concernArea: value,
      symptoms: []
    }));
  };

  const handleToggleFromList = (fieldName, value) => {
    setFormData((prev) => {
      const exists = prev[fieldName].includes(value);

      if (exists) {
        return {
          ...prev,
          [fieldName]: prev[fieldName].filter((item) => item !== value)
        };
      }

      return {
        ...prev,
        [fieldName]: [...prev[fieldName], value]
      };
    });
  };

  const validateCurrentStep = () => {
    setMessage("");

    if (step === 1 && !formData.concernArea) {
      setMessage("Please choose the option that best matches your main problem.");
      return false;
    }

    if (step === 2 && formData.symptoms.length === 0) {
      setMessage("Please choose at least one symptom.");
      return false;
    }

    if (step === 3 && !formData.severityLevel) {
      setMessage("Please tell us how strong the symptoms feel.");
      return false;
    }

    if (step === 4 && !formData.duration) {
      setMessage("Please tell us how long you have had these symptoms.");
      return false;
    }

    return true;
  };

  const handleNext = () => {
    if (!validateCurrentStep()) return;
    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setMessage("");
    setStep((prev) => Math.max(1, prev - 1));
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep()) return;

    try {
      setLoading(true);
      setMessage("");
      setResult(null);

      const payload = {
        concernArea: formData.concernArea,
        symptoms: formData.symptoms,
        severityLevel: formData.severityLevel,
        duration: formData.duration,
        smoking: formData.smoking,
        physicalActivity: formData.physicalActivity,
        sleepQuality: formData.sleepQuality,
        knownCondition: formData.knownCondition,
        redFlagAnswers: formData.redFlagAnswers
      };

      const response = await submitSymptoms(payload);
      setResult(response.data);
      setStep(7);
    } catch (error) {
      console.error(error);

      if (error.response?.status === 401) {
        setMessage("Your session has expired. Please log in again.");
        return;
      }

      const serverMessage =
        typeof error.response?.data === "string"
          ? error.response.data
          : error.response?.data?.message;

      setMessage(serverMessage || "We could not complete the symptom check. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleStartAgain = () => {
    setStep(1);
    setMessage("");
    setResult(null);
    setFormData({
      concernArea: "",
      symptoms: [],
      severityLevel: "",
      duration: "",
      smoking: "no",
      physicalActivity: "moderate",
      sleepQuality: "good",
      knownCondition: "none",
      redFlagAnswers: []
    });
  };

  const conversationMessages = useMemo(() => {
    const messages = [
      {
        id: "intro-1",
        sender: "bot",
        text: "Hi, I’ll guide you through a short symptom check. Please answer as accurately as you can."
      },
      {
        id: "intro-2",
        sender: "bot",
        text: "This is only for guidance and does not give a medical diagnosis or treatment."
      },
      {
        id: "step-1-q",
        sender: "bot",
        text: "What kind of problem are you having today?"
      }
    ];

    if (formData.concernArea) {
      messages.push({
        id: "step-1-a",
        sender: "user",
        text: getConcernAreaLabel(formData.concernArea)
      });

      messages.push({
        id: "step-2-q",
        sender: "bot",
        text: "Which of these symptoms are you feeling right now?"
      });
    }

    if (formData.symptoms.length > 0 && step >= 3) {
      messages.push({
        id: "step-2-a",
        sender: "user",
        text: getSelectedListText(formData.symptoms)
      });

      messages.push({
        id: "step-3-q",
        sender: "bot",
        text: "How strong do these symptoms feel right now?"
      });
    }

    if (formData.severityLevel && step >= 4) {
      messages.push({
        id: "step-3-a",
        sender: "user",
        text: getSeverityLabel(formData.severityLevel)
      });

      messages.push({
        id: "step-4-q",
        sender: "bot",
        text: "How long have you had these symptoms?"
      });
    }

    if (formData.duration && step >= 5) {
      messages.push({
        id: "step-4-a",
        sender: "user",
        text: formData.duration
      });

      messages.push({
        id: "step-5-q",
        sender: "bot",
        text: "Are any of these serious warning signs happening right now?"
      });
    }

    if (step >= 6) {
      messages.push({
        id: "step-5-a",
        sender: "user",
        text:
          formData.redFlagAnswers.length > 0
            ? getSelectedListText(formData.redFlagAnswers)
            : "None of these warning signs"
      });

      messages.push({
        id: "step-6-q",
        sender: "bot",
        text: "Thank you. I just need a few short background details."
      });

      messages.push({
        id: "step-6-a",
        sender: "user",
        text: `Smoking: ${getYesNoLabel(formData.smoking)} | Activity: ${getSeverityLabel(
          formData.physicalActivity
        )} | Sleep: ${getSeverityLabel(formData.sleepQuality)} | Long-term condition: ${getKnownConditionLabel(
          formData.knownCondition
        )}`
      });
    }

    if (loading) {
      messages.push({
        id: "loading",
        sender: "bot",
        text: "I’m checking your answers and preparing your result..."
      });
    }

    return messages;
  }, [formData, step, loading]);

  const renderInlineReplyArea = () => {
    if (step === 1) {
      return (
        <div style={{ marginTop: "18px" }}>
          <div className="symptom-option-grid">
            {concernAreaOptions.map((item) => (
              <button
                key={item.value}
                type="button"
                className={
                  formData.concernArea === item.value
                    ? "symptom-option-btn active"
                    : "symptom-option-btn"
                }
                onClick={() => handleConcernAreaSelect(item.value)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      );
    }

    if (step === 2) {
      return (
        <div style={{ marginTop: "18px" }}>
          <p className="symptom-card-subtitle" style={{ marginBottom: "12px" }}>
            Choose one or more symptoms:
          </p>
          <div className="symptom-option-grid">
            {(symptomOptionsByArea[formData.concernArea] || []).map((symptom) => (
              <button
                key={symptom}
                type="button"
                className={
                  formData.symptoms.includes(symptom)
                    ? "symptom-option-btn active"
                    : "symptom-option-btn"
                }
                onClick={() => handleToggleFromList("symptoms", symptom)}
              >
                {symptom}
              </button>
            ))}
          </div>
        </div>
      );
    }

    if (step === 3) {
      return (
        <div style={{ marginTop: "18px" }}>
          <div className="symptom-option-grid three-col">
            {["mild", "moderate", "severe"].map((level) => (
              <button
                key={level}
                type="button"
                className={
                  formData.severityLevel === level
                    ? "symptom-option-btn active"
                    : "symptom-option-btn"
                }
                onClick={() =>
                  setFormData((prev) => ({ ...prev, severityLevel: level }))
                }
              >
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </button>
            ))}
          </div>
        </div>
      );
    }

    if (step === 4) {
      return (
        <div style={{ marginTop: "18px" }}>
          <div className="symptom-option-grid three-col">
            {["1-3 days", "3-7 days", "7+ days"].map((item) => (
              <button
                key={item}
                type="button"
                className={
                  formData.duration === item
                    ? "symptom-option-btn active"
                    : "symptom-option-btn"
                }
                onClick={() =>
                  setFormData((prev) => ({ ...prev, duration: item }))
                }
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      );
    }

    if (step === 5) {
      return (
        <div style={{ marginTop: "18px" }}>
          <p className="symptom-card-subtitle" style={{ marginBottom: "12px" }}>
            Choose any that apply. If none apply, continue.
          </p>
          <div className="symptom-option-grid">
            {redFlagOptions.map((item) => (
              <button
                key={item}
                type="button"
                className={
                  formData.redFlagAnswers.includes(item)
                    ? "symptom-option-btn active"
                    : "symptom-option-btn"
                }
                onClick={() => handleToggleFromList("redFlagAnswers", item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      );
    }

    if (step === 6) {
      return (
        <div style={{ marginTop: "18px" }}>
          <div className="form-grid two-col">
            <div>
              <label>Do you smoke?</label>
              <select
                name="smoking"
                value={formData.smoking}
                onChange={handleFieldChange}
              >
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
            </div>

            <div>
              <label>How active are you most days?</label>
              <select
                name="physicalActivity"
                value={formData.physicalActivity}
                onChange={handleFieldChange}
              >
                <option value="low">Low</option>
                <option value="moderate">Moderate</option>
                <option value="active">Active</option>
              </select>
            </div>

            <div>
              <label>How has your sleep been recently?</label>
              <select
                name="sleepQuality"
                value={formData.sleepQuality}
                onChange={handleFieldChange}
              >
                <option value="poor">Poor</option>
                <option value="average">Average</option>
                <option value="good">Good</option>
              </select>
            </div>

            <div>
              <label>Do you have any long-term health condition?</label>
              <select
                name="knownCondition"
                value={formData.knownCondition}
                onChange={handleFieldChange}
              >
                <option value="none">None</option>
                <option value="asthma">Asthma</option>
                <option value="diabetes">Diabetes</option>
                <option value="hypertension">High blood pressure</option>
                <option value="allergy">Allergy</option>
              </select>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="symptom-page">
      <div className="booking-header-card">
        <p className="booking-eyebrow">AI Symptom Checker</p>
        <h2 className="booking-title">Health Chat Assistant</h2>
        <p className="booking-subtitle">
          Answer a few simple questions in chat form and receive a patient-friendly
          health summary, risk level, next-step advice, and visual prediction results.
        </p>
      </div>

      <div className="upload-card" style={{ marginBottom: "20px" }}>
        <h3 className="upload-section-title">Clinical Advisory Notice</h3>
        <p className="dashboard-subtitle">
          This symptom check is for information and guidance only. It does not
          give a medical diagnosis, treatment plan, or prescription. If your
          symptoms are severe, getting worse, lasting longer than expected, or
          causing concern, please seek medical advice from a qualified healthcare
          professional.
        </p>
      </div>

      {step !== 7 && (
        <div
          className="symptom-step-card"
          style={{
            padding: "0",
            overflow: "hidden",
            marginBottom: "18px"
          }}
        >
          <div
            style={{
              borderBottom: "1px solid rgba(148, 163, 184, 0.2)",
              padding: "16px 20px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}
          >
            <div>
              <p className="symptom-step-label" style={{ marginBottom: "4px" }}>
                Conversation
              </p>
              <h3 className="symptom-step-title" style={{ marginBottom: 0 }}>
                Symptom Check Chat
              </h3>
            </div>

            <span className="status status-pending">
              Step {step} of 6
            </span>
          </div>

          <div
            ref={chatScrollRef}
            style={{
              maxHeight: "620px",
              overflowY: "auto",
              padding: "20px",
              background: "rgba(248, 250, 252, 0.35)"
            }}
          >
            {conversationMessages.map((item) => (
              <div
                key={item.id}
                style={{
                  display: "flex",
                  justifyContent: item.sender === "bot" ? "flex-start" : "flex-end",
                  marginBottom: "14px"
                }}
              >
                <div
                  style={{
                    maxWidth: "78%",
                    padding: "12px 16px",
                    borderRadius: "18px",
                    background:
                      item.sender === "bot"
                        ? "white"
                        : "linear-gradient(135deg, #2563eb, #1d4ed8)",
                    color: item.sender === "bot" ? "#0f172a" : "white",
                    boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
                    lineHeight: 1.5
                  }}
                >
                  <div
                    style={{
                      fontSize: "12px",
                      opacity: item.sender === "bot" ? 0.7 : 0.85,
                      marginBottom: "4px",
                      fontWeight: 600
                    }}
                  >
                    {item.sender === "bot" ? "Health Assistant" : "You"}
                  </div>
                  <div>{item.text}</div>
                </div>
              </div>
            ))}

            {message && (
              <div style={{ marginTop: "8px" }}>
                <div className="auth-message">{message}</div>
              </div>
            )}

            <div
              style={{
                marginTop: "12px",
                paddingTop: "16px",
                borderTop: "1px solid rgba(148, 163, 184, 0.2)"
              }}
            >
              {renderInlineReplyArea()}

              <div
                className="symptom-step-actions"
                style={{ marginTop: "18px", paddingTop: 0 }}
              >
                {step > 1 && (
                  <button type="button" className="btn-secondary" onClick={handleBack}>
                    Back
                  </button>
                )}

                {step < 6 ? (
                  <button type="button" className="btn-primary" onClick={handleNext}>
                    Send Answer
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn-green"
                    onClick={handleSubmit}
                    disabled={loading}
                  >
                    {loading ? "Checking..." : "Get My Result"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {step === 7 && result && (
        <div className="symptom-result-layout">
          <div className="symptom-result-main">
            <div className="symptom-result-hero">
              <div>
                <p className="symptom-step-label">Main Result</p>
                <h3 className="symptom-result-title">
                  {result.topCategoryDisplayName || "Health summary"}
                </h3>
                <p className="symptom-result-text">
                  {result.advisoryNote}
                </p>
              </div>

              <span className={getRiskBadgeClass(result.riskLevel)}>
                {result.riskLevel} Risk
              </span>
            </div>

            {result.redFlagDetected && (
              <div className="auth-message" style={{ marginBottom: "20px" }}>
                <strong>Urgent Care Notice:</strong> If you have severe breathing trouble,
                strong chest pain, fainting, confusion, heavy bleeding, or any quickly
                worsening symptoms, seek urgent medical care immediately.
              </div>
            )}

            <div className="symptom-chart-card">
              <h4 className="symptom-card-title">Most Likely Health Areas</h4>
              <p className="symptom-card-subtitle">
                These are the health areas most closely linked to the answers you gave.
              </p>

              <div className="symptom-chart-wrapper">
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart
                    data={chartData}
                    layout="vertical"
                    margin={{ top: 10, right: 20, left: 20, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 100]} />
                    <YAxis type="category" dataKey="name" width={180} />
                    <Tooltip formatter={(value) => `${value}%`} />
                    <Bar dataKey="probability" radius={[0, 6, 6, 0]}>
                      {chartData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={["#3b82f6", "#10b981", "#f59e0b"][index % 3]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {latestTwoChecks.length >= 2 && (
              <div className="symptom-comparison-card">
                <div className="symptom-comparison-top">
                  <div>
                    <h4 className="symptom-card-title">Compare Your Last Two Checks</h4>
                    <p className="symptom-card-subtitle">
                      This helps you see whether your recent symptom result looks better,
                      worse, or similar compared with the previous check.
                    </p>
                  </div>
                </div>

                <div className="symptom-comparison-summary-grid">
                  <div className="symptom-comparison-box">
                    <p className="symptom-comparison-label">Latest Main Health Area</p>
                    <h4 className="symptom-comparison-value">
                      {latestTwoChecks[0].predictedCategory || "-"}
                    </h4>
                  </div>

                  <div className="symptom-comparison-box">
                    <p className="symptom-comparison-label">Previous Main Health Area</p>
                    <h4 className="symptom-comparison-value">
                      {latestTwoChecks[1].predictedCategory || "-"}
                    </h4>
                  </div>

                  <div className="symptom-comparison-box">
                    <p className="symptom-comparison-label">Latest Risk Level</p>
                    <h4 className="symptom-comparison-value">
                      {latestTwoChecks[0].riskLevel || "-"}
                    </h4>
                  </div>

                  <div className="symptom-comparison-box">
                    <p className="symptom-comparison-label">Previous Risk Level</p>
                    <h4 className="symptom-comparison-value">
                      {latestTwoChecks[1].riskLevel || "-"}
                    </h4>
                  </div>
                </div>

                <div className="symptom-comparison-chart-wrap">
                  <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={comparisonChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="label" />
                      <YAxis yAxisId="left" domain={[0, 100]} />
                      <YAxis yAxisId="right" orientation="right" domain={[0, 3]} />
                      <Tooltip />
                      <Legend />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="probability"
                        name="Confidence"
                        stroke="#3b82f6"
                        strokeWidth={3}
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="riskScore"
                        name="Risk Level"
                        stroke="#ef4444"
                        strokeWidth={3}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="symptom-comparison-note">
                  <p>{comparisonNote}</p>
                </div>
              </div>
            )}

            <div className="symptom-prediction-stack">
              {result.top3Predictions?.map((item) => (
                <div key={item.categoryKey} className="symptom-prediction-card">
                  <div className="symptom-prediction-top">
                    <div>
                      <h4 className="symptom-card-title">{item.displayName}</h4>
                      <p className="symptom-card-subtitle">
                        {item.shortDescription}
                      </p>
                    </div>

                    <div className="symptom-probability-pill">
                      {item.probability}%
                    </div>
                  </div>

                  <div className="symptom-condition-block">
                    <p className="symptom-condition-label">
                      This may sometimes be linked with:
                    </p>

                    <div className="symptom-condition-list">
                      {item.commonConditions?.map((condition) => (
                        <span key={condition} className="symptom-condition-chip">
                          {condition}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {result.explanationPoints?.length > 0 && (
              <div className="upload-card" style={{ marginTop: "20px" }}>
                <h4 className="symptom-card-title">Why this result was suggested</h4>
                <ul className="upload-help-list">
                  {result.explanationPoints.map((point, index) => (
                    <li key={index}>{point}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="symptom-result-side">
            <div className="symptom-side-card">
              <h4 className="symptom-card-title">Symptoms You Entered</h4>
              <p className="symptom-card-subtitle">
                {result.enteredSymptoms || "No symptoms recorded"}
              </p>
            </div>

            <div className="symptom-side-card">
              <h4 className="symptom-card-title">What You Should Do Next</h4>
              <p className="symptom-card-subtitle">{result.advisoryNote}</p>
            </div>

            {result.redFlagDetected && result.redFlagReasons?.length > 0 && (
              <div className="symptom-side-card">
                <h4 className="symptom-card-title">Important Warning Signs</h4>
                <ul className="upload-help-list">
                  {result.redFlagReasons.map((reason, index) => (
                    <li key={index}>{reason}</li>
                  ))}
                </ul>
              </div>
            )}

            {(String(result.riskLevel || "").toLowerCase() === "high" ||
              String(result.urgencyLevel || "").toLowerCase() === "urgent") && (
              <div className="symptom-side-card">
                <h4 className="symptom-card-title">Recommended Next Step</h4>
                <p className="symptom-card-subtitle">
                  Based on your answers, it would be a good idea to arrange medical review.
                </p>

                <button
                  type="button"
                  className="btn-danger symptom-full-btn"
                  onClick={onBookAppointment}
                >
                  Book Appointment
                </button>
              </div>
            )}

            <div className="symptom-side-card">
              <h4 className="symptom-card-title">Clinical Advisory Notice</h4>
              <p className="symptom-card-subtitle">
                {result.disclaimer}
              </p>
            </div>

            <div className="symptom-side-card">
              <h4 className="symptom-card-title">Run Another Check</h4>
              <button
                type="button"
                className="btn-primary symptom-full-btn"
                onClick={handleStartAgain}
              >
                Start Again
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function mapRiskLevelToNumber(riskLevel) {
  const value = String(riskLevel || "").toLowerCase();

  if (value === "low") return 1;
  if (value === "moderate") return 2;
  if (value === "high") return 3;
  return 0;
}

export default SymptomChecker;