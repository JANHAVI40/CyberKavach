/**
 * Attack Graph - vis-network graph: Users, Events, Techniques and sequence edges
 */

import React, { useEffect, useRef } from 'react';

// vis-network standalone build (includes DataSet)
let DataSet, Network;
try {
  const vis = require('vis-network/standalone');
  DataSet = vis.DataSet;
  Network = vis.Network;
} catch (_) {
  DataSet = null;
  Network = null;
}

export default function AttackGraph({ graphData = { nodes: [], edges: [] } }) {
  const containerRef = useRef(null);
  const networkRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !graphData.nodes.length || !DataSet || !Network) return;

    const options = {
      nodes: {
        shape: 'dot',
        font: { size: 12 },
        borderWidth: 2,
      },
      edges: {
        arrows: 'to',
        width: 1,
      },
      groups: {
        user: { color: { background: '#3b82f6', border: '#1d4ed8' } },
        event: { color: { background: '#ef4444', border: '#b91c1c' } },
        technique: { color: { background: '#8b5cf6', border: '#6d28d9' } },
      },
      physics: {
        enabled: true,
        stabilization: { iterations: 100 },
        barnesHut: {
          gravitationalConstant: -3000,
          centralGravity: 0.1,
          springLength: 120,
          avoidOverlap: 0.2,
        },
      },
    };

    const nodes = new DataSet(
      graphData.nodes.map((n) => ({
        id: n.id,
        label: n.label,
        group: n.group || 'event',
        title: n.title || n.label,
      }))
    );
    const edges = new DataSet(
      graphData.edges.map((e) => ({ from: e.from, to: e.to }))
    );

    const network = new Network(containerRef.current, { nodes, edges }, options);
    networkRef.current = network;

    return () => {
      network.destroy();
      networkRef.current = null;
    };
  }, [graphData.nodes.length, graphData.edges.length]);

  // Update data when graphData changes (same length might mean new content)
  useEffect(() => {
    if (!networkRef.current || !DataSet) return;
    const net = networkRef.current;
    if (graphData.nodes && graphData.nodes.length) {
      net.body.data.nodes.clear();
      net.body.data.nodes.add(
        graphData.nodes.map((n) => ({
          id: n.id,
          label: n.label,
          group: n.group || 'event',
          title: n.title || n.label,
        }))
      );
    }
    if (graphData.edges && graphData.edges.length) {
      net.body.data.edges.clear();
      net.body.data.edges.add(graphData.edges.map((e) => ({ from: e.from, to: e.to })));
    }
  }, [graphData]);

  if (!Network) {
    return (
      <div className="panel attack-graph">
        <h3>Attack Graph</h3>
        <p className="empty">vis-network not loaded. Run npm install.</p>
      </div>
    );
  }

  return (
    <div className="panel attack-graph">
      <h3>Attack Graph (Users → Events → MITRE Techniques)</h3>
      <div
        ref={containerRef}
        style={{ height: 400, width: '100%', minHeight: 300 }}
      />
      {(!graphData.nodes || graphData.nodes.length === 0) && (
        <p className="empty overlay">No graph data yet.</p>
      )}
    </div>
  );
}
