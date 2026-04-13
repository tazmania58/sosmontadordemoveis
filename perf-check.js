#!/usr/bin/env node
// perf-check.js — Performance audit for SOS Montador de Móveis
// Scores 0-100 based on ~126 performance checkpoints

const fs = require('fs');
const path = require('path');

const BASE = __dirname;
const PAGES = ['index.html', 'servicos.html', 'empresa.html', 'clientes.html', 'contato.html'];

let pts = 0;
let maxPts = 0;
const buf = [];

function chk(desc, pass, weight = 1) {
  maxPts += weight;
  if (pass) {
    pts += weight;
    buf.push(`  \u2713 [${weight}pt] ${desc}`);
  } else {
    buf.push(`  \u2717 [${weight}pt] ${desc}`);
  }
}

function flush() {
  buf.forEach(l => console.log(l));
  buf.length = 0;
}

const htaccess = fs.existsSync(path.join(BASE, '.htaccess'))
  ? fs.readFileSync(path.join(BASE, '.htaccess'), 'utf8') : '';
const css = fs.existsSync(path.join(BASE, 'css/style.css'))
  ? fs.readFileSync(path.join(BASE, 'css/style.css'), 'utf8') : '';

console.log('\n\u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557');
console.log('\u2551    PERFORMANCE AUDIT \u2014 SOS MONTADORES    \u2551');
console.log('\u255a\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255d\n');

// ── 1. SERVER / .HTACCESS ─────────────────────────────────────────────────────
console.log('\u25b6 [SERVER \u2014 Caching & Compression]');
chk('Gzip compression (mod_deflate)',
  /mod_deflate|AddOutputFilterByType DEFLATE/i.test(htaccess), 5);
chk('Cache-Control headers present',
  /Cache-Control/i.test(htaccess), 3);
chk('Expires headers active (mod_expires)',
  /ExpiresActive\s+On/i.test(htaccess), 3);
chk('Images cached >= 1 month',
  /ExpiresByType image\/.+access plus 1 (year|month)/i.test(htaccess), 2);
chk('CSS/JS cached >= 1 week',
  /ExpiresByType (text\/css|application\/javascript)/i.test(htaccess), 2);
chk('Static assets cached 1 year',
  /31536000/i.test(htaccess) ||
  /ExpiresByType image\/.+access plus 1 year/i.test(htaccess), 3);
flush();

// ── 2. CSS ────────────────────────────────────────────────────────────────────
console.log('\n\u25b6 [CSS \u2014 Font & Render]');
// Check display=swap in CSS @import OR in any HTML page <link> (best practice = HTML)
const indexHtml = fs.existsSync(path.join(BASE, 'index.html'))
  ? fs.readFileSync(path.join(BASE, 'index.html'), 'utf8') : '';
