import React, { useMemo } from 'react';
import { Activity, Thermometer, Wind, Gauge, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function LiveChartsPanel({ events = [], latestEvent = null, feedType = 'iot' }) {
  // Extract values for the main chart
  const chartData = useMemo(() => {
    const slice = events.slice(-40);
    if (slice.length === 0) return [];
    return slice.map((e, idx) => ({
      idx,
      time: e.time ? new Date(e.time).toLocaleTimeString() : '',
      value: e.temperature !== undefined ? e.temperature : (e.price || e.latency_ms || 50),
      isAnomaly: e.status === 'CRITICAL_ANOMALY' || (e.temperature > 90) || (e.latency_ms > 500)
    }));
  }, [events]);

  const minVal = useMemo(() => {
    if (chartData.length === 0) return 50;
    return Math.floor(Math.min(...chartData.map(d => d.value)) * 0.95);
  }, [chartData]);

  const maxVal = useMemo(() => {
    if (chartData.length === 0) return 100;
    return Math.ceil(Math.max(...chartData.map(d => d.value)) * 1.05);
  }, [chartData]);

  const currentVal = chartData.length > 0 ? chartData[chartData.length - 1].value : 0;
  const avgVal = chartData.length > 0 
    ? +(chartData.reduce((acc, d) => acc + d.value, 0) / chartData.length).toFixed(1)
    : 0;

  // SVG Coordinates calculation
  const width = 800;
  const height = 220;
  const padding = { top: 20, right: 30, bottom: 30, left: 50 };
  const graphWidth = width - padding.left - padding.right;
  const graphHeight = height - padding.top - padding.bottom;

  const points = chartData.map((d, i) => {
    const x = padding.left + (i / Math.max(1, chartData.length - 1)) * graphWidth;
    const yRange = Math.max(1, maxVal - minVal);
    const y = padding.top + graphHeight - ((d.value - minVal) / yRange) * graphHeight;
    return { x, y, ...d };
  });

  const pathD = points.length > 1
    ? points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ')
    : '';

  const areaD = points.length > 1
    ? `${pathD} L ${points[points.length - 1].x.toFixed(1)} ${(padding.top + graphHeight).toFixed(1)} L ${points[0].x.toFixed(1)} ${(padding.top + graphHeight).toFixed(1)} Z`
    : '';

  // Anomaly line coordinate (at 90 if IoT, or 80% height)
  const thresholdVal = feedType === 'iot' ? 90 : (maxVal * 0.88);
  const thresholdY = padding.top + graphHeight - ((thresholdVal - minVal) / Math.max(1, maxVal - minVal)) * graphHeight;

  // Devices summary
  const devices = [
    { name: 'turbine-01', location: 'Turbine Hall A', temp: latestEvent?.device_id === 'turbine-01' ? latestEvent.temperature : 72.4, status: 'Active' },
    { name: 'compressor-04', location: 'Intake Manifold', temp: latestEvent?.device_id === 'compressor-04' ? latestEvent.temperature : 64.8, status: 'Active' },
    { name: 'pump-12', location: 'Coolant Loop B', temp: latestEvent?.device_id === 'pump-12' ? latestEvent.temperature : 66.2, status: 'Active' },
    { name: 'generator-07', location: 'Primary Core', temp: latestEvent?.device_id === 'generator-07' ? latestEvent.temperature : 70.1, status: 'Active' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Main Grafana-style Chart Panel */}
      <div style={{
        background: 'var(--bg-panel)',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        padding: '1.25rem 1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.85rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Activity size={18} color="var(--tiger-orange)" />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff' }}>
              Real-Time Telemetry Stream & Anomaly Boundary
            </h3>
            <span style={{ fontSize: '0.72rem', background: 'rgba(249, 115, 22, 0.15)', color: 'var(--tiger-orange)', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
              Sub-second live feed
            </span>
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Latest: </span>
              <strong style={{ color: currentVal > thresholdVal ? 'var(--tiger-red)' : 'var(--tiger-cyan)' }}>
                {currentVal}{feedType === 'iot' ? '°C' : feedType === 'crypto' ? '$' : 'ms'}
              </strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Avg: </span>
              <strong style={{ color: '#fff' }}>
                {avgVal}{feedType === 'iot' ? '°C' : feedType === 'crypto' ? '$' : 'ms'}
              </strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Max: </span>
              <strong style={{ color: 'var(--tiger-orange)' }}>
                {maxVal}{feedType === 'iot' ? '°C' : feedType === 'crypto' ? '$' : 'ms'}
              </strong>
            </div>
          </div>
        </div>

        {/* SVG Live Chart */}
        <div style={{ width: '100%', overflowX: 'auto', background: 'var(--bg-dark)', borderRadius: '8px', padding: '0.5rem 0' }}>
          <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', minHeight: '200px' }}>
            <defs>
              <linearGradient id="streamGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f97316" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#f97316" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid horizontal lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
              const y = padding.top + graphHeight * pct;
              const val = (maxVal - pct * (maxVal - minVal)).toFixed(0);
              return (
                <g key={i}>
                  <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
                  <text x={padding.left - 8} y={y + 4} fill="#6b7280" fontSize="10" textAnchor="end" fontFamily="monospace">
                    {val}
                  </text>
                </g>
              );
            })}

            {/* Threshold line */}
            {thresholdY >= padding.top && thresholdY <= padding.top + graphHeight && (
              <g>
                <line
                  x1={padding.left}
                  y1={thresholdY}
                  x2={width - padding.right}
                  y2={thresholdY}
                  stroke="#ef4444"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                />
                <text x={width - padding.right} y={thresholdY - 4} fill="#ef4444" fontSize="10" textAnchor="end" fontFamily="monospace" fontWeight="bold">
                  ANOMALY BOUNDARY ({thresholdVal})
                </text>
              </g>
            )}

            {/* Area and Line */}
            {areaD && <path d={areaD} fill="url(#streamGradient)" />}
            {pathD && <path d={pathD} fill="none" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />}

            {/* Data points */}
            {points.map((p, i) => (
              <circle
                key={i}
                cx={p.x}
                cy={p.y}
                r={p.isAnomaly ? 5 : 2}
                fill={p.isAnomaly ? '#ef4444' : '#06b6d4'}
                stroke={p.isAnomaly ? '#fff' : 'none'}
                strokeWidth={p.isAnomaly ? 1.5 : 0}
              />
            ))}
          </svg>
        </div>
      </div>

      {/* Grid: Device Cluster Matrix & Live Ticker */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {/* Device Matrix */}
        <div style={{
          background: 'var(--bg-panel)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.85rem'
        }}>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Gauge size={16} color="var(--tiger-cyan)" />
            <span>Active Edge Device Fleet</span>
          </h4>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            {devices.map((d, i) => {
              const isHot = d.temp > 85;
              return (
                <div
                  key={i}
                  style={{
                    background: 'var(--bg-dark)',
                    border: `1px solid ${isHot ? 'var(--tiger-red)' : 'var(--border-color)'}`,
                    borderRadius: '8px',
                    padding: '0.85rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.35rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <code style={{ fontSize: '0.78rem', color: isHot ? 'var(--tiger-red)' : 'var(--tiger-cyan)', fontWeight: 700 }}>
                      {d.name}
                    </code>
                    <span style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: isHot ? 'var(--tiger-red)' : 'var(--tiger-green)'
                    }} />
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{d.location}</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: isHot ? 'var(--tiger-red)' : '#fff', fontFamily: 'var(--font-mono)' }}>
                    {d.temp}°C
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Incoming Feed Log */}
        <div style={{
          background: 'var(--bg-panel)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.85rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Wind size={16} color="var(--tiger-green)" />
              <span>Ingested Events Feed (Tiger Hypertable)</span>
            </h4>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
              Latest 6 pings
            </span>
          </div>

          <div style={{
            background: 'var(--bg-dark)',
            borderRadius: '8px',
            padding: '0.6rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.4rem',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.72rem',
            maxHeight: '190px',
            overflowY: 'auto'
          }}>
            {events.slice(-6).reverse().map((e, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.35rem 0.5rem',
                  borderRadius: '4px',
                  background: e.status === 'CRITICAL_ANOMALY' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                  borderLeft: `3px solid ${e.status === 'CRITICAL_ANOMALY' ? 'var(--tiger-red)' : 'var(--tiger-green)'}`
                }}
              >
                <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-dim)' }}>
                    {e.time ? e.time.split('T')[1].slice(0, 8) : ''}
                  </span>
                  <span style={{ color: 'var(--tiger-cyan)', fontWeight: 600 }}>
                    {e.device_id || e.symbol || e.service}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                  <span style={{ color: '#fff' }}>
                    {e.temperature ? `${e.temperature}°C` : e.price ? `$${e.price}` : `${e.latency_ms}ms`}
                  </span>
                  <span style={{ color: e.status === 'CRITICAL_ANOMALY' ? 'var(--tiger-red)' : 'var(--text-muted)' }}>
                    {e.status || 'OK'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
