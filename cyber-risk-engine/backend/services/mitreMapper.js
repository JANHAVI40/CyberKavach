/**
 * MITRE ATT&CK Mapper Service
 * Maps event types to MITRE ATT&CK technique IDs.
 * Each processed event includes its mapped technique.
 */

// Event type -> MITRE ATT&CK technique mapping
const EVENT_TO_MITRE = {
  phishing: 'T1566',           // Phishing: Spearphishing Attachment/Link
  malware_detected: 'T1059',   // Command and Scripting Interpreter
  failed_login: 'T1110',       // Brute Force
  unusual_transaction: 'T1078',
  scan_probe: 'T1046', 
   // Valid Accounts (abuse after compromise)
};

/**
 * Map an event type to MITRE ATT&CK technique
 * @param {string} eventType - e.g. phishing, malware_detected
 * @returns {string} MITRE technique ID or 'T0000' if unknown
 */
function mapToMitre(eventType) {
  const technique = EVENT_TO_MITRE[eventType] || 'T0000';
  return technique;
}

/**
 * Enrich an event with its MITRE technique
 * @param {Object} event - Log event with event_type
 * @returns {Object} Event with mitreTechnique added
 */
function enrichEvent(event) {
  const mitreTechnique = mapToMitre(event.event_type);
  const enriched = {
    ...event,
    mitreTechnique,
  };
  console.log(`  MITRE Technique: ${mitreTechnique} (${event.event_type})`);
  return enriched;
}

/**
 * Get full mapping for reference
 */
function getMapping() {
  return { ...EVENT_TO_MITRE };
}

module.exports = {
  mapToMitre,
  enrichEvent,
  getMapping,
};
