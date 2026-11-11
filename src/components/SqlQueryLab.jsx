import React, { useState } from 'react';
import { Terminal, Play, Zap, Clock, CheckCircle2, ChevronRight, Layers } from 'lucide-react';

export default function SqlQueryLab() {
  const PRESET_QUERIES = [
    {
      title: 'Continuous Aggregate 5s Rollup',
      sql: "SELECT bucket, avg_temperature, max_temperature, sample_count FROM telemetry_summary_5s ORDER BY bucket DESC LIMIT 10;"
    },
    {
      title: 'Fleet Grouping & Chunk Pruning',
      sql: "SELECT device_id, count(*) AS total_pings, avg(temperature) AS avg_temp FROM live_telemetry_stream GROUP BY device_id;"
    },
    {
      title: 'Filter Critical Anomaly Spikes',
      sql: "SELECT time, device_id, temperature, vibration, status FROM live_telemetry_stream WHERE status = 'CRITICAL_ANOMALY' LIMIT 10;"
    },
    {
      title: 'High-Speed Ingestion Tail',
      sql: "SELECT * FROM live_telemetry_stream ORDER BY time DESC LIMIT 10;"
    }
  ];

  const [activeSql, setActiveSql] = useState(PRESET_QUERIES[0].sql);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleRun = async (queryToRun) => {
    const q = queryToRun || activeSql;
    if (!q.trim() || loading) return;

    setLoading(true);
    try {
      const res = await fetch('/api/query/sql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sql: q })
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setResult({
        error: err.message,
        executionTimeMs: 0,
        rowCount: 0,
        data: []
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header */}
      <div style={{
        background: 'var(--bg-panel)',
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
            <Terminal size={20} color="var(--tiger-orange)" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>
              Instant Tiger Data SQL Query Lab
            </h3>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Query live ingested streams and continuous aggregates using standard SQL with sub-millisecond planning.
          </p>
        </div>

        <button
          onClick={() => handleRun()}
          disabled={loading}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'var(--tiger-orange)',
            border: 'none',
            color: '#fff',
            padding: '0.6rem 1.25rem',
            borderRadius: '8px',
            fontSize: '0.85rem',
            fontWeight: 700,
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          <Play size={16} />
          <span>{loading ? 'Executing...' : 'Run Query'}</span>
        </button>
      </div>

      {/* Preset Pills */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Presets:</span>
        {PRESET_QUERIES.map((p, idx) => (
          <button
            key={idx}
            onClick={() => {
              setActiveSql(p.sql);
              handleRun(p.sql);
            }}
            style={{
              background: activeSql === p.sql ? 'rgba(249, 115, 22, 0.15)' : 'var(--bg-panel)',
              border: `1px solid ${activeSql === p.sql ? 'var(--tiger-orange)' : 'var(--border-color)'}`,
              color: activeSql === p.sql ? 'var(--tiger-orange)' : 'var(--text-muted)',
              padding: '0.35rem 0.75rem',
              borderRadius: '6px',
              fontSize: '0.76rem',
              fontWeight: 500,
              transition: 'all 0.15s ease'
            }}
          >
            {p.title}
          </button>
        ))}
      </div>

      {/* SQL Editor Area */}
      <div style={{
        background: 'var(--bg-dark)',
        border: '1px solid var(--border-color)',
        borderRadius: '10px',
        padding: '0.85rem 1rem'
      }}>
        <textarea
          rows={3}
          value={activeSql}
          onChange={(e) => setActiveSql(e.target.value)}
          placeholder="Write SQL query (e.g. SELECT * FROM live_telemetry_stream...)"
          style={{
            width: '100%',
            background: 'transparent',
            border: 'none',
            color: '#a5f3fc',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.85rem',
            outline: 'none',
            resize: 'vertical',
            lineHeight: 1.5
          }}
        />
      </div>

      {/* Query Results & Execution Plan */}
      {result && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Metadata bar */}
          <div style={{
            background: 'var(--bg-panel)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            padding: '0.65rem 1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.78rem',
            fontFamily: 'var(--font-mono)'
          }}>
            <div style={{ display: 'flex', gap: '1.25rem' }}>
              <span style={{ color: 'var(--tiger-green)' }}>
                ✓ {result.rowCount || 0} rows returned
              </span>
              <span style={{ color: 'var(--tiger-cyan)' }}>
                ⚡ Execution Time: {result.executionTimeMs} ms
              </span>
            </div>
            <span style={{ color: 'var(--text-dim)' }}>
              Tiger Query Planner
            </span>
          </div>

          {/* Execution Plan Accordion */}
          {result.executionPlan && result.executionPlan.length > 0 && (
            <div style={{
              background: 'var(--bg-dark)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              padding: '0.75rem 1rem'
            }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.35rem', fontWeight: 600 }}>
                EXPLAIN ANALYZE (Execution Plan & Chunk Pruning):
              </div>
              <pre style={{
                color: '#86efac',
                fontSize: '0.75rem',
                lineHeight: 1.5,
                overflowX: 'auto'
              }}>
                {result.executionPlan.join('\n')}
              </pre>
            </div>
          )}

          {/* Table Data */}
          {result.data && result.data.length > 0 && (
            <div style={{
              background: 'var(--bg-panel)',
              border: '1px solid var(--border-color)',
              borderRadius: '10px',
              overflow: 'hidden'
            }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem', fontFamily: 'var(--font-mono)' }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-dark)', color: 'var(--text-muted)', textAlign: 'left', borderBottom: '1px solid var(--border-color)' }}>
                      {Object.keys(result.data[0]).map((key, kIdx) => (
                        <th key={kIdx} style={{ padding: '0.65rem 0.85rem' }}>{key.toUpperCase()}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {result.data.map((row, rIdx) => (
                      <tr key={rIdx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)', color: '#fff' }}>
                        {Object.values(row).map((val, vIdx) => (
                          <td key={vIdx} style={{ padding: '0.65rem 0.85rem' }}>
                            {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
