import React, { useState, useEffect, useRef, useCallback } from 'react';
import PatientProfile from './components/PatientProfile';
import RiskGauge from './components/RiskGauge';
import HealthOutlook from './components/HealthOutlook';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/predict';
const DEBOUNCE_MS = 300;

const INITIAL_VITALS = {
  age: 45,
  bmi: 25.0,
  blood_glucose_level: 110,
  HbA1c_level: 5.5,
  hypertension: 0,
  heart_disease: 0,
  gender_encoded: 0,
  smoking_history_encoded: 0,
};

export default function App() {
  const [vitals, setVitals] = useState(INITIAL_VITALS);
  const [currentRisk, setCurrentRisk] = useState(null);
  const [improvementRisk, setImprovementRisk] = useState(null);
  const [contributions, setContributions] = useState([]);
  const [improvedValues, setImprovedValues] = useState({});
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);

  /* ── Update a single vital ──────────────────────────────────── */
  const handleVitalChange = useCallback((key, value) => {
    setVitals((prev) => ({ ...prev, [key]: value }));
  }, []);

  /* ── Debounced fetch to /predict ────────────────────────────── */
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(vitals),
        });
        if (!res.ok) throw new Error(`API ${res.status}`);
        const data = await res.json();
        setCurrentRisk(data.current_risk);
        setImprovementRisk(data.improvement_risk);
        setContributions(data.feature_contributions || []);
        setImprovedValues(data.improved_values || {});
      } catch (err) {
        console.error('Predict error:', err);
      } finally {
        setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => clearTimeout(debounceRef.current);
  }, [vitals]);

  /* ── Render ─────────────────────────────────────────────────── */
  return (
    <>
      {/* Header */}
      <header className="app-header">
        <div className="app-header-icon">D</div>
        <h1>Diabetes <span>Risk Engine</span></h1>
        <span className="app-header-sub">Clinical Decision-Support Workspace</span>
      </header>

      {/* Three-column dashboard */}
      <main className="app-dashboard">
        <PatientProfile vitals={vitals} onVitalChange={handleVitalChange} />
        <RiskGauge risk={currentRisk} loading={loading} />
        <HealthOutlook
          currentRisk={currentRisk}
          improvementRisk={improvementRisk}
          contributions={contributions}
          improvedValues={improvedValues}
          vitals={vitals}
        />
      </main>
    </>
  );
}
