import express from 'express';
import cors from 'cors';
import { WebSocketServer, WebSocket } from 'ws';
import http from 'http';

const app = express();
const PORT = process.env.PORT || 3006;

app.use(cors());
app.use(express.json());

// Streaming State
const STREAM_CONFIG = {
  running: true,
  rateHz: 25, // events per second
  feedType: 'iot', // 'iot' | 'crypto' | 'api'
  totalIngested: 45280,
  p99LatencyMs: 1.84,
  anomalyThreshold: 90.0,
  lastAnomalyAt: null,
  activeChunks: 4,
  compressionRatio: '93.1%'
};

// Device list for IoT simulation
const IOT_DEVICES = ['turbine-01', 'compressor-04', 'pump-12', 'generator-07'];
const CRYPTO_PAIRS = ['TIGR/USD', 'BTC/USDT', 'ETH/USDT', 'SOL/USDT'];
const API_SERVICES = ['auth-service', 'payment-gateway', 'telemetry-collector', 'vector-index'];

// In-Memory Ring Buffer for Time-Series (keeps latest 200 events for high-speed charting)
const eventRingBuffer = [];
const MAX_BUFFER = 200;

// Continuous Aggregates Buffer (5-second time_bucket rollups)
const rollupsBuffer = [];
const MAX_ROLLUPS = 40;

// Helper to generate a realistic telemetry event
function generateEvent(isAnomaly = false) {
  const now = new Date();
  const timestamp = now.toISOString();

  if (STREAM_CONFIG.feedType === 'iot') {
    const device = IOT_DEVICES[Math.floor(Math.random() * IOT_DEVICES.length)];
    const baseTemp = device === 'turbine-01' ? 72 : 65;
    const temp = isAnomaly 
      ? +(baseTemp + 25 + Math.random() * 15).toFixed(2)
      : +(baseTemp + (Math.sin(Date.now() / 5000) * 8) + (Math.random() * 3 - 1.5)).toFixed(2);
    
    const vibration = isAnomaly
      ? +(8.5 + Math.random() * 4).toFixed(3)
      : +(2.1 + (Math.cos(Date.now() / 4000) * 0.8) + (Math.random() * 0.4 - 0.2)).toFixed(3);

    const pressure = +(140 + Math.random() * 15).toFixed(1);
    const rpm = Math.floor(3400 + Math.random() * 200);

    const isAlert = temp > STREAM_CONFIG.anomalyThreshold || vibration > 7.0;
    if (isAlert) {
      STREAM_CONFIG.lastAnomalyAt = timestamp;
    }

    return {
      type: 'iot',
      time: timestamp,
      device_id: device,
      temperature: temp,
      vibration: vibration,
      pressure: pressure,
      rpm: rpm,
      status: isAlert ? 'CRITICAL_ANOMALY' : 'NORMAL',
      chunk_id: '_hyper_2_4_chunk'
    };
  } else if (STREAM_CONFIG.feedType === 'crypto') {
    const pair = CRYPTO_PAIRS[Math.floor(Math.random() * CRYPTO_PAIRS.length)];
    const basePrice = pair.startsWith('TIGR') ? 142.50 : pair.startsWith('BTC') ? 94200 : 3450;
    const price = isAnomaly
      ? +(basePrice * (1 + (Math.random() > 0.5 ? 0.08 : -0.08))).toFixed(2)
      : +(basePrice * (1 + (Math.sin(Date.now() / 6000) * 0.015) + (Math.random() * 0.004 - 0.002))).toFixed(2);
    
    return {
      type: 'crypto',
      time: timestamp,
      symbol: pair,
      price: price,
      volume: +(Math.random() * 15 + 0.5).toFixed(4),
      bid: +(price * 0.9995).toFixed(2),
      ask: +(price * 1.0005).toFixed(2),
      chunk_id: '_hyper_3_1_chunk'
    };
  } else {
    // API edge events
    const service = API_SERVICES[Math.floor(Math.random() * API_SERVICES.length)];
    const latency = isAnomaly ? Math.floor(850 + Math.random() * 400) : Math.floor(18 + Math.random() * 35);
    const status = isAnomaly ? 503 : Math.random() > 0.04 ? 200 : 429;
    return {
      type: 'api',
      time: timestamp,
      service: service,
      latency_ms: latency,
      status_code: status,
      endpoint: '/v1/telemetry/ingest',
      chunk_id: '_hyper_4_2_chunk'
    };
  }
}

// Pre-fill initial ring buffer
const nowMs = Date.now();
for (let i = MAX_BUFFER; i >= 0; i--) {
  const t = new Date(nowMs - i * 400).toISOString();
  eventRingBuffer.push({
    type: 'iot',
    time: t,
    device_id: IOT_DEVICES[i % IOT_DEVICES.length],
    temperature: +(68 + Math.sin(i / 10) * 7 + Math.random() * 2).toFixed(2),
    vibration: +(2.2 + Math.cos(i / 8) * 0.6).toFixed(3),
    pressure: +(142 + Math.random() * 8).toFixed(1),
    rpm: 3450 + Math.floor(Math.random() * 100),
    status: 'NORMAL',
    chunk_id: '_hyper_2_4_chunk'
  });
}

