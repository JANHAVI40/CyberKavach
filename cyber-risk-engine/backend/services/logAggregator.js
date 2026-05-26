/**
 * Log Aggregator Service
 * Receives log events and stores them in memory.
 * Simulates a central log collection point in the pipeline.
 */

const events = [];

/**
 * Add a new log event to the aggregator
 * @param {Object} event - Raw log event { source, event_type, user, time }
 */
function addEvent(event) {
  events.push({
    ...event,
    id: events.length + 1,
    receivedAt: new Date().toISOString(),
  });
  console.log('\n--- New Event Received ---');
  console.log(`Source: ${event.source}`);
  console.log(`Event: ${event.event_type}`);
  console.log(`User: ${event.user}`);
  console.log(`Time: ${event.time}`);
  return events[events.length - 1];
}

/**
 * Get all aggregated events
 */
function getAllEvents() {
  return [...events];
}

/**
 * Get event count
 */
function getEventCount() {
  return events.length;
}

/**
 * Clear all events (for testing)
 */
function clearEvents() {
  events.length = 0;
}

module.exports = {
  addEvent,
  getAllEvents,
  getEventCount,
  clearEvents,
};
