import React from 'react';
import { Zap, Database, Clock, AlertTriangle, Layers, TrendingUp } from 'lucide-react';

export default function KpiHeader({ stats = {} }) {
  const {
    totalIngested = 45280,
    rateHz = 25,
    p99LatencyMs = 1.84,
    lastAnomalyAt = null,
    activeChunks = 4,
    compressionRatio = '93.1%'
  } = stats;

  const isRecentAnomaly = lastAnomalyAt && (Date.now() - new Date(lastAnomalyAt).getTime() < 8000);

  const kpis = [
    {
      title: 'Ingestion Throughput',
      value: `${rateHz} events/s`,
      sub: `${(rateHz * 60).toLocaleString()} events/min continuous`,
      icon: Zap,
      color: 'var(--tiger-orange)',
      bg: 'rgba(249, 115, 22, 0.1)'
    },
    {
      title: 'Total Ingested Events',
      value: totalIngested.toLocaleString(),
      sub: 'Persisted to Tiger Hypertable',
      icon: Layers,
      color: 'var(--tiger-cyan)',
      bg: 'rgba(6, 182, 212, 0.1)'
    },
    {
      title: 'P99 Ingest Latency',
      value: `${p99LatencyMs} ms`,
      sub: 'Sub-millisecond writes',
      icon: Clock,
      color: 'var(--tiger-green)',
      bg: 'rgba(16, 185, 129, 0.1)'
    },
    {
      title: 'Partitions & Compression',
      value: `${activeChunks} Chunks`,
      sub: `${compressionRatio} storage compaction`,
      icon: Database,
      color: 'var(--tiger-purple)',
      bg: 'rgba(139, 92, 246, 0.1)'
    },
    {
      title: 'Real-Time Health Status',
      value: isRecentAnomaly ? 'ANOMALY ALERT' : 'OPTIMAL',
      sub: isRecentAnomaly ? 'Spike detected via moving bounds' : 'No out-of-bound deviations',
      icon: AlertTriangle,
      color: isRecentAnomaly ? 'var(--tiger-red)' : 'var(--tiger-green)',
      bg: isRecentAnomaly ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.1)',
      isAlert: isRecentAnomaly
    }
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '1rem',
      marginBottom: '1.25rem'
    }}>
      {kpis.map((k, idx) => {
        const Icon = k.icon;
        return (
          <div
            key={idx}
            style={{
              background: 'var(--bg-panel)',
              border: `1px solid ${k.isAlert ? 'var(--tiger-red)' : 'var(--border-color)'}`,
              borderRadius: '12px',
              padding: '1.1rem 1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.6rem',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: k.isAlert ? '0 0 18px rgba(239, 68, 68, 0.25)' : 'none'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                {k.title}
              </span>
              <div style={{
                background: k.bg,
                color: k.color,
                padding: '0.4rem',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Icon size={16} />
              </div>
            </div>

            <div style={{
              fontSize: '1.45rem',
              fontWeight: 800,
              fontFamily: 'var(--font-mono)',
              color: k.color,
              letterSpacing: '-0.02em'
            }}>
              {k.value}
            </div>

            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
              {k.sub}
            </div>
          </div>
        );
      })}
    </div>
  );
}
