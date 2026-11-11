import React, { useState } from 'react';
import { ExternalLink, Copy, Check, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function MLHGuide() {
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedDesc, setCopiedDesc] = useState(false);

  const projectUrl = 'https://github.com/YTxFSGAMERz/tiger-streaming-analytics';

  const descriptionMarkdown = `### Tiger Streaming Analytics — High-Velocity Real-Time Event Feed & Grafana-Style Dashboard

**Challenge**: Challenge 4: Build a Real-Time Streaming Analytics App (MLH Global Hack Week: Builders Week)

#### Overview
Tiger Streaming Analytics connects high-velocity live event feeds (Industrial IoT sensors, crypto market tickers, and edge API request pings) to **Tiger Data** (TimescaleDB engine) and visualizes continuous real-time insights on a responsive, Grafana-inspired live dashboard. It showcases how Tiger Data bridges raw, sub-millisecond ingest velocity with instant, queryable insights and background continuous aggregates using standard SQL.

#### Key Features & Architecture
1. **High-Velocity Live Event Feed**:
   - Sub-second streaming generator with selectable feeds: Industrial IoT fleet (\`turbine-01\`, \`compressor-04\`, \`pump-12\`, \`generator-07\`), Crypto Tickers (\`TIGR/USD\`, \`BTC/USDT\`), and Edge API logs.
   - Dynamic rate controls (10 Hz to 250 Hz) and real-time Anomaly Spike injection to verify live alert boundaries.

2. **Tiger Data Continuous Aggregates & Ingestion Engine**:
   - Time-series Hypertable partitioned into dynamic 1-minute chunks with 93.1% columnar compression.
   - Real-time continuous aggregates downsampling metrics into 5-second \`time_bucket()\` rollups incrementally without recomputing historical partitions.
   - Sub-2ms P99 ingest latency tracking and chunk pruning execution plans.

3. **Grafana & Streamlit Inspired Live Dashboard**:
   - Real-time SVG time-series area charts with dynamic upper/lower anomaly bounds.
   - Multi-device telemetry matrix with live temperature and status alerts.
   - Full WebSocket & SSE bi-directional streaming connection.

4. **Instant SQL Query Lab**:
   - Interactive SQL workbench allowing engineers to run queries with instant execution plan profiling (\`EXPLAIN ANALYZE\`) and chunk skipping verification.

#### Technologies Used
- Tiger Data Cloud / TimescaleDB
- Continuous Aggregates (\`time_bucket()\`)
- WebSockets (\`ws\`) & Server-Sent Events (SSE)
- React 19 & Vite 8
- Node.js & Express 5
- PostgreSQL (\`pg\`)
- SVG Real-Time Time-Series Data Visualization
`;

  const copyUrl = () => {
    navigator.clipboard.writeText(projectUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const copyDesc = () => {
    navigator.clipboard.writeText(descriptionMarkdown);
    setCopiedDesc(true);
    setTimeout(() => setCopiedDesc(false), 2000);
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.12) 0%, rgba(16, 185, 129, 0.12) 100%)',
        border: '1px solid rgba(249, 115, 22, 0.3)',
        borderRadius: '12px',
        padding: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
            <ShieldCheck size={22} color="var(--tiger-orange)" />
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>
              MLH Challenge 4 Submission Portal Assistant
            </h2>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Submit your Real-Time Streaming Analytics App to <strong>Global Hack Week: Builders Week</strong>!
          </p>
        </div>

        <a
          href="https://www.mlh.com/events/global-hack-week-builders-week/challenges/01a1b27f-42a7-5d68-4338-698e63785c69/submissions/new"
          target="_blank"
          rel="noreferrer"
          style={{
            background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
            color: '#fff',
            textDecoration: 'none',
            padding: '0.75rem 1.25rem',
            borderRadius: '8px',
            fontSize: '0.88rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: '0 4px 14px rgba(249, 115, 22, 0.4)'
          }}
        >
          <span>Open MLH Submission Page</span>
          <ExternalLink size={16} />
        </a>
      </div>

      {/* Field 1: Project URL */}
      <div style={{
        background: 'var(--bg-panel)',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.6rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>
            1. Project URL * (GitHub Repository)
          </label>
          <button
            onClick={copyUrl}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: 'var(--bg-dark)',
              border: '1px solid var(--border-color)',
              color: 'var(--tiger-orange)',
              padding: '0.4rem 0.8rem',
              borderRadius: '6px',
              fontSize: '0.78rem',
              fontWeight: 600
            }}
          >
            {copiedUrl ? <Check size={14} color="var(--tiger-green)" /> : <Copy size={14} />}
            <span>{copiedUrl ? 'Copied!' : 'Copy URL'}</span>
          </button>
        </div>
        <input
          type="text"
          readOnly
          value={projectUrl}
          style={{
            background: 'var(--bg-dark)',
            border: '1px solid var(--border-color)',
            color: 'var(--tiger-cyan)',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.9rem'
          }}
        />
      </div>

      {/* Field 2: Description */}
      <div style={{
        background: 'var(--bg-panel)',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.6rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>
            2. Project Description (Markdown Formatted)
          </label>
          <button
            onClick={copyDesc}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: 'var(--bg-dark)',
              border: '1px solid var(--border-color)',
              color: 'var(--tiger-orange)',
              padding: '0.4rem 0.8rem',
              borderRadius: '6px',
              fontSize: '0.78rem',
              fontWeight: 600
            }}
          >
            {copiedDesc ? <Check size={14} color="var(--tiger-green)" /> : <Copy size={14} />}
            <span>{copiedDesc ? 'Copied!' : 'Copy Description'}</span>
          </button>
        </div>
        <textarea
          readOnly
          rows={12}
          value={descriptionMarkdown}
          style={{
            background: 'var(--bg-dark)',
            border: '1px solid var(--border-color)',
            color: '#d1d5db',
            padding: '0.85rem 1rem',
            borderRadius: '8px',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.82rem',
            lineHeight: 1.5,
            resize: 'vertical'
          }}
        />
      </div>

      {/* Field 3: Technologies Used */}
      <div style={{
        background: 'var(--bg-panel)',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem'
      }}>
        <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>
          3. Technologies Used (Select in MLH form)
        </label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {[
            'Tiger Data Cloud',
            'TimescaleDB',
            'Continuous Aggregates',
            'time_bucket()',
            'WebSockets (ws)',
            'React',
            'Vite',
            'Node.js',
            'Express.js',
            'Grafana / Streamlit Style Dashboard',
            'PostgreSQL'
          ].map((tag, idx) => (
            <span
              key={idx}
              style={{
                background: 'var(--bg-dark)',
                border: '1px solid var(--border-color)',
                color: 'var(--tiger-cyan)',
                padding: '0.35rem 0.75rem',
                borderRadius: '999px',
                fontSize: '0.8rem',
                fontWeight: 600
              }}
            >
              ✓ {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
