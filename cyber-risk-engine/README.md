# Unified Personal Cyber Risk Engine

A beginner-friendly prototype of a cyber defense platform that simulates a real cybersecurity monitoring pipeline using a CSV dataset and simple algorithms.

## Pipeline Overview

```
Log Events (CSV) → Log Aggregator → MITRE ATT&CK Mapper → Anomaly Detection
       → Attack Correlation Engine → Risk Scoring Engine
       → Attack Timeline + Graph Visualization → AI Summary + SOC Dashboard
```

## Tech Stack

- **Backend:** Node.js, Express.js
- **Data:** CSV dataset (`datasets/cyber_logs.csv`)
- **Libraries:** cors, csv-parser
- **Frontend:** React, Chart.js, vis-network
- **AI Summary:** Rule-based (no API key required)

## Project Structure

```
cyber-risk-engine/
├── datasets/
│   └── cyber_logs.csv
├── backend/
│   ├── server.js
│   ├── routes/
│   │   └── logs.js
│   ├── services/
│   │   ├── logAggregator.js
│   │   ├── mitreMapper.js
│   │   ├── anomalyDetector.js
│   │   ├── correlationEngine.js
│   │   ├── riskEngine.js
│   │   └── aiSummary.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AttackTimeline.js
│   │   │   ├── RiskDashboard.js
│   │   │   ├── AttackGraph.js
│   │   │   └── AISummary.js
│   │   ├── App.js
│   │   └── App.css
├── package.json
└── README.md
```

## How to Run

### 1. Install dependencies

From the project root:

```bash
cd cyber-risk-engine
npm install
cd backend && npm install
cd ../frontend && npm install
cd ..
```

Or from root in one go:

```bash
cd cyber-risk-engine/backend && npm install
cd ../frontend && npm install
cd ..
```

### 2. Start the backend

The server runs on **port 5000** and **host 0.0.0.0** so it can be reached from another device on the same network. If port 5000 is already in use, set `PORT=5001` (or another port) and change the value in `backend/server.js` (line `const PORT = 5000`).

```bash
cd cyber-risk-engine/backend
node server.js
```

You should see:

- Server listening on `http://0.0.0.0:5000`
- CSV stream starting; one event every 3 seconds
- Console logs for each event: New Event Received, MITRE Technique, Risk Score, anomalies, high-risk alerts

### 3. Start the frontend

In a **second terminal**:

```bash
cd cyber-risk-engine/frontend
npm start
```

The React app will open at `http://localhost:3000` and will poll the backend APIs every 2 seconds.

### 4. Access from another laptop

- Backend: `http://<this-PC-IP>:5000` (e.g. `http://192.168.1.5:5000`)
- Frontend: run on this PC and open `http://<this-PC-IP>:3000`, or build and serve the frontend from the same machine so the proxy works

If the frontend runs on another machine, set the backend URL before starting:

- Windows: `set REACT_APP_API_URL=http://<this-PC-IP>:5000`
- Linux/Mac: `REACT_APP_API_URL=http://<this-PC-IP>:5000 npm start`

## APIs

| Method | Endpoint       | Description                    |
|--------|----------------|--------------------------------|
| GET    | `/logs`        | All processed log events       |
| GET    | `/alerts`      | High-risk users + attack chains|
| GET    | `/risk/:user`  | Risk score for a user          |
| GET    | `/timeline`    | Ordered attack timeline        |
| GET    | `/summary`     | AI attack summary (optional `?user=U101`) |
| GET    | `/graph`       | Nodes/edges for attack graph   |
| GET    | `/health`      | Health check                   |

## Dataset

`datasets/cyber_logs.csv` columns: **source**, **event_type**, **user**, **time**.

Event types: `phishing`, `malware_detected`, `failed_login`, `unusual_transaction`.

The backend reads this file and simulates real-time streaming by processing **one event every 3 seconds**.

## Features

1. **Log Aggregator** – In-memory storage of incoming events with console output.
2. **MITRE ATT&CK Mapper** – Maps event types to techniques (e.g. phishing → T1566).
3. **Anomaly Detection** – Rules: >3 failed logins, malware_detected, unusual_transaction after login.
4. **Attack Correlation** – Detects pattern: phishing → failed_login → unusual_transaction → “Account Takeover Attack”.
5. **Risk Scoring** – Points per event (e.g. phishing 30, malware 50); alert when user total > 70.
6. **Attack Timeline** – Chart.js timeline of events and risk over time.
7. **Attack Graph** – vis-network graph: users, events, MITRE techniques, and sequence edges.
8. **AI Summary** – Rule-based natural language summary per user and overall.

All code is modular, commented, and prints SOC-style console logs (e.g. “Event Processed”, “⚠ Suspicious Activity Detected”, “🚨 HIGH RISK USER DETECTED”).
