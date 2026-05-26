/**
 * Risk Scoring Engine
 * Each event type contributes to a risk score per user.
 * Alert when total risk score > 70.
 */

// Risk points per event type
const RISK_BY_EVENT_TYPE = {
  phishing: 30,
  malware_detected: 50,
  failed_login: 20,
  unusual_transaction: 40,
  scan_probe: 15,
};

const HIGH_RISK_THRESHOLD = 70;

// Per-user risk scores (cumulative)
const userRiskScores = {};

/**
 * Get risk points for an event type
 * @param {string} eventType
 * @returns {number}
 */
function getRiskForEventType(eventType) {
  return RISK_BY_EVENT_TYPE[eventType] || 10;
}

/**
 * Add event contribution to user's risk score
 * @param {Object} event - { user, event_type }
 * @returns {{ user, score, isHighRisk }}
 */
function addEventRisk(event) {
  const points = getRiskForEventType(event.event_type);
  userRiskScores[event.user] = (userRiskScores[event.user] || 0) + points;
  const score = userRiskScores[event.user];
  const isHighRisk = score > HIGH_RISK_THRESHOLD;

  console.log(`  Risk Score (this event): ${points} | User ${event.user} total: ${score}`);

  if (isHighRisk) {
    console.log('  🚨 HIGH RISK USER DETECTED');
  }

  return {
    user: event.user,
    score,
    isHighRisk,
  };
}

/**
 * Get risk score for a user
 * @param {string} user
 * @returns {number}
 */
function getRiskForUser(user) {
  return userRiskScores[user] || 0;
}

/**
 * Get all user risk scores
 * @returns {Object} { user: score }
 */
function getAllRiskScores() {
  return { ...userRiskScores };
}

/**
 * Get high-risk users (score > threshold)
 */
function getHighRiskUsers() {
  return Object.entries(userRiskScores)
    .filter(([, score]) => score > HIGH_RISK_THRESHOLD)
    .map(([user, score]) => ({ user, score }));
}

/**
 * Reset risk scores (for new stream)
 */
function resetScores() {
  Object.keys(userRiskScores).forEach((k) => delete userRiskScores[k]);
}

module.exports = {
  getRiskForEventType,
  addEventRisk,
  getRiskForUser,
  getAllRiskScores,
  getHighRiskUsers,
  resetScores,
  HIGH_RISK_THRESHOLD,
};
