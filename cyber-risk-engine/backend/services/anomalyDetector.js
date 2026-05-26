/**
 * Anomaly Detection Service
 * Simple rule-based anomaly detection.
 * Rules: >3 failed logins, malware_detected, unusual_transaction after login.
 */

// Track failed login count per user (in current session/window)
const failedLoginCountByUser = {};

/**
 * Check if event is anomalous based on rules
 * @param {Object} event - Enriched log event
 * @param {Array} allEvents - All events so far (for context)
 * @returns {boolean} true if anomaly detected
 */
function detectAnomaly(event, allEvents = []) {
  let isAnomaly = false;

  // Rule 1: More than 3 failed logins for same user
  if (event.event_type === 'failed_login') {
    failedLoginCountByUser[event.user] = (failedLoginCountByUser[event.user] || 0) + 1;
    if (failedLoginCountByUser[event.user] > 3) {
      isAnomaly = true;
    }
  }

  // Rule 2: malware_detected is always anomalous
  if (event.event_type === 'malware_detected') {
    isAnomaly = true;
  }

  // Rule 3: unusual_transaction after (any) login for same user
  if (event.event_type === 'unusual_transaction') {
    const userEvents = allEvents.filter((e) => e.user === event.user);
    const hadLogin = userEvents.some(
      (e) => e.event_type === 'failed_login' || e.event_type === 'phishing'
    );
    if (hadLogin) {
      isAnomaly = true;
    }
  }

  if (isAnomaly) {
    console.log('  ⚠ Suspicious Activity Detected');
  }

  return isAnomaly;
}

/**
 * Reset per-user counters (e.g. when starting new stream)
 */
function resetCounters() {
  Object.keys(failedLoginCountByUser).forEach((k) => delete failedLoginCountByUser[k]);
}

module.exports = {
  detectAnomaly,
  resetCounters,
};
