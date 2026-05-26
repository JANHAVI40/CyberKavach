/**
 * Risk Dashboard - Live attack events and user risk scores
 */

import React from 'react';

export default function RiskDashboard({ logs = [], alerts = {} }) {
  const highRiskUsers = alerts.highRiskUsers || [];
  const attackChains = alerts.attackChains || [];

  return (
    <div className="risk-dashboard">
      <div className="panel live-events">
        <h3>Live Attack Events</h3>
        <div className="event-list">
          {(!logs || logs.length === 0) && (
            <p className="empty">No events yet. Ensure backend is running and streaming.</p>
          )}
          {logs && logs.slice(-15).reverse().map((evt, i) => (
            <div
              key={evt.id || i}
              className={`event-row ${evt.isAnomaly ? 'anomaly' : ''} ${evt.isHighRisk ? 'high-risk' : ''}`}
            >
              <span className="time">{new Date(evt.time).toLocaleTimeString()}</span>
              <span className="user">{evt.user}</span>
              <span className="type">{evt.event_type}</span>
              <span className="mitre">{evt.mitreTechnique || '—'}</span>
              <span className="score">Risk: {evt.riskScore ?? '—'}</span>
              {evt.isAnomaly && <span className="badge anomaly-badge">⚠ Anomaly</span>}
              {evt.isHighRisk && <span className="badge high-badge">🚨 High Risk</span>}
            </div>
          ))}
        </div>
      </div>

      <div className="panel risk-scores">
        <h3>User Risk Scores</h3>
        {highRiskUsers.length > 0 && (
          <div className="alerts-block">
            <p className="alert-title">🚨 HIGH RISK USERS</p>
            <ul>
              {highRiskUsers.map((u) => (
                <li key={u.user}>{u.user}: {u.score}</li>
              ))}
            </ul>
          </div>
        )}
        {attackChains.length > 0 && (
          <div className="chains-block">
            <p className="chain-title">Detected Attack Chains</p>
            <ul>
              {attackChains.map((c) => (
                <li key={c.user}>{c.user} → {c.classification}</li>
              ))}
            </ul>
          </div>
        )}
        {logs && logs.length > 0 && (
          <div className="user-scores">
            {(() => {
              const byUser = {};
              logs.forEach((e) => {
                if (e.user && e.riskScore != null) byUser[e.user] = e.riskScore;
              });
              return Object.entries(byUser).map(([user, score]) => (
                <div key={user} className={`user-score-row ${score > 70 ? 'high' : ''}`}>
                  <span>{user}</span>
                  <span>{score}</span>
                </div>
              ));
            })()}
          </div>
        )}
        {(!logs || logs.length === 0) && highRiskUsers.length === 0 && (
          <p className="empty">No risk data yet.</p>
        )}
      </div>
    </div>
  );
}
