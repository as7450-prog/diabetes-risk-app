import React from 'react';
import { motion } from 'framer-motion';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Cell, RadarChart, Radar, PolarGrid,
    PolarAngleAxis, PolarRadiusAxis, Legend,
} from 'recharts';

const BAR_COLORS = ['#f43f5e', '#f97316', '#f59e0b', '#6366f1', '#818cf8', '#94a3b8', '#cbd5e1', '#e2e8f0'];

/* ── Tooltip ──────────────────────────────────────────────────── */
function CustomTooltip({ active, payload }) {
    if (!active || !payload?.length) return null;
    return (
        <div style={{
            background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8,
            padding: '8px 14px', boxShadow: '0 4px 6px rgba(0,0,0,.06)', fontSize: '0.8rem',
        }}>
            <strong>{payload[0].payload.feature}</strong>
            <div style={{ color: '#64748b' }}>Score: {payload[0].value}</div>
        </div>
    );
}

/* ── Tips Engine ──────────────────────────────────────────────── */
function getTips(currentRisk, vitals) {
    const tips = [];
    if (vitals?.bmi > 25) tips.push({ icon: '🏃', text: 'Aim for 150 min of moderate exercise weekly to lower BMI.' });
    if (vitals?.blood_glucose_level > 130) tips.push({ icon: '🥗', text: 'Reduce refined carbs and sugar to bring glucose under control.' });
    if (vitals?.HbA1c_level > 5.7) tips.push({ icon: '🩺', text: 'Schedule an HbA1c retest in 3 months to track progress.' });
    if (vitals?.smoking_history_encoded >= 2) tips.push({ icon: '🚭', text: 'Quitting smoking can reduce diabetes risk by up to 40%.' });
    if (tips.length < 3) tips.push({ icon: '💧', text: 'Stay hydrated — drink at least 8 glasses of water daily.' });
    if (tips.length < 3) tips.push({ icon: '😴', text: 'Get 7-9 hours of quality sleep to regulate blood sugar.' });
    if (tips.length < 3) tips.push({ icon: '🧘', text: 'Practice stress management — cortisol spikes raise glucose.' });
    return tips.slice(0, 3);
}

export default function HealthOutlook({ currentRisk, improvementRisk, contributions, improvedValues, vitals }) {
    const reduction = currentRisk != null && improvementRisk != null
        ? Math.max(0, currentRisk - improvementRisk) : null;
    const relReduction = currentRisk > 0 && reduction != null
        ? ((reduction / currentRisk) * 100).toFixed(1) : 0;

    const tips = getTips(currentRisk, vitals);

    /* Comparison data for the radar chart */
    const comparisonData = vitals ? [
        { metric: 'BMI', current: vitals.bmi, improved: improvedValues?.bmi ?? vitals.bmi * 0.9 },
        { metric: 'Glucose', current: vitals.blood_glucose_level, improved: improvedValues?.blood_glucose_level ?? vitals.blood_glucose_level * 0.9 },
        { metric: 'HbA1c', current: vitals.HbA1c_level, improved: vitals.HbA1c_level },
        { metric: 'Age', current: vitals.age, improved: vitals.age },
    ] : [];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* ─── What-If Card ─────────────────────────────────────── */}
            <div className="card whatif-card" id="what-if-simulator">
                <div className="card-title">
                    <span className="icon">&#128301;</span> What-If Simulator
                </div>
                <p style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: 16, lineHeight: 1.5 }}>
                    Projected health if BMI &amp; Blood Glucose are reduced by <strong>10%</strong>.
                </p>

                <div className="whatif-row">
                    <span className="whatif-label">Current Risk</span>
                    <motion.span className="whatif-value current" key={currentRisk} initial={{ opacity: 0.4 }} animate={{ opacity: 1 }}>
                        {currentRisk ?? '—'}%
                    </motion.span>
                </div>
                <div className="whatif-row">
                    <span className="whatif-label">Projected Risk</span>
                    <motion.span className="whatif-value projected" key={improvementRisk} initial={{ opacity: 0.4, y: 4 }} animate={{ opacity: 1, y: 0 }}>
                        {improvementRisk ?? '—'}%
                    </motion.span>
                </div>

                {reduction != null && (
                    <motion.div className="whatif-change" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15 }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 19V5M5 12l7-7 7 7" />
                        </svg>
                        {reduction.toFixed(1)} pts lower ({relReduction}% improvement)
                    </motion.div>
                )}
            </div>

            {/* ─── Dynamic Risk Drivers ─────────────────────────────── */}
            <div className="card" id="impact-chart">
                <div className="card-title">
                    <span className="icon">&#128202;</span> Risk Drivers (Live)
                </div>
                <div className="impact-chart-wrapper">
                    <ResponsiveContainer width="100%" height={320}>
                        <BarChart
                            data={contributions && contributions.length ? contributions : []}
                            layout="vertical"
                            margin={{ top: 0, right: 8, bottom: 0, left: 8 }}
                            barCategoryGap="18%"
                        >
                            <CartesianGrid horizontal={false} stroke="#f1f5f9" />
                            <XAxis
                                type="number"
                                tickFormatter={(v) => v.toFixed(1)}
                                tick={{ fontSize: 11, fill: '#94a3b8' }}
                                axisLine={false} tickLine={false}
                            />
                            <YAxis
                                type="category" dataKey="feature"
                                tick={{ fontSize: 12, fill: '#334155', fontWeight: 500 }}
                                axisLine={false} tickLine={false} width={100}
                            />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99,102,241,0.04)' }} />
                            <Bar dataKey="score" radius={[0, 6, 6, 0]} animationDuration={500} minPointSize={2}>
                                {(contributions || []).map((_, i) => (
                                    <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* ─── Current vs Improved Radar ────────────────────────── */}
            <div className="card" id="comparison-chart">
                <div className="card-title">
                    <span className="icon">&#128200;</span> Current vs Improved
                </div>
                <ResponsiveContainer width="100%" height={240}>
                    <RadarChart data={comparisonData} outerRadius={80}>
                        <PolarGrid stroke="#e2e8f0" />
                        <PolarAngleAxis dataKey="metric" tick={{ fontSize: 12, fill: '#334155', fontWeight: 500 }} />
                        <PolarRadiusAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
                        <Radar name="Current" dataKey="current" stroke="#6366f1" fill="#6366f1" fillOpacity={0.25} animationDuration={600} />
                        <Radar name="Improved" dataKey="improved" stroke="#10b981" fill="#10b981" fillOpacity={0.25} animationDuration={600} />
                        <Legend iconSize={10} wrapperStyle={{ fontSize: '0.78rem' }} />
                    </RadarChart>
                </ResponsiveContainer>
            </div>

            {/* ─── Infographics: Health Tips ────────────────────────── */}
            <div className="card" id="health-tips">
                <div className="card-title">
                    <span className="icon">&#128161;</span> Health Tips
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {tips.map((tip, i) => (
                        <motion.div
                            key={tip.text}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            style={{
                                display: 'flex', alignItems: 'flex-start', gap: 10,
                                padding: '10px 14px', borderRadius: 8,
                                background: i === 0 ? '#fff1f2' : i === 1 ? '#fffbeb' : '#ecfdf5',
                                fontSize: '0.82rem', fontWeight: 500, color: '#334155', lineHeight: 1.45,
                            }}
                        >
                            <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>{tip.icon}</span>
                            <span>{tip.text}</span>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