// Generate continuous 5-second aggregate rollups
function updateRollups() {
  const now = new Date();
  const bucketTime = new Date(Math.floor(now.getTime() / 5000) * 5000).toISOString();

  // Calculate stats from recent ring buffer
  const recentSlice = eventRingBuffer.slice(-25);
  if (recentSlice.length === 0) return;

  const temps = recentSlice.map(e => e.temperature || (e.price ? e.price / 1000 : e.latency_ms || 50));
  const avgTemp = +(temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(2);
  const maxTemp = +Math.max(...temps).toFixed(2);
  const minTemp = +Math.min(...temps).toFixed(2);

  // If last bucket is same, update it, else push new
  const lastBucket = rollupsBuffer[rollupsBuffer.length - 1];
  if (lastBucket && lastBucket.bucket === bucketTime) {
    lastBucket.avg = avgTemp;
    lastBucket.max = Math.max(lastBucket.max, maxTemp);
    lastBucket.min = Math.min(lastBucket.min, minTemp);
    lastBucket.samples += recentSlice.length;
  } else {
    rollupsBuffer.push({
      bucket: bucketTime,
      avg: avgTemp,
      max: maxTemp,
      min: minTemp,
      samples: recentSlice.length
    });
    if (rollupsBuffer.length > MAX_ROLLUPS) {
      rollupsBuffer.shift();
    }
  }
}

// Pre-fill rollups
for (let i = MAX_ROLLUPS; i >= 0; i--) {
  const bTime = new Date(nowMs - i * 5000).toISOString();
  rollupsBuffer.push({
    bucket: bTime,
    avg: +(68 + Math.sin(i / 3) * 6).toFixed(2),
    max: +(72 + Math.sin(i / 3) * 6 + 2.5).toFixed(2),
    min: +(64 + Math.sin(i / 3) * 6 - 2.5).toFixed(2),
    samples: 125
  });
}

// HTTP Server & WebSocket Server
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  // Send initial snapshot
  ws.send(JSON.stringify({
    type: 'SNAPSHOT',
    config: STREAM_CONFIG,
    recentEvents: eventRingBuffer.slice(-50),
    rollups: rollupsBuffer
  }));

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      if (data.type === 'SET_CONFIG') {
        Object.assign(STREAM_CONFIG, data.config);
      }
    } catch (e) {}
  });
});

function broadcast(data) {
  const payload = JSON.stringify(data);
  for (const client of wss.clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  }
}

// Background Stream Producer loop
let anomalyFlag = false;

setInterval(() => {
  if (!STREAM_CONFIG.running) return;

  // Ingest batch according to rateHz (e.g. 25 events/sec -> 1 event every 40ms)
  const isAnomaly = anomalyFlag;
  anomalyFlag = false;

  const event = generateEvent(isAnomaly);
  STREAM_CONFIG.totalIngested += 1;
  STREAM_CONFIG.p99LatencyMs = +(1.5 + Math.random() * 0.7).toFixed(2);

  eventRingBuffer.push(event);
  if (eventRingBuffer.length > MAX_BUFFER) {
    eventRingBuffer.shift();
  }

  updateRollups();

  // Broadcast to all connected WebSockets
  broadcast({
    type: 'EVENT',
    event,
    stats: {
      totalIngested: STREAM_CONFIG.totalIngested,
      rateHz: STREAM_CONFIG.rateHz,
      p99LatencyMs: STREAM_CONFIG.p99LatencyMs,
      lastAnomalyAt: STREAM_CONFIG.lastAnomalyAt,
      activeChunks: STREAM_CONFIG.activeChunks,
      compressionRatio: STREAM_CONFIG.compressionRatio
    }
  });
}, Math.max(10, Math.floor(1000 / STREAM_CONFIG.rateHz)));

// Periodic continuous aggregate update broadcast (every 2.5 seconds)
setInterval(() => {
  broadcast({
    type: 'ROLLUP_UPDATE',
    rollups: rollupsBuffer
  });
}, 2500);

// --- REST Endpoints ---

// 1. Stream Status & Metrics
app.get('/api/stream/status', (req, res) => {
  res.json({
    status: 'ok',
    config: STREAM_CONFIG,
    bufferSize: eventRingBuffer.length,
    latestEvent: eventRingBuffer[eventRingBuffer.length - 1],
    activePartitions: [
      { chunk: '_hyper_2_4_chunk', status: 'Active (Ingesting)', rows: STREAM_CONFIG.totalIngested - 32000, size: '4.2 MB' },
      { chunk: '_hyper_2_3_chunk', status: 'Compressed Columnar', rows: 12500, size: '420 KB' },
      { chunk: '_hyper_2_2_chunk', status: 'Compressed Columnar', rows: 11200, size: '390 KB' },
      { chunk: '_hyper_2_1_chunk', status: 'Compressed Columnar', rows: 10400, size: '375 KB' }
    ]
  });
});

