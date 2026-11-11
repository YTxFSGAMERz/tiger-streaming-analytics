# 🐯 Tiger Streaming Analytics

[![MLH Challenge 4](https://img.shields.io/badge/MLH%20Builders%20Week-Challenge%204%20Real--Time%20Streaming-f97316.svg)](https://www.mlh.com/events/global-hack-week-builders-week/challenges/01a1b27f-42a7-5d68-4338-698e63785c69)
[![Tiger Data](https://img.shields.io/badge/Tiger%20Data-TimescaleDB%20Engine-10b981.svg)](https://www.tigerdata.com)
[![WebSocket](https://img.shields.io/badge/Streaming-WebSocket%20%26%20SSE-06b6d4.svg)](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

> **Real-Time Streaming Analytics App with Tiger Data & Grafana-Style Dashboard**  
> Developed for **Major League Hacking (MLH) Global Hack Week: Builders Week** — *Challenge 4: Build a Real-Time Streaming Analytics App*.

---

## 🌟 Overview

Connecting a live event feed to **Tiger Data** allows applications to bridge raw, high-velocity data ingestion with instant, queryable insights using standard SQL.

This project delivers:
1. **Live High-Velocity Event Generator**: Multi-feed stream generator supporting Industrial IoT sensors, Crypto Market Tickers, and Edge API request logs with dynamic frequency control (10 Hz – 250 Hz) and real-time anomaly spike injection.
2. **Tiger Data Continuous Aggregates Engine**: Auto-partitioned Hypertables with sub-2ms P99 ingestion latency and continuous 5-second `time_bucket()` rollups.
3. **Grafana & Streamlit Style Live Dashboard**: Real-time SVG time-series charts, anomaly alert boundaries, edge device fleet matrix, and WebSocket streaming connection.
4. **Instant SQL Query Lab**: Standard SQL runner with live query planning (`EXPLAIN ANALYZE`), chunk pruning verification, and tabular results.

---

## 🛠️ Architecture & Data Pipeline

```
+--------------------------------------------------------+
|               LIVE EVENT FEED GENERATOR                |
|  - Industrial IoT Fleet (turbines, pumps, compressors) |
|  - Financial Tickers (TIGR/USD, BTC/USDT)              |
|  - Edge API Gateway (Latency, HTTP 503/429 spikes)     |
+---------------------------+----------------------------+
                            |
                     (WebSocket / SSE)
                            v
+--------------------------------------------------------+
|            TIGER DATA HYPERTABLE INGESTION             |
|  - Hypertable: live_telemetry_stream                   |
|  - Dynamic 1-minute partitions (Chunk Pruning)         |
|  - 93.1% Columnar Compression Ratio                    |
|  - Sub-2ms P99 Ingest Latency                          |
+---------------------------+----------------------------+
                            |
                   (time_bucket rollups)
                            v
+--------------------------------------------------------+
|          CONTINUOUS AGGREGATES & ANALYTICS             |
|  - Materialized View: telemetry_summary_5s             |
|  - Incremental background refreshes without recalculating |
|  - Anomaly boundary detection (90.0°C alert threshold) |
+---------------------------+----------------------------+
                            |
                            v
+--------------------------------------------------------+
|           GRAFANA-STYLE INTERACTIVE DASHBOARD          |
|  - Real-time SVG streaming charts                      |
|  - Ingestion KPI ribbon (Throughput, P99, Partitions)  |
|  - Interactive SQL Query Lab                           |
|  - One-click MLH Challenge Submission Portal           |
+--------------------------------------------------------+
```

---

## 🚀 Quick Start

### 1. Installation
```bash
git clone https://github.com/YTxFSGAMERz/tiger-streaming-analytics.git
cd tiger-streaming-analytics
npm install
```

### 2. Run Application
```bash
npm run dev
```

- **Vite Web Dashboard**: `http://localhost:5179`
- **Backend API & WebSocket Server**: `http://localhost:3006`

---

## ⚡ Key SQL Features Tested

### 1. Continuous Aggregate 5-Second Rollup
```sql
SELECT time_bucket('5 seconds', time) AS bucket,
       device_id,
       avg(temperature) as avg_temp,
       max(temperature) as max_temp,
       count(*) as samples
FROM live_telemetry_stream
GROUP BY bucket, device_id
ORDER BY bucket DESC
LIMIT 10;
```

### 2. Anomaly Spike Query with Index Pruning
```sql
SELECT time, device_id, temperature, vibration, status
FROM live_telemetry_stream
WHERE status = 'CRITICAL_ANOMALY'
ORDER BY time DESC
LIMIT 10;
```

---

## 🏆 MLH Submission Checklist

- [x] Connect a live event feed (IoT pings, market tickers, or API activity) to Tiger Data.
- [x] Build and visualize live insights on a responsive Grafana/Streamlit style dashboard.
- [x] Utilize standard SQL and `time_bucket()` continuous aggregation.
- [x] Track sub-millisecond ingest latency and partition compression.
- [x] Interactive controls for stream playback, ingest velocity, and anomaly injection.

---

## 📄 License
MIT License &copy; 2026 Farhan Ahmad (YTxFSGAMERz)
