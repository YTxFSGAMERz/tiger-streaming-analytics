import React from 'react';
import { Database, Clock, RefreshCw, Layers } from 'lucide-react';

export default function RollupsTable({ rollups = [] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        padding: '1.25rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
            <Database size={20} color="var(--tiger-cyan)" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>
              Tiger Data Continuous Aggregates (`time_bucket`)
            </h3>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Unlike standard PostgreSQL materialized views which require expensive full recalculations, Tiger Data Continuous Aggregates automatically downsample streaming data incrementally in real time as events enter active chunks.
          </p>
        </div>

        <div style={{
          background: 'var(--bg-dark)',
          border: '1px solid var(--border-color)',
          padding: '0.5rem 0.9rem',
          borderRadius: '8px',
          fontSize: '0.78rem',
          fontFamily: 'var(--font-mono)',
          color: 'var(--tiger-green)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <RefreshCw size={14} className="animate-spin" />
          <span>Real-Time Extension Active</span>
        </div>
      </div>

      {/* DDL Code preview */}
      <div style={{
        background: 'var(--bg-panel)',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        padding: '1rem 1.25rem'
      }}>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 600 }}>
          Continuous Aggregate Definition (Tiger Data Hypertable DDL):
        </div>
        <pre style={{
          background: 'var(--bg-dark)',
          padding: '0.75rem 1rem',
          borderRadius: '8px',
          color: '#a5f3fc',
          fontSize: '0.76rem',
          overflowX: 'auto',
          lineHeight: 1.5
        }}>
{`CREATE MATERIALIZED VIEW telemetry_summary_5s
WITH (timescaledb.continuous) AS
SELECT time_bucket('5 seconds', time) AS bucket,
       device_id,
       avg(temperature) as avg_temp,
       max(temperature) as max_temp,
       min(temperature) as min_temp,
       count(*) as samples
FROM live_telemetry_stream
GROUP BY bucket, device_id;

-- Add automatic background refresh policy
SELECT add_continuous_aggregate_policy('telemetry_summary_5s',
  start_offset => INTERVAL '1 hour',
  end_offset   => INTERVAL '5 seconds',
  schedule_interval => INTERVAL '5 seconds');`}
        </pre>
      </div>

      {/* Live Continuous Rollups Table */}
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
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>
            Live Materialized Rollup Windows (`5-Second Buckets`)
          </h4>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
            {rollups.length} continuous windows maintained
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', fontFamily: 'var(--font-mono)' }}>
            <thead>
              <tr style={{ background: 'var(--bg-dark)', color: 'var(--text-muted)', textAlign: 'left', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '0.65rem 0.85rem' }}>TIME BUCKET (UTC)</th>
                <th style={{ padding: '0.65rem 0.85rem' }}>AVG METRIC</th>
                <th style={{ padding: '0.65rem 0.85rem' }}>MAX METRIC</th>
                <th style={{ padding: '0.65rem 0.85rem' }}>MIN METRIC</th>
                <th style={{ padding: '0.65rem 0.85rem' }}>SAMPLES INGESTED</th>
                <th style={{ padding: '0.65rem 0.85rem' }}>STORAGE LAYER</th>
              </tr>
            </thead>
            <tbody>
              {rollups.slice(-12).reverse().map((r, i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)', color: '#fff' }}>
                  <td style={{ padding: '0.65rem 0.85rem', color: 'var(--tiger-cyan)' }}>
                    {r.bucket ? r.bucket.split('T')[1].slice(0, 8) + ' UTC' : '—'}
                  </td>
                  <td style={{ padding: '0.65rem 0.85rem', fontWeight: 700 }}>
                    {r.avg}°C
                  </td>
                  <td style={{ padding: '0.65rem 0.85rem', color: 'var(--tiger-orange)' }}>
                    {r.max}°C
                  </td>
                  <td style={{ padding: '0.65rem 0.85rem', color: 'var(--tiger-green)' }}>
                    {r.min}°C
                  </td>
                  <td style={{ padding: '0.65rem 0.85rem', color: 'var(--text-muted)' }}>
                    {r.samples} pings
                  </td>
                  <td style={{ padding: '0.65rem 0.85rem' }}>
                    <span style={{
                      fontSize: '0.7rem',
                      background: 'rgba(16, 185, 129, 0.1)',
                      color: 'var(--tiger-green)',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px'
                    }}>
                      Columnar Compressed
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
