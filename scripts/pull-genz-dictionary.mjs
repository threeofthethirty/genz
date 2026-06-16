#!/usr/bin/env node
'use strict';

import fs from 'node:fs';
import path from 'node:path';

const SOURCE_URL = 'https://www.generationzslang.com/the-complete-gen-z-slang-dictionary/';
const OUT_PATH = path.resolve('skills/genz/data/genz-slang-index.json');

function decodeHtml(text) {
  return text
    .replace(/&#8211;|&ndash;/g, '-')
    .replace(/&#8212;|&mdash;/g, '-')
    .replace(/&#8217;|&rsquo;|&#039;/g, "'")
    .replace(/&#8220;|&#8221;|&ldquo;|&rdquo;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function stripHtml(html) {
  return decodeHtml(html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<\/(h2|li|p|div|section|article|em|strong)>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/\r/g, ''));
}

function parseEntries(html) {
  const entries = [];
  let section = '';
  const tokenRe = /<h2[^>]*>([\s\S]*?)<\/h2>|<li[^>]*>([\s\S]*?)<\/li>/gi;
  let match;

  while ((match = tokenRe.exec(html))) {
    if (match[1]) {
      const heading = stripHtml(match[1]).trim();
      if (/^[A-Z]$/.test(heading)) section = heading;
      continue;
    }

    if (!match[2] || !section) continue;
    const item = match[2];
    const termMatch = /<strong[^>]*>([\s\S]*?)<\/strong>\s*(?:\([^)]*\))?\s*(?:&#8211;|&ndash;|—|-)\s*([\s\S]*)/i.exec(item);
    if (!termMatch) continue;

    const term = stripHtml(termMatch[1]).replace(/\s+/g, ' ').trim();
    const definition = stripHtml(termMatch[2]).replace(/\s+/g, ' ').trim();
    if (!term || !definition) continue;
    if (term.length > 80 || definition.length < 8) continue;

    entries.push({
      term,
      key: term.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
      section,
      sourceDefinition: definition,
    });
  }

  const seen = new Set();
  return entries.filter((entry) => {
    if (seen.has(entry.key)) return false;
    seen.add(entry.key);
    return true;
  });
}

async function writeFirestore(index) {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const token = process.env.FIREBASE_AUTH_TOKEN;
  if (!projectId || !token) {
    throw new Error('FIREBASE_PROJECT_ID and FIREBASE_AUTH_TOKEN are required for --firebase');
  }

  const base = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`;
  const collection = process.env.FIREBASE_COLLECTION || 'genz_slang';

  for (const entry of index.entries) {
    const url = `${base}/${collection}/${encodeURIComponent(entry.key)}`;
    const body = {
      fields: {
        term: { stringValue: entry.term },
        key: { stringValue: entry.key },
        section: { stringValue: entry.section },
        sourceDefinition: { stringValue: entry.sourceDefinition },
        sourceUrl: { stringValue: index.source.url },
        fetchedAt: { stringValue: index.source.fetchedAt },
      },
    };
    const res = await fetch(url, {
      method: 'PATCH',
      headers: {
        authorization: `Bearer ${token}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const detail = await res.text();
      throw new Error(`Firestore write failed for ${entry.key}: ${res.status} ${detail}`);
    }
  }
}

async function main() {
  const args = new Set(process.argv.slice(2));
  const res = await fetch(SOURCE_URL, {
    headers: {
      'user-agent': 'genz-skill-indexer/1.0',
    },
  });
  if (!res.ok) throw new Error(`Fetch failed: ${res.status} ${res.statusText}`);

  const html = await res.text();
  const entries = parseEntries(html);
  if (entries.length < 50) {
    throw new Error(`Parsed only ${entries.length} entries; source structure may have changed`);
  }

  const index = {
    version: 1,
    source: {
      url: SOURCE_URL,
      fetchedAt: new Date().toISOString(),
      licenseNote: 'Reference index generated from the public source page for local skill use.',
    },
    usage: {
      guidance: 'Use entries as meaning guardrails. Do not force slang into every sentence.',
      maxSlangPerNormalReply: 3,
    },
    entries,
  };

  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  fs.writeFileSync(OUT_PATH, JSON.stringify(index, null, 2) + '\n');
  console.log(`wrote ${OUT_PATH} (${entries.length} entries)`);

  if (args.has('--firebase')) {
    await writeFirestore(index);
    console.log(`indexed ${entries.length} entries in Firebase Firestore`);
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
