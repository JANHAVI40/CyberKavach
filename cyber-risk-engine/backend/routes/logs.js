/**
 * Logs API Routes
 * GET /logs, /alerts, /risk/:user, /timeline
 */

const express = require('express');
const router = express.Router();
const logAggregator = require('../services/logAggregator');
const riskEngine = require('../services/riskEngine');
const aiSummary = require('../services/aiSummary');
const correlationEngine = require('../services/correlationEngine');

/**
 * GET /logs - Return all processed logs (from aggregator pipeline output)
 * We store processed events in a separate list in server; this route reads from state.
 */
router.get('/logs', (req, res) => {
  const state = req.app.locals.pipelineState;
  const events = state ? state.processedEvents : [];
  res.json({ logs: events, count: events.length });
});

/**
 * GET /alerts - Return high risk alerts
 */
router.get('/alerts', (req, res) => {
  const highRisk = riskEngine.getHighRiskUsers();
  const state = req.app.locals.pipelineState;
  const chains = state && state.processedEvents
    ? correlationEngine.detectAttackChains(state.processedEvents)
    : [];
  res.json({
    highRiskUsers: highRisk,
    attackChains: chains,
    count: highRisk.length + chains.length,
  });
});

/**
 * GET /risk/:user - Return risk score for a user
 */
router.get('/risk/:user', (req, res) => {
  const user = req.params.user;
  const score = riskEngine.getRiskForUser(user);
  const isHighRisk = score > riskEngine.HIGH_RISK_THRESHOLD;
  res.json({ user, score, isHighRisk });
});

/**
 * GET /timeline - Return ordered attack timeline (events sorted by time)
 */
router.get('/timeline', (req, res) => {
  const state = req.app.locals.pipelineState;
  const events = state ? state.processedEvents : [];
  const ordered = [...events].sort((a, b) => new Date(a.time) - new Date(b.time));
  res.json({ timeline: ordered, count: ordered.length });
});

/**
 * GET /summary - AI-generated attack summary (optional ?user=U101)
 */
router.get('/summary', (req, res) => {
  const state = req.app.locals.pipelineState;
  const events = state ? state.processedEvents : [];
  const user = req.query.user;
  const summary = aiSummary.getSummary(events, user);
  res.json({ summary });
});

/**
 * GET /graph - Data for attack graph (nodes: users, events, techniques; edges: sequence)
 */
router.get('/graph', (req, res) => {
  const state = req.app.locals.pipelineState;
  const events = state ? state.processedEvents : [];
  const nodes = [];
  const edges = [];
  const nodeIds = new Set();

  events.forEach((evt, index) => {
    const userNodeId = `user-${evt.user}`;
    const eventNodeId = `event-${evt.id || index}-${evt.event_type}`;
    const techNodeId = `tech-${evt.mitreTechnique || 'T0000'}`;

    if (!nodeIds.has(userNodeId)) {
      nodeIds.add(userNodeId);
      nodes.push({ id: userNodeId, label: evt.user, group: 'user', title: `User: ${evt.user}` });
    }
    if (!nodeIds.has(eventNodeId)) {
      nodeIds.add(eventNodeId);
      nodes.push({
        id: eventNodeId,
        label: evt.event_type,
        group: 'event',
        title: `${evt.event_type} (${evt.source})`,
      });
    }
    if (!nodeIds.has(techNodeId)) {
      nodeIds.add(techNodeId);
      nodes.push({
        id: techNodeId,
        label: evt.mitreTechnique || 'T0000',
        group: 'technique',
        title: `MITRE: ${evt.mitreTechnique || 'T0000'}`,
      });
    }

    edges.push({ from: userNodeId, to: eventNodeId });
    edges.push({ from: eventNodeId, to: techNodeId });
    if (index > 0) {
      const prevEvt = events[index - 1];
      const prevEventNodeId = `event-${prevEvt.id || index - 1}-${prevEvt.event_type}`;
      edges.push({ from: prevEventNodeId, to: eventNodeId });
    }
  });

  res.json({ nodes, edges });
});

module.exports = router;
