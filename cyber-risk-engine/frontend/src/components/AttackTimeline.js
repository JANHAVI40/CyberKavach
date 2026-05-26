/**
 * Attack Timeline - Ordered events over time using Chart.js
 */

import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function AttackTimeline({ timeline = [] }) {
  const chartData = useMemo(() => {
    const sorted = [...(timeline || [])].sort(
      (a, b) => new Date(a.time) - new Date(b.time)
    );
    const labels = sorted.map((e) => {
      const d = new Date(e.time);
      return d.toLocaleTimeString('en-US', { hour12: false });
    });
    const riskScores = sorted.map((e) => e.riskScore || 0);
    const anomalyFlags = sorted.map((e) => (e.isAnomaly ? 80 : 0));

    return {
      labels,
      datasets: [
        {
          label: 'User Risk Score',
          data: riskScores,
          borderColor: 'rgb(239, 68, 68)',
          backgroundColor: 'rgba(239, 68, 68, 0.2)',
          fill: true,
          tension: 0.3,
          yAxisID: 'y',
        },
        {
          label: 'Anomaly (flag)',
          data: anomalyFlags,
          borderColor: 'rgb(251, 191, 36)',
          backgroundColor: 'rgba(251, 191, 36, 0.3)',
          fill: true,
          tension: 0,
          pointRadius: anomalyFlags.map((v) => (v ? 6 : 0)),
          yAxisID: 'y',
        },
      ],
    };
  }, [timeline]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { intersect: false, mode: 'index' },
    plugins: {
      title: { display: true, text: 'Attack Timeline (events over time)' },
      legend: { position: 'top' },
    },
    scales: {
      x: {
        title: { display: true, text: 'Time' },
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        min: 0,
        max: 100,
        title: { display: true, text: 'Risk / Anomaly' },
      },
    },
  };

  if (!timeline || timeline.length === 0) {
    return (
      <div className="panel attack-timeline">
        <h3>Attack Timeline</h3>
        <p className="empty">No timeline data yet. Start the backend stream.</p>
      </div>
    );
  }

  return (
    <div className="panel attack-timeline">
      <h3>Attack Timeline</h3>
      <div style={{ height: 280 }}>
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}
