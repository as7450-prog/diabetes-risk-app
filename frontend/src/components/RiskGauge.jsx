import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* Semi-circle gauge constants */
const CX = 140, CY = 130;
const R = 110;
const START_ANGLE = Math.PI;       // 180°  (left)
const END_ANGLE = 0;            //   0°  (right)
const STROKE = 14;

/**
 * Attempt to generate a semi-circle arc path for the background.
 */
function arcPath(cx, cy, r, startAngle, endAngle) {
    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy - r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy - r * Math.sin(endAngle);
    return `M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2}`;
}

function getColor(risk) {
    if (risk <= 30) return '#10b981';
    if (risk <= 60) return '#f59e0b';
    return '#f43f5e';
}

function getStatus(risk) {
    if (risk <= 25) return { text: 'Normal', cls: 'safe' };
    if (risk <= 50) return { text: 'Pre-Diabetic', cls: 'caution' };
    return { text: 'High Risk', cls: 'critical' };
}

export default function RiskGauge({ risk, loading }) {
    const clamp = Math.max(0, Math.min(100, risk ?? 0));
    const needleAngle = START_ANGLE - (clamp / 100) * Math.PI;  // radians
    const needleX = CX + (R - 10) * Math.cos(needleAngle);
    const needleY = CY - (R - 10) * Math.sin(needleAngle);
    const color = getColor(clamp);
    const status = getStatus(clamp);

    /* Gradient stop positions along the arc */
    const progressPath = arcPath(CX, CY, R, START_ANGLE, END_ANGLE);

    return (
        <div className="card" id="risk-core" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div className="card-title">
                <span className="icon">&#9829;</span> Risk Assessment
            </div>

            <div className="gauge-wrapper">
                <svg className="gauge-svg" width="280" height="170" viewBox="0 0 280 170">
                    {/* Background arc */}
                    <path
                        d={progressPath}
                        fill="none"
                        stroke="#e2e8f0"
                        strokeWidth={STROKE}
                        strokeLinecap="round"
                    />

                    {/* Colored segments */}
                    <defs>
                        <linearGradient id="gauge-grad" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#10b981" />
                            <stop offset="45%" stopColor="#f59e0b" />
                            <stop offset="100%" stopColor="#f43f5e" />
                        </linearGradient>
                    </defs>

                    <path
                        d={progressPath}
                        fill="none"
                        stroke="url(#gauge-grad)"
                        strokeWidth={STROKE}
                        strokeLinecap="round"
                        strokeDasharray={`${(clamp / 100) * Math.PI * R} ${Math.PI * R}`}
                        style={{ transition: 'stroke-dasharray .6s ease' }}
                    />

                    {/* Tick marks */}
                    {[0, 25, 50, 75, 100].map((tick) => {
                        const a = START_ANGLE - (tick / 100) * Math.PI;
                        const ox = CX + (R + 16) * Math.cos(a);
                        const oy = CY - (R + 16) * Math.sin(a);
                        return (
                            <text
                                key={tick}
                                x={ox} y={oy}
                                textAnchor="middle"
                                dominantBaseline="central"
                                fontSize="10" fontWeight="600" fill="#94a3b8"
                            >
                                {tick}
                            </text>
                        );
                    })}

                    {/* Animated needle */}
                    <motion.line
                        x1={CX}
                        y1={CY}
                        x2={needleX}
                        y2={needleY}
                        stroke={color}
                        strokeWidth={3}
                        strokeLinecap="round"
                        initial={false}
                        animate={{ x2: needleX, y2: needleY }}
                        transition={{ type: 'spring', stiffness: 60, damping: 15 }}
                    />
                    {/* Needle hub */}
                    <circle cx={CX} cy={CY} r={8} fill={color} />
                    <circle cx={CX} cy={CY} r={4} fill="#fff" />
                </svg>

                {/* Score */}
                <motion.div
                    className="gauge-score"
                    style={{ color }}
                    key={clamp}
                    initial={{ scale: 1.15, opacity: 0.6 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.35 }}
                >
                    {clamp}%
                </motion.div>
                <div className="gauge-label">Diabetes Risk Score</div>

                {/* Status badge */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={status.text}
                        className={`status-badge ${status.cls}`}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.25 }}
                    >
                        <span className="status-badge-dot" />
                        {status.text}
                    </motion.div>
                </AnimatePresence>

                {loading && (
                    <div className="loading-indicator" style={{ marginTop: 12 }}>
                        <span className="loading-dot" /><span className="loading-dot" /><span className="loading-dot" />
                        <span>Calculating...</span>
                    </div>
                )}
            </div>
        </div>
    );
}
