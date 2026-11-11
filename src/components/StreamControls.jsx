import React, { useState } from 'react';
import { Play, Pause, AlertOctagon, Gauge, Sliders, Radio } from 'lucide-react';

export default function StreamControls({ config, onControl }) {
  const [anomalySent, setAnomalySent] = useState(false);

  const rates = [10, 25, 50, 100, 250];
  const feeds = [
    { id: 'iot', label: 'Industrial IoT Telemetry', sub: 'Turbines, Pumps, Heat Sensors' },
    { id: 'crypto', label: 'Financial Market Tickers', sub: 'TIGR, BTC, ETH Spreads' },
    { id: 'api', label: 'Edge API Gateway', sub: 'Latency & Status Codes' }
  ];

  const handleTriggerAnomaly = () => {
    onControl({ triggerAnomaly: true });
    setAnomalySent(true);
    setTimeout(() => setAnomalySent(false), 2000);
  };

  return (
    <div style={{
      background: 'var(--bg-panel)',
      border: '1px solid var(--border-color)',
      borderRadius: '12px',
      padding: '1.25rem 1.5rem',
      marginBottom: '1.25rem',
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '1.25rem'
    }}>
      {/* Play/Pause & Rate */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => onControl({ action: config?.running ? 'stop' : 'start' })}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: config?.running ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
            border: `1px solid ${config?.running ? 'var(--tiger-red)' : 'var(--tiger-green)'}`,
            color: config?.running ? 'var(--tiger-red)' : 'var(--tiger-green)',
            padding: '0.6rem 1.1rem',
            borderRadius: '8px',
            fontSize: '0.85rem',
            fontWeight: 700,
            transition: 'all 0.15s ease'
          }}
        >
          {config?.running ? <Pause size={16} /> : <Play size={16} />}
          <span>{config?.running ? 'Pause Live Feed' : 'Resume Feed'}</span>
        </button>

        {/* Rate selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Gauge size={14} /> Rate:
          </span>
          <div style={{ display: 'flex', gap: '0.25rem' }}>
            {rates.map(r => (
              <button
                key={r}
                onClick={() => onControl({ rateHz: r })}
                style={{
                  background: config?.rateHz === r ? 'var(--tiger-orange)' : 'var(--bg-dark)',
                  color: config?.rateHz === r ? '#fff' : 'var(--text-muted)',
                  border: '1px solid var(--border-color)',
                  padding: '0.35rem 0.65rem',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 600
                }}
              >
                {r} Hz
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Feed selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <Radio size={14} /> Source Feed:
        </span>
        <div style={{ display: 'flex', gap: '0.35rem' }}>
          {feeds.map(f => (
            <button
              key={f.id}
              onClick={() => onControl({ feedType: f.id })}
              style={{
                background: config?.feedType === f.id ? 'rgba(6, 182, 212, 0.15)' : 'var(--bg-dark)',
                color: config?.feedType === f.id ? 'var(--tiger-cyan)' : 'var(--text-muted)',
                border: `1px solid ${config?.feedType === f.id ? 'var(--tiger-cyan)' : 'var(--border-color)'}`,
                padding: '0.35rem 0.75rem',
                borderRadius: '6px',
                fontSize: '0.76rem',
                fontWeight: 600
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Anomaly Injector */}
      <div>
        <button
          onClick={handleTriggerAnomaly}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: anomalySent ? 'var(--tiger-red)' : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            color: '#fff',
            border: 'none',
            padding: '0.6rem 1.15rem',
            borderRadius: '8px',
            fontSize: '0.82rem',
            fontWeight: 700,
            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.35)',
            transform: anomalySent ? 'scale(0.98)' : 'scale(1)',
            transition: 'all 0.15s ease'
          }}
        >
          <AlertOctagon size={16} />
          <span>{anomalySent ? 'Spike Injected!' : '🚨 Inject Anomaly Spike'}</span>
        </button>
      </div>
    </div>
  );
}
