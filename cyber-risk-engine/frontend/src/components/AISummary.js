/**
 * AI Attack Summary - Natural language summary from backend
 */

import React from 'react';

export default function AISummary({ summary = '' }) {
  return (
    <div className="panel ai-summary">
      <h3>AI Attack Summary</h3>
      <div className="summary-text">
        {summary ? (
          <p>{summary}</p>
        ) : (
          <p className="empty">No summary yet. Process events from the backend.</p>
        )}
      </div>
    </div>
  );
}
