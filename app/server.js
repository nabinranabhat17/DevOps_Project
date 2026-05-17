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
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>Sagar DevOps Demo App</title>
      <style>
        :root{--bg1:#07111f;--bg2:#102a43;--card:#0f172a;--card2:#111c33;--text:#e2e8f0;--muted:#94a3b8;--accent:#38bdf8;--accent2:#22c55e;--border:rgba(148,163,184,0.22)}
        *{box-sizing:border-box}
        body{font-family:Georgia,Times,"Times New Roman",serif;margin:0;min-height:100vh;background:radial-gradient(circle at top left,#1d4ed8 0,#0f172a 35%,#020617 100%);color:var(--text)}
        .shell{max-width:980px;margin:0 auto;padding:40px 20px}
        .hero{position:relative;overflow:hidden;padding:34px;border:1px solid var(--border);border-radius:24px;background:linear-gradient(135deg,rgba(15,23,42,.96),rgba(17,24,39,.88));box-shadow:0 24px 80px rgba(2,6,23,.45)}
        .hero::after{content:"";position:absolute;inset:auto -80px -90px auto;width:240px;height:240px;border-radius:50%;background:radial-gradient(circle,rgba(56,189,248,.28),rgba(56,189,248,0));pointer-events:none}
        .eyebrow{display:inline-flex;align-items:center;gap:8px;padding:6px 12px;border-radius:999px;background:rgba(56,189,248,.12);color:#7dd3fc;font-size:.86rem;letter-spacing:.08em;text-transform:uppercase}
        h1{margin:14px 0 8px;font-size:clamp(2.2rem,4vw,3.6rem);line-height:1.05}
        .subtitle{max-width:720px;margin:0;color:var(--muted);font-size:1.05rem;line-height:1.7}
        .build-marker{display:inline-flex;align-items:center;gap:8px;margin:18px 0 0;padding:0.8rem 1rem;border:1px solid rgba(56,189,248,.28);background:linear-gradient(90deg,rgba(8,47,73,.95),rgba(15,23,42,.95));color:#bae6fd;border-radius:14px;font-weight:700}
        .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px;margin-top:22px}
        .card{padding:18px 18px 16px;border:1px solid var(--border);border-radius:18px;background:linear-gradient(180deg,rgba(15,23,42,.92),rgba(17,24,39,.9))}
        .label{display:block;margin-bottom:6px;color:var(--muted);font-size:.82rem;text-transform:uppercase;letter-spacing:.08em}
        .value{font-size:1.05rem;font-weight:700;color:#f8fafc;word-break:break-word}
        .stack{margin-top:20px;padding-top:20px;border-top:1px solid var(--border)}
        .section-title{margin:0 0 12px;font-size:1.05rem;color:#93c5fd}
        .info-row{display:flex;justify-content:space-between;gap:16px;margin:0.7rem 0;font-size:1rem}
        .info-row span:last-child{text-align:right;color:#f8fafc;font-weight:700}
        @media (max-width:640px){body{background:#020617}.hero{padding:22px}.info-row{flex-direction:column}.info-row span:last-child{text-align:left}}
      </style>
    </head>
    <body>
      <div class="shell">
        <section class="hero">
          <span class="eyebrow">Sagar Giri DevOps Lab</span>
          <h1>Automated CI/CD Demo</h1>
          <p class="subtitle">A redesigned project homepage for the DevOps Fundamentals submission, built to highlight the pipeline identity, runtime version, and live host details.</p>
          <div class="build-marker">Built by Jenkins, version ${VERSION}</div>

          <div class="grid">
            <div class="card">
              <span class="label">Version</span>
              <div class="value">${VERSION}</div>
            </div>
            <div class="card">
              <span class="label">Hostname</span>
              <div class="value">${hostname}</div>
            </div>
            <div class="card">
              <span class="label">Username</span>
              <div class="value">oceangiri</div>
            </div>
          </div>

          <div class="stack">
            <h3 class="section-title">Project Information</h3>
            <div class="info-row"><span>Completed by</span><span>Sagar Giri (078BCT071)</span></div>
            <div class="info-row"><span>Presented to</span><span>Sanjaya Subedi (DevOps Fundamentals)</span></div>
            <div class="info-row"><span>Repository username</span><span>oceangiri</span></div>
          </div>
        </section>
      </div>
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
