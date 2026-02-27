# 🩺 Diabetes Risk Engine

**An AI-powered, real-time clinical decision-support web application for diabetes risk prediction.**

🌐 **Live App:** [diabetes-risk-app-kappa.vercel.app](https://diabetes-risk-app-kappa.vercel.app)
🔧 **API:** [diabetes-risk-app-oiec.onrender.com](https://diabetes-risk-app-oiec.onrender.com)

---

## 📌 Overview

The **Diabetes Risk Engine** is a full-stack web application that helps clinicians assess a patient's diabetes risk in real-time. By adjusting patient vitals (age, BMI, blood glucose, HbA1c, etc.) on an interactive dashboard, clinicians instantly see:

- A **risk gauge** (0–100%) showing current diabetes probability
- A **feature contribution chart** ranking which factors drive the risk most
- An **improvement simulation** showing projected risk after a 10% reduction in BMI and blood glucose

---

## 🎯 Problem Statement & Motivation

Over **537 million adults** worldwide live with diabetes (IDF, 2021), yet most cases are diagnosed late — after irreversible complications have already set in. Clinicians at the point of care lack fast, explainable, and actionable risk tools.

We built the Diabetes Risk Engine to:
- Surface patient-specific risk scores instantly without complex setups
- Make ML predictions **explainable** — showing *why* a patient is high-risk
- Simulate the **impact of lifestyle interventions** so patients and clinicians can plan together

---

## 🧠 How ML Is Integrated

```
Patient Vitals (form input)
        ↓
React Frontend (Vite)
        ↓  [POST /predict — JSON]
Flask REST API (Gunicorn on Render)
        ↓
Random Forest Classifier (scikit-learn)
        ↓
Risk Probability + Feature Contributions + Improvement Simulation
        ↓
Live Dashboard Update (Recharts + Framer Motion)
```

- **Model:** Random Forest Classifier (`scikit-learn`)
- **Training:** Kaggle clinical diabetes dataset
- **Features:** Age, BMI, Blood Glucose, HbA1c, Hypertension, Heart Disease, Gender, Smoking History
- **Serialization:** `joblib` — model loaded once at API startup for fast inference
- **Explainability:** Feature importances × normalized patient values → ranked contribution scores

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────┐
│              User's Browser                 │
│   React 19 + Vite + Recharts + Framer      │
│   Hosted on: Vercel (CDN)                   │
└──────────────────┬──────────────────────────┘
                   │  POST /predict (JSON)
┌──────────────────▼──────────────────────────┐
│           Flask REST API                     │
│   Python + Flask + Gunicorn                 │
│   Hosted on: Render (Free Tier)             │
│                                             │
│   ┌─────────────────────────────────────┐   │
│   │   Random Forest Classifier          │   │
│   │   model.joblib + feature_list.joblib│   │
│   └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

| Layer       | Technology                              |
|-------------|-----------------------------------------|
| Frontend    | React 19, Vite, Recharts, Framer Motion |
| Backend     | Python, Flask, Flask-CORS, Gunicorn     |
| ML          | Scikit-learn, Random Forest, Joblib     |
| Data        | Pandas, NumPy                           |
| Deployment  | Vercel (frontend) + Render (backend)    |

---

## 📁 Project Structure

```
diabetes-risk-app/
├── app.py                    # Flask API — /predict endpoint
├── requirements.txt          # Python dependencies
├── render.yaml               # Render deployment config
├── kaggle_output/
│   └── clinical_model_export/
│       ├── model.joblib       # Trained Random Forest model
│       └── feature_list.joblib# Ordered feature list
└── frontend/
    ├── src/
    │   ├── App.jsx            # Main dashboard layout
    │   └── components/
    │       ├── PatientProfile.jsx   # Vitals input panel
    │       ├── RiskGauge.jsx        # Animated risk display
    │       └── HealthOutlook.jsx    # Contributions + improvement
    ├── package.json
    └── vite.config.js
```

---

## 🚀 Running Locally

### Backend

```bash
# Install dependencies
pip install -r requirements.txt

# Start Flask dev server
python app.py
# API runs at http://localhost:5000
```

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
# App runs at http://localhost:5173
```

> The frontend defaults to `http://localhost:5000/predict` when no `VITE_API_URL` env variable is set.

---

## ⚠️ Ethical, Bias & Limitation Considerations

| Consideration | Details |
|---|---|
| **Data Bias** | Trained on a specific clinical dataset — may not generalize to all demographics or geographies |
| **Not Diagnostic** | Decision-support tool only — final diagnosis must be made by a licensed clinician |
| **Gender Encoding** | Binary (0/1) — does not capture full gender spectrum |
| **Explainability** | Heuristic feature contributions, not SHAP-based — less precise than post-hoc methods |
| **Privacy** | Fully stateless — no patient data is stored or transmitted outside the session |

---

## 💼 Business Feasibility

- **Market:** $1.8B clinical decision-support software market, growing at 12% CAGR
- **Target Users:** Primary care clinics, telemedicine platforms, preventive health programs
- **Revenue Model:** SaaS subscription for clinics, white-label API licensing, EHR integration fees
- **Cost:** Near-zero on free tiers; scales cheaply on paid Render/Vercel plans

---

## 🗺️ Future Roadmap

- [ ] SHAP-based explainability for precise feature attribution
- [ ] LLM natural language risk explanations (GenAI)
- [ ] EHR integration (FHIR/HL7)
- [ ] Patient history & longitudinal trend analysis
- [ ] Mobile-responsive redesign
- [ ] Multi-language support

---

## 📄 License

MIT License — free to use, modify, and distribute.

---

*Built for Praxis 2.0 Hackathon on Unstop.*
