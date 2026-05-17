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
      <title>Nabin DevOps Studio</title>
      <style>
        :root{--bg:#f8fafc;--panel:#ffffff;--panel-2:#f1f5f9;--text:#0f172a;--muted:#475569;--accent:#2563eb;--accent-2:#14b8a6;--border:rgba(37,99,235,0.14)}
        *{box-sizing:border-box}
        body{font-family:Inter,ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif;margin:0;min-height:100vh;background:linear-gradient(180deg,#f8fafc 0%,#e2e8f0 100%);color:var(--text)}
        .shell{max-width:980px;margin:0 auto;padding:44px 20px}
        .hero{position:relative;overflow:hidden;padding:34px;border:1px solid var(--border);border-radius:28px;background:linear-gradient(135deg,var(--panel),var(--panel-2));box-shadow:0 18px 60px rgba(15,23,42,.08)}
        .hero::before{content:"";position:absolute;inset:-120px auto auto -90px;width:260px;height:260px;border-radius:50%;background:radial-gradient(circle,rgba(37,99,235,.14),rgba(37,99,235,0));pointer-events:none}
        .eyebrow{display:inline-flex;align-items:center;gap:8px;padding:6px 12px;border-radius:999px;background:rgba(37,99,235,.1);color:var(--accent);font-size:.86rem;letter-spacing:.08em;text-transform:uppercase;font-weight:700}
        h1{margin:14px 0 8px;font-size:clamp(2.2rem,4vw,3.6rem);line-height:1.05}
        .subtitle{max-width:720px;margin:0;color:var(--muted);font-size:1.05rem;line-height:1.7}
        .hero-badge{display:inline-flex;align-items:center;gap:8px;margin:18px 0 0;padding:0.8rem 1rem;border:1px solid rgba(20,184,166,.24);background:rgba(20,184,166,.08);color:#0f766e;border-radius:14px;font-weight:700}
        .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px;margin-top:22px}
        .card{padding:18px 18px 16px;border:1px solid var(--border);border-radius:18px;background:#fff}
        .label{display:block;margin-bottom:6px;color:var(--muted);font-size:.82rem;text-transform:uppercase;letter-spacing:.08em}
        .value{font-size:1.05rem;font-weight:700;color:var(--text);word-break:break-word}
        .stack{margin-top:20px;padding-top:20px;border-top:1px solid var(--border)}
        .section-title{margin:0 0 12px;font-size:1.05rem;color:var(--accent)}
        .info-row{display:flex;justify-content:space-between;gap:16px;margin:0.7rem 0;font-size:1rem}
        .info-row span:last-child{text-align:right;color:var(--text);font-weight:700}
        @media (max-width:640px){.hero{padding:22px}.info-row{flex-direction:column}.info-row span:last-child{text-align:left}}
      </style>
    </head>
    <body>
      <div class="shell">
        <section class="hero">
          <span class="eyebrow">Nabin Ranabhat DevOps Lab</span>
          <h1>Automated CI/CD Showcase</h1>
          <p class="subtitle">A refreshed project homepage for my DevOps Fundamentals submission, designed to feel lighter, cleaner, and more personal while showing the live host details.</p>
          <div class="hero-badge">Live deployment ready for screenshot capture</div>

          <div class="grid">
            <div class="card">
              <span class="label">Hostname</span>
              <div class="value">${hostname}</div>
            </div>
            <div class="card">
              <span class="label">Username</span>
              <div class="value">nabinrb</div>
            </div>
            <div class="card">
              <span class="label">Project</span>
              <div class="value">Nabin Ranabhat (078BCT050)</div>
            </div>
          </div>

          <div class="stack">
            <h3 class="section-title">Project Information</h3>
            <div class="info-row"><span>Completed by</span><span>Nabin Ranabhat (078BCT050)</span></div>
            <div class="info-row"><span>Presented to</span><span>Sanjaya Subedi (DevOps Fundamentals)</span></div>
            <div class="info-row"><span>Repository username</span><span>nabinrb2787</span></div>
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
