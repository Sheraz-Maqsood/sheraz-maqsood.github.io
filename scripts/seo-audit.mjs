import fs from 'node:fs';
import path from 'node:path';
import SeoAnalyzer from 'seo-analyzer';

const rootDir = process.cwd();
const indexHtmlPath = path.join(rootDir, 'index.html');
const projectHtmlPath = path.join(rootDir, 'project.html');
const sitemapPath = path.join(rootDir, 'sitemap.xml');
const robotsPath = path.join(rootDir, 'robots.txt');

console.log('=====================================================');
console.log('🔍 AUTOMATED AI-GRADE SEO AUDIT & DIAGNOSTIC SYSTEM');
console.log('=====================================================\n');

// 1. Run SeoAnalyzer library on index.html
async function runLibraryAnalyzer() {
  console.log('▶ [1/4] Running Library SEO Analyzer...');
  try {
    const analyzer = new SeoAnalyzer();
    const result = await analyzer
      .inputFiles([indexHtmlPath, projectHtmlPath])
      .addRule('titleRangCheck', { min: 10, max: 70 })
      .addRule('imgTagWithAltAttributeRule')
      .addRule('aTagWithRelAttributeRule')
      .addRule('metaBaseRule', { list: ['description', 'viewport', 'robots'] })
      .outputConsole();
  } catch (err) {
    console.error('Analyzer notice:', err.message);
  }
}

// 2. Comprehensive Deep Inspection
function runDeepAudit() {
  console.log('\n▶ [2/4] Performing Deep Tag & Structural Audit for index.html...');
  const indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');

  // Title check
  const titleMatch = indexHtml.match(/<title>([^<]+)<\/title>/i);
  const title = titleMatch ? titleMatch[1] : null;
  console.log(`- Title: "${title}" (${title ? title.length : 0} chars)`);
  if (!title) {
    console.log('  ❌ CRITICAL: Missing <title> tag');
  } else if (title.length < 30 || title.length > 65) {
    console.log('  ⚠️ NOTE: Title length ideally between 30 and 60 chars for SERP snippet display.');
  } else {
    console.log('  ✅ Title length optimal.');
  }

  // Meta description
  const descMatch = indexHtml.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);
  const desc = descMatch ? descMatch[1] : null;
  console.log(`- Description: "${desc}" (${desc ? desc.length : 0} chars)`);
  if (!desc) {
    console.log('  ❌ CRITICAL: Missing meta description');
  } else if (desc.length < 120 || desc.length > 160) {
    console.log(`  ⚠️ TIP: Description is ${desc.length} chars (140-160 chars recommended to avoid SERP truncation).`);
  } else {
    console.log('  ✅ Meta description length optimal.');
  }

  // Canonical
  const canonMatch = indexHtml.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i);
  console.log(`- Canonical: ${canonMatch ? canonMatch[1] : '❌ MISSING'}`);

  // Open Graph
  const ogTags = ['og:title', 'og:description', 'og:image', 'og:url', 'og:type', 'og:site_name'];
  ogTags.forEach(tag => {
    const match = indexHtml.match(new RegExp(`<meta\\s+property=["']${tag}["']\\s+content=["']([^"']+)["']`, 'i'));
    console.log(`- OG [${tag}]: ${match ? '✅ ' + match[1] : '⚠️ Missing ' + tag}`);
  });

  // Twitter Card
  const twitterTags = ['twitter:card', 'twitter:title', 'twitter:description', 'twitter:image'];
  twitterTags.forEach(tag => {
    const match = indexHtml.match(new RegExp(`<meta\\s+name=["']${tag}["']\\s+content=["']([^"']+)["']`, 'i'));
    console.log(`- Twitter [${tag}]: ${match ? '✅ ' + match[1] : '⚠️ Missing ' + tag}`);
  });

  // JSON-LD Structured Data
  const jsonLdMatches = [...indexHtml.matchAll(/<script\s+type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/gi)];
  console.log(`- Structured Data (JSON-LD): Found ${jsonLdMatches.length} block(s)`);
  jsonLdMatches.forEach((m, idx) => {
    try {
      const parsed = JSON.parse(m[1]);
      console.log(`  ✅ Block ${idx + 1} valid JSON-LD: Type(s) = ${parsed['@type'] || (parsed['@graph'] ? parsed['@graph'].map(g => g['@type']).join(', ') : 'unknown')}`);
    } catch (e) {
      console.log(`  ❌ Block ${idx + 1} JSON-LD parsing error: ${e.message}`);
    }
  });

  // Heading hierarchy
  console.log('\n▶ [3/4] Headings Hierarchy Analysis:');
  const h1s = [...indexHtml.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)];
  const h2s = [...indexHtml.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi)];
  const h3s = [...indexHtml.matchAll(/<h3[^>]*>([\s\S]*?)<\/h3>/gi)];
  console.log(`- H1 count: ${h1s.length} ${h1s.length === 1 ? '✅ (Perfect single H1)' : '⚠️ (Should be exactly 1)'}`);
  console.log(`- H2 count: ${h2s.length} sections`);
  h2s.forEach((h, i) => console.log(`   ${i + 1}. H2: ${h[1].replace(/<[^>]+>/g, '').trim()}`));
  console.log(`- H3 count: ${h3s.length}`);

  // Image audit
  console.log('\n▶ [4/4] Images & Links Audit:');
  const imgTags = [...indexHtml.matchAll(/<img([^>]+)>/gi)];
  let missingAlt = 0;
  let missingDimensions = 0;
  imgTags.forEach(img => {
    const attrs = img[1];
    if (!attrs.includes('alt="') && !attrs.includes("alt='")) {
      missingAlt++;
    }
    if (!attrs.includes('width=') || !attrs.includes('height=')) {
      missingDimensions++;
    }
  });
  console.log(`- Total <img> tags: ${imgTags.length}`);
  console.log(`- Missing 'alt' attribute: ${missingAlt} ${missingAlt === 0 ? '✅' : '⚠️'}`);
  console.log(`- Missing explicit width/height (CLS prevention): ${missingDimensions} ${missingDimensions === 0 ? '✅' : '⚠️'}`);

  // Internal anchors check
  const anchors = [...indexHtml.matchAll(/href=["'](#[\w-]+)["']/gi)].map(m => m[1]);
  const uniqueAnchors = [...new Set(anchors)];
  const brokenAnchors = [];
  uniqueAnchors.forEach(a => {
    const id = a.replace('#', '');
    if (!indexHtml.includes(`id="${id}"`) && !indexHtml.includes(`id='${id}'`)) {
      brokenAnchors.push(a);
    }
  });
  console.log(`- Internal anchor links verified: ${uniqueAnchors.length}`);
  if (brokenAnchors.length > 0) {
    console.log(`  ❌ Broken internal anchors found: ${brokenAnchors.join(', ')}`);
  } else {
    console.log('  ✅ All internal section anchor targets exist and resolve!');
  }
}

async function main() {
  await runLibraryAnalyzer();
  runDeepAudit();
  console.log('\n=====================================================');
  console.log('✨ SEO AUDIT COMPLETE');
  console.log('=====================================================');
}

main();
