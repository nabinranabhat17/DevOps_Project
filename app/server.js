const express = require('express');
const promClient = require('prom-client');
const os = require('os');

const app = express();
const port = process.env.PORT || 3000;
const VERSION = process.env.VERSION || '1.0.0';

// Prometheus metrics
promClient.collectDefaultMetrics();

const httpRequestsTotal = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['route', 'status']
});

const httpRequestDurationSeconds = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['route', 'status'],
  buckets: [0.005, 0.01, 0.05, 0.1, 0.5, 1, 2, 5]
});

app.use((req, res, next) => {
  const end = httpRequestDurationSeconds.startTimer({ route: req.path });
  res.on('finish', () => {
    const status = res.statusCode ? String(res.statusCode) : '0';
    httpRequestsTotal.inc({ route: req.path, status });
    end({ route: req.path, status });
  });
  next();
});

app.get('/', (req, res) => {
  const hostname = os.hostname();
  res.send(`<!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <title>DevOps Demo App</title>
      <style>body{font-family:Arial,Helvetica,sans-serif;margin:40px}h1{color:#2d6cdf}p{font-size:1.1rem}</style>
    </head>
    <body>
      <h1>DevOps Demo App</h1>
      <p><strong>Version:</strong> ${VERSION}</p>
      <p><strong>Hostname:</strong> ${hostname}</p>
    </body>
  </html>`);
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime(), version: VERSION });
});

app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', promClient.register.contentType);
    res.end(await promClient.register.metrics());
  } catch (err) {
    res.status(500).end(err.message);
  }
});

app.listen(port, () => {
  console.log(`DevOps Demo App listening on port ${port} (version=${VERSION})`);
});

module.exports = app;
