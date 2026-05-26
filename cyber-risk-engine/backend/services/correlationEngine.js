/**
 * Attack Correlation Engine
 * Detects attack chains (e.g. phishing -> failed_login -> unusual_transaction = Account Takeover).
 */

// Attack chain pattern: sequence of event types for same user
const ACCOUNT_TAKEOVER_PATTERN = ['phishing', 'failed_login', 'unusual_transaction'];

/**
 * Get ordered event types for a user from event list
 * @param {string} user
 * @param {Array} events - list of events (with user, event_type)
 * @returns {string[]} event types in time order
 */
function getEventSequenceForUser(user, events) {
  return events
    .filter((e) => e.user === user)
    .sort((a, b) => new Date(a.time) - new Date(b.time))
    .map((e) => e.event_type);
}

/**
 * Check if sequence contains the attack pattern (in order, not necessarily consecutive)
 * @param {string[]} sequence
 * @param {string[]} pattern
 */
function sequenceMatchesPattern(sequence, pattern) {
  let patternIndex = 0;
  for (const eventType of sequence) {
    if (eventType === pattern[patternIndex]) {
      patternIndex++;
      if (patternIndex === pattern.length) return true;
    }
  }
  return false;
}

/**
 * Classify attack chain for a user based on event history
 * @param {string} user
 * @param {Array} allEvents
 * @returns {string|null} Attack classification or null
 */
function correlateForUser(user, allEvents) {
  const sequence = getEventSequenceForUser(user, allEvents);
  if (sequenceMatchesPattern(sequence, ACCOUNT_TAKEOVER_PATTERN)) {
    return 'Account Takeover Attack';
  }
  return null;
}

/**
 * Get all detected attack chains (user -> classification)
 * @param {Array} allEvents
 * @returns {Array} [{ user, classification }]
 */
function detectAttackChains(allEvents) {
  const users = [...new Set(allEvents.map((e) => e.user))];
  const chains = [];
  for (const user of users) {
    const classification = correlateForUser(user, allEvents);
    if (classification) {
      chains.push({ user, classification });
    }
  }
  return chains;
}

module.exports = {
  getEventSequenceForUser,
  correlateForUser,
  detectAttackChains,
  ACCOUNT_TAKEOVER_PATTERN,
};
