// backend/services/networkSensor.js
const net = require('net');
const os = require('os');

function getLocalIPs() {
  const ifaces = os.networkInterfaces();
  const ips = [];
  Object.values(ifaces).forEach(list => {
    list.forEach(i => {
      if (!i.internal && i.family === 'IPv4') ips.push(i.address);
    });
  });
  return ips;
}

/**
 * Start simple TCP honeypots on given ports and call onEvent() for every connection.
 * onEvent(event) should push into your existing pipeline (processEvent in server.js).
 */
function startNetworkSensors({ ports = [2222, 8081, 3307], onEvent }) {
  const ipList = getLocalIPs();
  console.log('\n[Sensor] Local IPs to scan with nmap:', ipList.join(', ') || 'unknown');
  console.log('[Sensor] Honeypot listening on ports:', ports.join(', '));

  ports.forEach(port => {
    const server = net.createServer((socket) => {
      const remote = `${socket.remoteAddress}:${socket.remotePort}`;
      const now = new Date().toISOString();

      const event = {
        source: 'network_sensor',
        event_type: 'scan_probe', // new event type
        user: socket.remoteAddress || 'unknown',
        time: now,
      };

      console.log(`\n[Sensor] Connection from ${remote} on port ${port}`);
      onEvent(event);

      // send banner and close; we’re not a real service
      socket.write('Mock service - activity is being monitored.\n');
      socket.end();
    });

    server.on('error', (err) => {
      console.error(`[Sensor] Error on port ${port}:`, err.message);
    });

    server.listen(port, '0.0.0.0', () => {
      console.log(`[Sensor] Listening on 0.0.0.0:${port}`);
    });
  });
}

module.exports = {
  startNetworkSensors,
};