/**
 * AI Attack Summary Service
 * Generates natural language summary of attack activity.
 * Uses simple rule-based summary (no API key required).
 * Can be extended to use OpenAI API if OPENAI_API_KEY is set.
 */

const correlationEngine = require('./correlationEngine');
const riskEngine = require('./riskEngine');

/**
 * Build a rule-based summary for a user from events
 * @param {string} user
 * @param {Array} events - all events
 * @returns {string}
 */
function summarizeForUser(user, events) {
  const userEvents = events
    .filter((e) => e.user === user)
    .sort((a, b) => new Date(a.time) - new Date(b.time));

  const eventTypes = userEvents.map((e) => e.event_type);
  const riskScore = riskEngine.getRiskForUser(user);
  const classification = correlationEngine.correlateForUser(user, events);

  const parts = [];

  if (eventTypes.length === 0) {
    return `No events recorded for user ${user}.`;
  }

  // Describe sequence
  const hasPhishing = eventTypes.includes('phishing');
  const hasFailedLogin = eventTypes.includes('failed_login');
  const failedCount = eventTypes.filter((e) => e === 'failed_login').length;
  const hasUnusual = eventTypes.includes('unusual_transaction');
  const hasMalware = eventTypes.includes('malware_detected');

  if (hasPhishing) {
    parts.push(`User ${user} experienced a phishing attempt`);
  }
  if (hasFailedLogin) {
    parts.push(`followed by ${failedCount} failed login attempt(s)`);
  }
  if (hasUnusual) {
    parts.push('and an unusual transaction');
  }
  if (hasMalware) {
    parts.push('Malware was detected on their system.');
  }

  let summary = parts.join(' ');
  if (!summary.endsWith('.')) summary += '.';

  if (classification) {
    summary += ` This sequence indicates a potential ${classification}.`;
  }

  summary += ` Current risk score: ${riskScore}.`;

  return summary;
}

/**
 * Generate overall attack summary (all users / high risk)
 * @param {Array} events
 * @returns {string}
 */
function generateAttackSummary(events) {
  const highRisk = riskEngine.getHighRiskUsers();
  const chains = correlationEngine.detectAttackChains(events);

  const lines = [];

  if (events.length > 0) {
    lines.push(`Total events processed: ${events.length}.`);
  }

  if (highRisk.length > 0) {
    lines.push(
      `High-risk users (score > 70): ${highRisk.map((u) => `${u.user} (${u.score})`).join(', ')}.`
    );
  }

  if (chains.length > 0) {
    lines.push(
      `Detected attack chains: ${chains.map((c) => `${c.user} - ${c.classification}`).join('; ')}.`
    );
  }

  // Per-user narrative for users with activity
  const users = [...new Set(events.map((e) => e.user))];
  for (const user of users) {
    const userSummary = summarizeForUser(user, events);
    lines.push(`\n${userSummary}`);
  }

  return lines.join(' ');
}

/**
 * Get summary for API (single user or full)
 * @param {Array} events
 * @param {string} [user] - optional user filter
 * @returns {string}
 */
function getSummary(events, user) {
  if (user) {
    return summarizeForUser(user, events);
  }
  return generateAttackSummary(events);
}

module.exports = {
  summarizeForUser,
  generateAttackSummary,
  getSummary,
};
