import React from 'react';
import { Activity, Database, BarChart3, Terminal, Shield, Zap, Radio } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, wsConnected, stats }) {
  const tabs = [
    { id: 'dashboard', label: 'Streaming Dashboard', icon: BarChart3 },
    { id: 'sql', label: 'Tiger SQL Query Lab', icon: Terminal },
    { id: 'rollups', label: 'Continuous Aggregates', icon: Database },
    { id: 'guide', label: 'MLH Submission Guide', icon: Shield },
  ];

  return (
    <header style={{
      background: 'rgba(17, 24, 39, 0.95)',
      borderBottom: '1px solid var(--border-color)',
      backdropFilter: 'blur(10px)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      padding: '0.75rem 1.5rem'
    }}>
      <div style={{
        maxWidth: '1440px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, #f97316 0%, #dc2626 100%)',
            color: '#fff',
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.4rem',
            boxShadow: '0 4px 14px rgba(249, 115, 22, 0.4)'
          }}>
            🐯
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h1 style={{ fontSize: '1.15rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#fff' }}>
                Tiger Streaming Analytics
              </h1>
              <span style={{
                fontSize: '0.65rem',
                fontWeight: 700,
                background: 'rgba(249, 115, 22, 0.15)',
                color: 'var(--tiger-orange)',
                border: '1px solid rgba(249, 115, 22, 0.3)',
                padding: '0.15rem 0.5rem',
                borderRadius: '999px',
                textTransform: 'uppercase'
              }}>
                MLH Challenge 4
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Real-Time High-Velocity Event Feed & Grafana-Style Live Dashboard
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={{ display: 'flex', gap: '0.35rem', background: 'var(--bg-dark)', padding: '0.25rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 0.9rem',
                  borderRadius: '7px',
                  border: 'none',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  transition: 'all 0.15s ease',
                  background: isActive ? 'var(--tiger-orange)' : 'transparent',
                  color: isActive ? '#fff' : 'var(--text-muted)'
                }}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Stream Health Indicators */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: wsConnected ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            border: `1px solid ${wsConnected ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
            padding: '0.35rem 0.75rem',
            borderRadius: '999px',
            fontSize: '0.75rem',
            color: wsConnected ? 'var(--tiger-green)' : 'var(--tiger-red)'
          }}>
            <div className={wsConnected ? 'live-dot' : 'alert-dot'} />
            <span>{wsConnected ? 'Live Feed: Connected' : 'Feed Offline'}</span>
          </div>

          <div style={{
            fontSize: '0.72rem',
            color: 'var(--text-dim)',
            fontFamily: 'var(--font-mono)'
          }}>
            Vite :5179 | API :3006
          </div>
        </div>
      </div>
    </header>
  );
}
