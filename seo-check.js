// SEO Audit Script — SOS Montador de Móveis
// Outputs a score 0-100 based on SEO checklist
const fs = require('fs');
const path = require('path');

const pages = ['index.html','servicos.html','empresa.html','clientes.html','contato.html'];
const root  = __dirname;

let total = 0, passed = 0;
const findings = [];

function check(label, ok, weight = 1) {
  total += weight;
  if (ok) { passed += weight; }
  else     { findings.push(`MISS [${weight}pt] ${label}`); }
}

// --- Global files ---
check('robots.txt exists',  fs.existsSync(path.join(root,'robots.txt')), 3);
check('sitemap.xml exists', fs.existsSync(path.join(root,'sitemap.xml')), 3);

// --- Per-page checks ---
for (const page of pages) {
  const file = path.join(root, page);
  if (!fs.existsSync(file)) { findings.push(`PAGE MISSING: ${page}`); continue; }
  const html = fs.readFileSync(file, 'utf8');

  const title       = html.match(/<title>(.*?)<\/title>/is)?.[1]?.trim() || '';
  const desc        = html.match(/<meta[^>]+name="description"[^>]+content="([^"]+)"/i)?.[1] || '';
  const ogTitle     = html.match(/og:title/i);
  const ogDesc      = html.match(/og:description/i);
  const ogImg       = html.match(/og:image/i);
  const canonical   = html.match(/<link[^>]+rel="canonical"/i);
  const schemaLD    = html.match(/<script[^>]+type="application\/ld\+json"/i);
  const h1count     = (html.match(/<h1[\s>]/gi) || []).length;
  const imgNoAlt    = (html.match(/<img(?![^>]*alt=)[^>]*>/gi) || []).length;
  const extLinks    = html.match(/href="https?:\/\//gi) || [];
  const noopener    = html.match(/noopener/gi) || [];
  const twitterCard = html.match(/twitter:card/i);
  const viewport    = html.match(/name="viewport"/i);
  const charset     = html.match(/charset=/i);

  const p = page;
  check(`${p}: <title> presente`,             title.length > 0, 2);
  check(`${p}: <title> 40-65 chars`,          title.length >= 40 && title.length <= 65, 1);
  check(`${p}: meta description presente`,    desc.length > 0, 2);
  check(`${p}: meta description 120-160`,     desc.length >= 120 && desc.length <= 160, 1);
  check(`${p}: og:title`,                     !!ogTitle, 1);
  check(`${p}: og:description`,               !!ogDesc, 1);
  check(`${p}: og:image`,                     !!ogImg, 1);
  check(`${p}: canonical URL`,                !!canonical, 2);
  check(`${p}: schema ld+json`,               !!schemaLD, 3);
  check(`${p}: exatamente 1 H1`,              h1count === 1, 2);
  check(`${p}: imgs sem alt = 0`,             imgNoAlt === 0, 2);
  check(`${p}: twitter:card`,                 !!twitterCard, 1);
  check(`${p}: viewport meta`,                !!viewport, 1);
  check(`${p}: charset`,                      !!charset, 1);
  check(`${p}: links externos c/ noopener`,   extLinks.length === 0 || noopener.length > 0, 1);
}

const score = Math.round((passed / total) * 100);
console.log(`\nSEO Score: ${score}/100  (${passed}/${total} pts)`);
if (findings.length) {
  console.log('\nMelhorias pendentes:');
  findings.forEach(f => console.log(' -', f));
}
process.exit(0);
