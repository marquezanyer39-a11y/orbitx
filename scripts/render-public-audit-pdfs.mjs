import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = process.cwd();
const OUTPUT_DIR = path.join(ROOT, 'docs', 'pdf', 'auditoria-publica');
const CHROME_PATHS = [
  path.join(process.env.ProgramFiles || '', 'Google', 'Chrome', 'Application', 'chrome.exe'),
  path.join(process.env['ProgramFiles(x86)'] || '', 'Google', 'Chrome', 'Application', 'chrome.exe'),
  path.join(process.env.ProgramFiles || '', 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
  path.join(process.env['ProgramFiles(x86)'] || '', 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
];

const DOCUMENTS = [
  {
    number: '01',
    source: 'docs/PUBLIC_READINESS_AUDIT_REPORT.md',
    title: 'OrbitX Public Readiness Audit',
    output: '01-orbitx-public-readiness-audit.pdf',
  },
  {
    number: '02',
    source: 'docs/PUBLIC_RELEASE_CHECKLIST.md',
    title: 'OrbitX Public Release Checklist',
    output: '02-orbitx-public-release-checklist.pdf',
  },
  {
    number: '03',
    source: 'docs/ADVANCED_APP_ROADMAP.md',
    title: 'OrbitX Advanced App Roadmap',
    output: '03-orbitx-advanced-app-roadmap.pdf',
  },
  {
    number: '04',
    source: 'docs/PUBLIC_RELEASE_RISK_REGISTER.md',
    title: 'OrbitX Public Release Risk Register',
    output: '04-orbitx-public-release-risk-register.pdf',
  },
];

function escapeHtml(value) {
  return `${value ?? ''}`
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function inlineMarkdown(value) {
  return escapeHtml(value)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
}

function splitTableRow(line) {
  return line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((cell) => cell.trim());
}

function isTableSeparator(line) {
  return /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(line);
}

function renderTable(lines, startIndex) {
  const header = splitTableRow(lines[startIndex]);
  const rows = [];
  let index = startIndex + 2;

  while (index < lines.length && /^\s*\|/.test(lines[index])) {
    rows.push(splitTableRow(lines[index]));
    index += 1;
  }

  const html = [
    '<div class="table-wrap"><table>',
    '<thead><tr>',
    ...header.map((cell) => `<th>${inlineMarkdown(cell)}</th>`),
    '</tr></thead>',
    '<tbody>',
    ...rows.map((row) => (
      `<tr>${row.map((cell) => `<td>${inlineMarkdown(cell)}</td>`).join('')}</tr>`
    )),
    '</tbody></table></div>',
  ].join('');

  return { html, nextIndex: index };
}

function renderList(lines, startIndex, ordered = false) {
  const tag = ordered ? 'ol' : 'ul';
  const items = [];
  let index = startIndex;
  const pattern = ordered ? /^\s*\d+\.\s+/ : /^\s*-\s+/;

  while (index < lines.length && pattern.test(lines[index])) {
    items.push(lines[index].replace(pattern, '').trim());
    index += 1;
  }

  return {
    html: `<${tag}>${items.map((item) => `<li>${inlineMarkdown(item)}</li>`).join('')}</${tag}>`,
    nextIndex: index,
  };
}

function renderMarkdown(markdown) {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  const output = [];
  let index = 0;
  let inCode = false;
  let codeLines = [];

  while (index < lines.length) {
    const line = lines[index];

    if (line.trim().startsWith('```')) {
      if (inCode) {
        output.push(`<pre><code>${escapeHtml(codeLines.join('\n'))}</code></pre>`);
        codeLines = [];
        inCode = false;
      } else {
        inCode = true;
      }
      index += 1;
      continue;
    }

    if (inCode) {
      codeLines.push(line);
      index += 1;
      continue;
    }

    if (!line.trim()) {
      index += 1;
      continue;
    }

    if (/^\s*\|/.test(line) && lines[index + 1] && isTableSeparator(lines[index + 1])) {
      const rendered = renderTable(lines, index);
      output.push(rendered.html);
      index = rendered.nextIndex;
      continue;
    }

    const heading = line.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      const level = heading[1].length;
      output.push(`<h${level}>${inlineMarkdown(heading[2])}</h${level}>`);
      index += 1;
      continue;
    }

    if (/^\s*-\s+/.test(line)) {
      const rendered = renderList(lines, index);
      output.push(rendered.html);
      index = rendered.nextIndex;
      continue;
    }

    if (/^\s*\d+\.\s+/.test(line)) {
      const rendered = renderList(lines, index, true);
      output.push(rendered.html);
      index = rendered.nextIndex;
      continue;
    }

    output.push(`<p>${inlineMarkdown(line.trim())}</p>`);
    index += 1;
  }

  return output.join('\n');
}

function buildHtml({ title, markdown }) {
  const rendered = renderMarkdown(markdown);
  return `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(title)}</title>
  <style>
    @page { size: A4 landscape; margin: 11mm; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      background: #f7f8fb;
      color: #111827;
      font-family: "Segoe UI", Arial, sans-serif;
      font-size: 10.5px;
      line-height: 1.42;
    }
    .page {
      background: #ffffff;
      border: 1px solid #dde2ec;
      border-radius: 18px;
      padding: 22px;
      min-height: calc(100vh - 22mm);
    }
    .cover {
      border-radius: 16px;
      padding: 22px;
      margin-bottom: 18px;
      color: #f8fafc;
      background:
        radial-gradient(circle at 15% 0%, rgba(59,167,255,0.32), transparent 34%),
        radial-gradient(circle at 90% 12%, rgba(71,243,209,0.22), transparent 36%),
        linear-gradient(135deg, #08090B, #111827 48%, #14121C);
    }
    .kicker {
      margin: 0 0 8px;
      color: #47F3D1;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.18em;
      text-transform: uppercase;
    }
    .cover h1 {
      margin: 0;
      color: #ffffff;
      font-size: 28px;
      line-height: 1.05;
      letter-spacing: -0.04em;
    }
    .meta {
      margin-top: 12px;
      color: #cbd5e1;
      font-size: 11px;
    }
    h1, h2, h3, h4 {
      color: #0f172a;
      letter-spacing: -0.02em;
      page-break-after: avoid;
    }
    h1 { font-size: 24px; margin: 18px 0 10px; }
    h2 {
      border-top: 1px solid #e5e7eb;
      margin: 20px 0 9px;
      padding-top: 14px;
      font-size: 17px;
    }
    h3 { font-size: 13.5px; margin: 14px 0 7px; }
    h4 { font-size: 12px; margin: 10px 0 6px; }
    p { margin: 6px 0; }
    ul, ol { margin: 6px 0 9px 18px; padding: 0; }
    li { margin: 3px 0; }
    code {
      border-radius: 5px;
      background: #eef2ff;
      color: #312e81;
      padding: 1px 4px;
      font-size: 9.5px;
    }
    pre {
      white-space: pre-wrap;
      border-radius: 12px;
      background: #0f172a;
      color: #e5e7eb;
      padding: 12px;
      overflow: hidden;
    }
    pre code { background: transparent; color: inherit; padding: 0; }
    .table-wrap {
      width: 100%;
      margin: 10px 0 14px;
      overflow: visible;
      page-break-inside: auto;
    }
    table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
      table-layout: fixed;
      font-size: 8.8px;
    }
    th, td {
      border-right: 1px solid #e5e7eb;
      border-bottom: 1px solid #e5e7eb;
      padding: 5px 6px;
      vertical-align: top;
      word-break: break-word;
    }
    th:first-child, td:first-child { border-left: 1px solid #e5e7eb; }
    th {
      background: #101827;
      color: #f8fafc;
      font-weight: 700;
      text-align: left;
    }
    tr:nth-child(even) td { background: #f8fafc; }
    tr:nth-child(odd) td { background: #ffffff; }
    thead tr:first-child th:first-child { border-top-left-radius: 8px; }
    thead tr:first-child th:last-child { border-top-right-radius: 8px; }
  </style>
</head>
<body>
  <main class="page">
    <section class="cover">
      <p class="kicker">OrbitX · Auditoría pública</p>
      <h1>${escapeHtml(title)}</h1>
      <div class="meta">Documento generado para trabajo interno · ${new Date().toISOString().slice(0, 10)}</div>
    </section>
    ${rendered}
  </main>
</body>
</html>`;
}

function findChrome() {
  return CHROME_PATHS.find((candidate) => candidate && fs.existsSync(candidate));
}

function ensureOutputDir() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

function renderPdf(chromePath, htmlPath, pdfPath) {
  const userDataDir = path.join(OUTPUT_DIR, '.chrome-profile');
  fs.mkdirSync(userDataDir, { recursive: true });
  const result = spawnSync(chromePath, [
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    `--user-data-dir=${userDataDir}`,
    '--no-pdf-header-footer',
    `--print-to-pdf=${pdfPath}`,
    pathToFileURL(htmlPath).href,
  ], {
    encoding: 'utf8',
    stdio: 'pipe',
  });

  if (result.status !== 0) {
    throw new Error(`Chrome PDF render failed for ${htmlPath}\n${result.stderr}\n${result.stdout}`);
  }
}

function writeIndex(outputs) {
  const lines = [
    '# PDFs Auditoria Publica OrbitX',
    '',
    'Archivos generados en orden de trabajo:',
    '',
    ...outputs.map((item) => `- ${item.number}. ${item.title}: ${item.output}`),
    '',
    'Fuente Markdown:',
    '',
    ...outputs.map((item) => `- ${item.source}`),
    '',
  ];
  fs.writeFileSync(path.join(OUTPUT_DIR, 'README.md'), lines.join('\n'), 'utf8');
}

ensureOutputDir();
const chromePath = findChrome();

if (!chromePath) {
  throw new Error('No se encontro Chrome/Edge local para generar PDFs.');
}

const outputs = DOCUMENTS.map((document) => {
  const sourcePath = path.join(ROOT, document.source);
  const markdown = fs.readFileSync(sourcePath, 'utf8');
  const html = buildHtml({ title: document.title, markdown });
  const htmlPath = path.join(OUTPUT_DIR, document.output.replace(/\.pdf$/, '.html'));
  const pdfPath = path.join(OUTPUT_DIR, document.output);
  fs.writeFileSync(htmlPath, html, 'utf8');
  renderPdf(chromePath, htmlPath, pdfPath);
  return document;
});

writeIndex(outputs);
console.log(`PDFs generados en ${OUTPUT_DIR}`);
for (const item of outputs) {
  console.log(`${item.number}. ${item.output}`);
}