// 2. Recent Events Snapshot
app.get('/api/stream/events', (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  res.json({
    events: eventRingBuffer.slice(-limit),
    totalCount: eventRingBuffer.length
  });
});

// 3. Continuous Aggregate Rollups
app.get('/api/stream/rollups', (req, res) => {
  res.json({
    viewName: 'telemetry_summary_5s',
    window: '5 seconds',
    buckets: rollupsBuffer
  });
});

// 4. Stream Controls (Play, Pause, Rate, Feed, Anomaly)
app.post('/api/stream/control', (req, res) => {
  const { action, rateHz, feedType, triggerAnomaly } = req.body;

  if (action === 'start') STREAM_CONFIG.running = true;
  if (action === 'stop') STREAM_CONFIG.running = false;
  if (rateHz) STREAM_CONFIG.rateHz = Math.min(1000, Math.max(1, parseInt(rateHz)));
  if (feedType) STREAM_CONFIG.feedType = feedType;
  if (triggerAnomaly) {
    anomalyFlag = true;
  }

  broadcast({
    type: 'CONFIG_CHANGED',
    config: STREAM_CONFIG
  });

  res.json({
    status: 'ok',
    config: STREAM_CONFIG,
    anomalyTriggered: !!triggerAnomaly
  });
});

// 5. Instant SQL Query Lab
app.post('/api/query/sql', (req, res) => {
  const { sql = '' } = req.body;
  const startTime = Date.now();
  const lower = sql.toLowerCase();

  let rows = [];
  let executionPlan = [];
  let description = '';

  if (lower.includes('time_bucket') || lower.includes('rollup')) {
    rows = rollupsBuffer.slice(-15).map(r => ({
      bucket: r.bucket,
      avg_temperature: `${r.avg}°C`,
      max_temperature: `${r.max}°C`,
      min_temperature: `${r.min}°C`,
      sample_count: r.samples
    }));
    executionPlan = [
      "Custom Scan (ChunkAppend) on continuous aggregate 'telemetry_summary_5s'",
      "  -> Materialized view cache: 14 buckets scanned in memory",
      "  -> Real-time aggregation of active chunk '_hyper_2_4_chunk' (120 rows)",
      "  Execution Time: 0.384 ms"
    ];
    description = "Continuous Aggregate time_bucket('5 seconds', time) query with real-time aggregate extension";

  } else if (lower.includes('device') || lower.includes('group by device')) {
    rows = IOT_DEVICES.map(d => {
      const devEvents = eventRingBuffer.filter(e => e.device_id === d);
      const avg = devEvents.length > 0 
        ? (devEvents.reduce((acc, c) => acc + (c.temperature || 70), 0) / devEvents.length).toFixed(2)
        : '68.50';
      return {
        device_id: d,
        total_pings: devEvents.length * 14 + 1200,
        avg_temp: `${avg}°C`,
        status: avg > 80 ? 'WARNING' : 'HEALTHY',
        last_ping: new Date().toISOString()
      };
    });
    executionPlan = [
      "HashAggregate  (cost=14.50..18.20 rows=4 width=48)",
      "  Group Key: device_id",
      "  -> Custom Scan (ChunkAppend) on live_telemetry_stream",
      "     Chunks scanned: 1, Chunks skipped: 3 (Pruned by partition index)",
      "  Execution Time: 0.512 ms"
    ];
    description = "Device grouping query with chunk pruning across partitions";

  } else if (lower.includes('anomaly') || lower.includes('critical') || lower.includes('where status')) {
    rows = eventRingBuffer.filter(e => e.status === 'CRITICAL_ANOMALY').slice(-10);
    if (rows.length === 0) {
      rows = [{
        message: "No critical anomalies currently in the active ring buffer. Click 'Inject Anomaly' to trigger!"
      }];
    }
    executionPlan = [
      "Bitmap Heap Scan on live_telemetry_stream  (cost=4.20..12.30 rows=2 width=64)",
      "  Recheck Cond: (status = 'CRITICAL_ANOMALY'::text)",
      "  -> Bitmap Index Scan on idx_status_time",
      "  Execution Time: 0.298 ms"
    ];
    description = "Index scan on anomaly telemetry status filter";

  } else {
    // Default: recent 10 records
    rows = eventRingBuffer.slice(-10);
    executionPlan = [
      "Limit  (cost=0.00..0.85 rows=10 width=92)",
      "  -> Custom Scan (ChunkAppend) on live_telemetry_stream (reverse scan)",
      "     -> Index Scan Backward using live_telemetry_time_idx on _hyper_2_4_chunk",
      "  Execution Time: 0.186 ms"
    ];
    description = "Reverse index scan on active Hypertable chunk with limit 10";
  }

  const durationMs = Date.now() - startTime;

  res.json({
    status: 'ok',
    sql,
    description,
    rowCount: rows.length,
    executionTimeMs: durationMs || 1,
    executionPlan,
    data: rows
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

server.listen(PORT, () => {
  console.log(`🐯 Tiger Real-Time Streaming Analytics Server running on http://localhost:${PORT}`);
  console.log(`⚡ WebSocket streaming endpoint live on ws://localhost:${PORT}`);
});
