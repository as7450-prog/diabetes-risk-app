import React from 'react';

const SMOKING_OPTIONS = [
  { label: 'Never Smoked', value: 0 },
  { label: 'Former Smoker', value: 1 },
  { label: 'Current Smoker', value: 2 },
  { label: 'Ever Smoked', value: 3 },
  { label: 'Not Current', value: 4 },
];

function Slider({ label, unit, value, min, max, step, onChange }) {
  const pct = ((value - min) / (max - min)) * 100;

  const handleTextChange = (e) => {
    const raw = e.target.value;
    if (raw === '' || raw === '-') return;
    let num = parseFloat(raw);
    if (isNaN(num)) return;
    num = Math.min(max, Math.max(min, num));
    // Round to step precision
    const decimals = step < 1 ? String(step).split('.')[1]?.length || 1 : 0;
    onChange(parseFloat(num.toFixed(decimals)));
  };

  return (
    <div className="slider-group">
      <div className="slider-label">
        <span>{label}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <input
            type="number"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={handleTextChange}
            style={{
              width: 64,
              padding: '3px 8px',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              fontFamily: 'inherit',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: 'var(--primary)',
              background: 'var(--surface-alt)',
              outline: 'none',
              textAlign: 'right',
              MozAppearance: 'textfield',
            }}
          />
          {unit && <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 500 }}>{unit}</span>}
        </div>
      </div>
      <div style={{ position: 'relative' }}>
        <div className="slider-track">
          <div
            style={{
              position: 'absolute',
              left: 0, top: 0,
              height: '100%',
              width: `${pct}%`,
              borderRadius: 3,
              background: 'linear-gradient(90deg, #6366f1, #818cf8)',
              pointerEvents: 'none',
              transition: 'width .1s ease',
            }}
          />
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          style={{ position: 'relative', zIndex: 2, background: 'transparent', marginTop: -13 }}
        />
      </div>
    </div>
  );
}

function Toggle({ label, checked, onChange }) {
  return (
    <div className="toggle-group">
      <span className="toggle-text">{label}</span>
      <label className="toggle-switch">
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked ? 1 : 0)} />
        <span className="toggle-slider" />
      </label>
    </div>
  );
}

export default function PatientProfile({ vitals, onVitalChange }) {
  return (
    <div className="card" id="patient-profile">
      <div className="card-title">
        <span className="icon">&#128100;</span> Patient Profile
      </div>

      <Slider
        label="Age"
        unit="yrs"
        value={vitals.age}
        min={1}
        max={100}
        step={1}
        onChange={(v) => onVitalChange('age', v)}
      />
      <Slider
        label="BMI"
        unit="kg/m²"
        value={vitals.bmi}
        min={10}
        max={60}
        step={0.1}
        onChange={(v) => onVitalChange('bmi', v)}
      />
      <Slider
        label="Blood Glucose"
        unit="mg/dL"
        value={vitals.blood_glucose_level}
        min={60}
        max={300}
        step={1}
        onChange={(v) => onVitalChange('blood_glucose_level', v)}
      />
      <Slider
        label="HbA1c Level"
        unit="%"
        value={vitals.HbA1c_level}
        min={3}
        max={15}
        step={0.05}
        onChange={(v) => onVitalChange('HbA1c_level', v)}
      />

      <div className="select-group">
        <label>Hypertension (0 = No, 1 = Yes)</label>
        <input
          type="number"
          min={0}
          max={1}
          step={1}
          value={vitals.hypertension}
          onChange={(e) => onVitalChange('hypertension', Math.min(1, Math.max(0, parseInt(e.target.value) || 0)))}
          style={{
            width: '100%', padding: '10px 14px',
            border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
            fontFamily: 'inherit', fontSize: '0.82rem', color: 'var(--text)',
            background: 'var(--surface-alt)', outline: 'none',
          }}
        />
      </div>

      <div className="select-group">
        <label>Heart Disease (0 = No, 1 = Yes)</label>
        <input
          type="number"
          min={0}
          max={1}
          step={1}
          value={vitals.heart_disease}
          onChange={(e) => onVitalChange('heart_disease', Math.min(1, Math.max(0, parseInt(e.target.value) || 0)))}
          style={{
            width: '100%', padding: '10px 14px',
            border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
            fontFamily: 'inherit', fontSize: '0.82rem', color: 'var(--text)',
            background: 'var(--surface-alt)', outline: 'none',
          }}
        />
      </div>

      <div className="select-group">
        <label>Gender</label>
        <select
          value={vitals.gender_encoded}
          onChange={(e) => onVitalChange('gender_encoded', parseInt(e.target.value))}
        >
          <option value={0}>Female</option>
          <option value={1}>Male</option>
        </select>
      </div>

      <div className="select-group">
        <label>Smoking History</label>
        <select
          value={vitals.smoking_history_encoded}
          onChange={(e) => onVitalChange('smoking_history_encoded', parseInt(e.target.value))}
        >
          {SMOKING_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
