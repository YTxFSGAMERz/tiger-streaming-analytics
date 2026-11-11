import React, { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import KpiHeader from './components/KpiHeader';
import StreamControls from './components/StreamControls';
import LiveChartsPanel from './components/LiveChartsPanel';
import RollupsTable from './components/RollupsTable';
import SqlQueryLab from './components/SqlQueryLab';
import MLHGuide from './components/MLHGuide';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [wsConnected, setWsConnected] = useState(false);
  const [events, setEvents] = useState([]);
  const [rollups, setRollups] = useState([]);
  const [stats, setStats] = useState({
    totalIngested: 45280,
    rateHz: 25,
    p99LatencyMs: 1.84,
    lastAnomalyAt: null,
    activeChunks: 4,
    compressionRatio: '93.1%',
    feedType: 'iot',
    running: true
  });

  const wsRef = useRef(null);

  useEffect(() => {
    // 1. Initial snapshot fetch via HTTP in case WS is still connecting
    fetch('/api/stream/status')
      .then(r => r.json())
      .then(data => {
        if (data.config) setStats(data.config);
      })
      .catch(() => {});

    fetch('/api/stream/events?limit=40')
      .then(r => r.json())
      .then(data => {
        if (data.events) setEvents(data.events);
      })
      .catch(() => {});

    fetch('/api/stream/rollups')
      .then(r => r.json())
      .then(data => {
        if (data.buckets) setRollups(data.buckets);
      })
      .catch(() => {});

    // 2. Setup WebSocket connection
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    // When running under vite dev proxy, /ws maps to ws://localhost:3006
    const wsUrl = `${protocol}//${host}/ws`;

    function connectWs() {
      try {
        const socket = new WebSocket(wsUrl);
        wsRef.current = socket;

        socket.onopen = () => {
          setWsConnected(true);
        };

        socket.onmessage = (msg) => {
          try {
            const data = JSON.parse(msg.data);
            if (data.type === 'SNAPSHOT') {
              if (data.config) setStats(data.config);
              if (data.recentEvents) setEvents(data.recentEvents);
              if (data.rollups) setRollups(data.rollups);
            } else if (data.type === 'EVENT') {
              setEvents(prev => [...prev.slice(-100), data.event]);
              if (data.stats) {
                setStats(prev => ({ ...prev, ...data.stats }));
              }
            } else if (data.type === 'ROLLUP_UPDATE') {
              if (data.rollups) setRollups(data.rollups);
            } else if (data.type === 'CONFIG_CHANGED') {
              if (data.config) setStats(data.config);
            }
          } catch (e) {}
        };

        socket.onclose = () => {
          setWsConnected(false);
          // Auto retry after 2.5s
          setTimeout(connectWs, 2500);
        };

        socket.onerror = () => {
          socket.close();
        };
      } catch (e) {
        setWsConnected(false);
      }
    }

    connectWs();

    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  const handleControl = async (controlData) => {
    try {
      const res = await fetch('/api/stream/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(controlData)
      });
      const data = await res.json();
      if (data.config) setStats(data.config);
    } catch (err) {
      console.error('Failed to update stream controls:', err);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-dark)' }}>
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        wsConnected={wsConnected}
        stats={stats}
      />

      <main style={{ flex: 1, padding: '1.5rem', maxWidth: '1440px', width: '100%', margin: '0 auto' }}>
        {/* KPI Strip visible across views */}
        <KpiHeader stats={stats} />

        {/* Dashboard View */}
        {activeTab === 'dashboard' && (
          <div>
            <StreamControls config={stats} onControl={handleControl} />
            <LiveChartsPanel
              events={events}
              latestEvent={events[events.length - 1]}
              feedType={stats.feedType || 'iot'}
            />
          </div>
        )}

        {/* SQL Lab View */}
        {activeTab === 'sql' && <SqlQueryLab />}

        {/* Continuous Aggregates View */}
        {activeTab === 'rollups' && <RollupsTable rollups={rollups} />}

        {/* MLH Submission Guide View */}
        {activeTab === 'guide' && <MLHGuide />}
      </main>

      <footer style={{
        borderTop: '1px solid var(--border-color)',
        padding: '1.25rem 1.5rem',
        textAlign: 'center',
        fontSize: '0.8rem',
        color: 'var(--text-dim)',
        background: 'var(--bg-panel)'
      }}>
        🐯 Tiger Data Cloud &bull; Real-Time Streaming Analytics & Continuous Aggregates &bull; MLH Global Hack Week Challenge 4
      </footer>
    </div>
  );
}
