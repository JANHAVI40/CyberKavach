/**
 * SOC Dashboard - Unified Personal Cyber Risk Engine
 * Shows: live events, risk scores, timeline, attack graph, AI summary
 */

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AttackTimeline from './components/AttackTimeline';
import RiskDashboard from './components/RiskDashboard';
import AttackGraph from './components/AttackGraph';
import AISummary from './components/AISummary';
import './App.css';

const API_BASE = process.env.REACT_APP_API_URL || '';

function usePoll(endpoint, intervalMs = 2000) {
  const [data, setData] = useState(null);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${API_BASE}${endpoint}`);
        setData(res.data);
      } catch (err) {
        console.warn(`Poll ${endpoint} failed:`, err.message);
      }
    };
    fetchData();
    const id = setInterval(fetchData, intervalMs);
    return () => clearInterval(id);
  }, [endpoint, intervalMs]);
  return data;
}

function App() {
  const logsData = usePoll('/logs');
  const alertsData = usePoll('/alerts');
  const timelineData = usePoll('/timeline');
  const graphData = usePoll('/graph');
  const summaryData = usePoll('/summary');

  const logs = logsData?.logs ?? [];
  const alerts = alertsData ?? {};
  const timeline = timelineData?.timeline ?? [];
  const graph = graphData ?? { nodes: [], edges: [] };
  const summary = summaryData?.summary ?? '';

  return (
    <div className="app">
      <header className="header">
        <h1>Unified Personal Cyber Risk Engine</h1>
        <p className="subtitle">SOC Dashboard — Live pipeline: Logs → MITRE → Anomaly → Correlation → Risk</p>
      </header>

      <main className="main">
        <section className="section risk-section">
          <RiskDashboard logs={logs} alerts={alerts} />
        </section>

        <section className="section timeline-section">
          <AttackTimeline timeline={timeline} />
        </section>

        <section className="section graph-section">
          <AttackGraph graphData={graph} />
        </section>

        <section className="section summary-section">
          <AISummary summary={summary} />
        </section>
      </main>
    </div>
  );
}

export default App;