chk('Google Fonts has display=swap (CSS or HTML)',
  /fonts\.googleapis\.com[^"'\n]*display=swap/i.test(css) ||
  /fonts\.googleapis\.com[^"']*display=swap/i.test(indexHtml), 3);
chk('No render-blocking @import in CSS',
  !/@import\s+url\(['"]https:/i.test(css), 3);
const cssSize = fs.statSync(path.join(BASE, 'css/style.css')).size;
chk('CSS under 50KB (' + (cssSize / 1024).toFixed(1) + 'KB)', cssSize < 51200, 2);
chk('CSS under 30KB (' + (cssSize / 1024).toFixed(1) + 'KB)', cssSize < 30720, 1);
flush();

// ── 3. PER-PAGE ───────────────────────────────────────────────────────────────
for (const page of PAGES) {
  const fp = path.join(BASE, page);
  if (!fs.existsSync(fp)) continue;
  const html = fs.readFileSync(fp, 'utf8');
  console.log('\n\u25b6 [' + page.toUpperCase() + ']');

  // Scripts defer/async
  const extScripts = (html.match(/<script[^>]+src=["'][^"']+["'][^>]*>/gi) || [])
    .filter(s => !/type=["']application\/ld\+json["']/i.test(s));
  const deferred = extScripts.filter(s => /\bdefer\b|\basync\b/i.test(s)).length;
  chk('Scripts deferred/async (' + deferred + '/' + extScripts.length + ')',
    extScripts.length === 0 || deferred === extScripts.length, 3);

  // preconnect
  chk('preconnect fonts.googleapis.com',
    /rel=["']preconnect["'][^>]*href=["'][^"']*fonts\.googleapis/i.test(html) ||
    /href=["'][^"']*fonts\.googleapis[^"']*["'][^>]*rel=["']preconnect["']/i.test(html), 2);
  chk('preconnect fonts.gstatic.com',
    /rel=["']preconnect["'][^>]*href=["'][^"']*fonts\.gstatic/i.test(html) ||
    /href=["'][^"']*fonts\.gstatic[^"']*["'][^>]*rel=["']preconnect["']/i.test(html), 2);

  // Google Fonts via <link> (not CSS @import)
  chk('Google Fonts loaded via <link> in HTML',
    /href=["'][^"']*fonts\.googleapis\.com\/css[^"']*["'][^>]*rel=["']stylesheet["']/i.test(html) ||
    /rel=["']stylesheet["'][^>]*href=["'][^"']*fonts\.googleapis/i.test(html), 2);

  // Images
  const imgs = html.match(/<img\b[^>]+>/gi) || [];
  const lazyImgs = imgs.filter(i => /\bloading=["']lazy["']/i.test(i)).length;
  const decodingImgs = imgs.filter(i => /\bdecoding=["']async["']/i.test(i)).length;
  const dimsImgs = imgs.filter(i => /\bwidth=["']?\d/i.test(i)).length;

  chk('Images lazy loaded (' + lazyImgs + '/' + imgs.length + ')',
    imgs.length === 0 || lazyImgs / imgs.length >= 0.6, 3);
  chk('Images decoding="async" (' + decodingImgs + '/' + imgs.length + ')',
    imgs.length === 0 || decodingImgs / imgs.length >= 0.6, 2);
  chk('Images have width attribute (' + dimsImgs + '/' + imgs.length + ')',
    imgs.length === 0 || dimsImgs / imgs.length >= 0.6, 2);

  // dns-prefetch
  chk('dns-prefetch for external services',
    /rel=["']dns-prefetch["']/i.test(html), 1);

  // viewport
  chk('Viewport meta present',
    /name=["']viewport["']/i.test(html), 1);

  flush();
}

// ── 4. IMAGES ─────────────────────────────────────────────────────────────────
console.log('\n\u25b6 [IMAGES \u2014 File Sizes]');
let totalSize = 0, count = 0, webp = 0;
const imgDirs = [
  path.join(BASE, 'img'),
  path.join(BASE, 'img/banners'),
  path.join(BASE, 'img/servicos'),
  path.join(BASE, 'img/parceiros'),
];
for (const dir of imgDirs) {
  if (!fs.existsSync(dir)) continue;
  for (const f of fs.readdirSync(dir)) {
    if (!/\.(jpe?g|png|gif|webp|svg)$/i.test(f)) continue;
    if (fs.statSync(path.join(dir, f)).isDirectory()) continue;
    const st = fs.statSync(path.join(dir, f));
    totalSize += st.size;
    count++;
    if (/\.webp$/i.test(f)) webp++;
  }
}
const mb = (totalSize / 1048576).toFixed(2);
chk('Total image weight < 5MB (' + mb + 'MB)', totalSize < 5242880, 3);
chk('Total image weight < 2MB (' + mb + 'MB)', totalSize < 2097152, 3);
chk('WebP images used (' + webp + '/' + count + ')', webp > 0, 3);
flush();

// ── RESULT ────────────────────────────────────────────────────────────────────
const finalScore = Math.round((pts / maxPts) * 100);
const filled = Math.round(finalScore / 5);
const bar = '\u2588'.repeat(filled) + '\u2591'.repeat(20 - filled);
console.log('\n\u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557');
console.log('\u2551  Performance Score: ' + String(finalScore).padEnd(3) + '/100 (' + pts + '/' + maxPts + ' pts)  \u2551');
console.log('\u2551  [' + bar + ']  \u2551');
console.log('\u255a\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255d\n');
process.exit(0);
