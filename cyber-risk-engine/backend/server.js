/**
 * Unified Personal Cyber Risk Engine - Backend Server
 * Runs the full pipeline: Log Aggregator -> MITRE Mapper -> Anomaly -> Correlation -> Risk -> State
 * Serves APIs and simulates real-time streaming from CSV (one event every 3 seconds).
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const csv = require('csv-parser');

const logsRouter = require('./routes/logs');
const logAggregator = require('./services/logAggregator');
const mitreMapper = require('./services/mitreMapper');
const anomalyDetector = require('./services/anomalyDetector');
const correlationEngine = require('./services/correlationEngine');
const riskEngine = require('./services/riskEngine');
const networkSensor = require('./services/networkSensor');

const PORT = 5000;
const HOST = '0.0.0.0';
const STREAM_INTERVAL_MS = 3000;

const app = express();
app.use(cors());
app.use(express.json());

// Pipeline state for APIs (processed events with all enrichments)
app.locals.pipelineState = {
  processedEvents: [],
};

// Health check (before router so it is matched first)
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'cyber-risk-engine' });
});

// Mount API routes
app.use('/', logsRouter);

/**
 * Run one event through the full pipeline and store result
 */
function processEvent(rawEvent) {
  const aggregated = logAggregator.addEvent(rawEvent);
  const enriched = mitreMapper.enrichEvent(aggregated);
  const allSoFar = app.locals.pipelineState.processedEvents;
  const isAnomaly = anomalyDetector.detectAnomaly(enriched, allSoFar);
  const riskResult = riskEngine.addEventRisk(enriched);

  const processed = {
    ...enriched,
    isAnomaly,
    riskScore: riskResult.score,
    isHighRisk: riskResult.isHighRisk,
  };

  app.locals.pipelineState.processedEvents.push(processed);

  console.log('  Event Processed');
  console.log(`  MITRE Technique: ${enriched.mitreTechnique}`);
  console.log(`  Risk Score (user total): ${riskResult.score}`);
  if (processed.isAnomaly) console.log('  ⚠ Anomaly flagged');
  if (processed.isHighRisk) console.log('  🚨 HIGH RISK USER DETECTED');
}

/**
 * Read CSV and stream events one-by-one every 3 seconds
 */
function streamCsvEvents() {
  const csvPath = path.join(__dirname, '..', 'datasets', 'cyber_logs.csv');
  if (!fs.existsSync(csvPath)) {
    console.error('Dataset not found:', csvPath);
    return;
  }

  const rows = [];
  fs.createReadStream(csvPath)
    .pipe(csv())
    .on('data', (row) => rows.push(row))
    .on('end', () => {
      console.log(`\n[SOC] Loaded ${rows.length} events from cyber_logs.csv. Starting stream...\n`);
      let index = 0;
      const next = () => {
        if (index >= rows.length) {
          console.log('\n[SOC] Stream finished. Pipeline idle. APIs still available.\n');
          return;
        }
        const row = rows[index];
        const event = {
          source: row.source,
          event_type: row.event_type,
          user: row.user,
          time: row.time,
        };
        processEvent(event);
        index++;
        setTimeout(next, STREAM_INTERVAL_MS);
      };
      next();
    })
    .on('error', (err) => console.error('CSV read error:', err));
}

// Start server then start streaming
app.listen(PORT, HOST, () => {
  console.log('========================================');
  console.log('  Unified Personal Cyber Risk Engine');
  console.log('  SOC Backend');
  console.log('========================================');
  console.log(`  Server: http://${HOST}:${PORT}`);
  console.log(`  APIs: /logs, /alerts, /risk/:user, /timeline, /summary, /graph`);
  console.log('========================================\n');
  // Small delay so server is ready, then stream
  setTimeout(streamCsvEvents, 500);


  // Start live network sensors for real-time attacks (nmap etc.)
  networkSensor.startNetworkSensors({
    ports: [2222, 8081, 3307], // ports nmap can hit
    onEvent: processEvent,
  });
});
