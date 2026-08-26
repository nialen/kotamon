#!/usr/bin/env node

import { promises as fs } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const SOURCE_EXTENSIONS = new Set([
  '.css',
  '.html',
  '.js',
  '.jsx',
  '.json',
  '.md',
  '.mdx',
  '.mjs',
  '.ts',
  '.tsx',
]);
const CONTENT_EXTENSIONS = new Set(['.md', '.mdx']);
const PUBLIC_METADATA_EXTENSIONS = new Set([
  '.html',
  '.htm',
  '.json',
  '.svg',
  '.txt',
  '.webmanifest',
  '.xml',
]);

const ALLOWED_SOURCE_HOSTS = new Set([
  'guidexon.com',
  'kotamondb.wiki',
  'steamcommunity.com',
  'store.steampowered.com',
]);

const CHECKS = [
  {
    label: 'Create Next App starter text',
    expression: /create\s+next\s+app/gi,
    sourceFieldMayBeAllowed: true,
  },
  {
    label: 'Vercel starter reference',
    expression: /\bvercel\b/gi,
    sourceFieldMayBeAllowed: true,
  },
  {
    label: 'example.com placeholder domain',
    expression: /\b(?:www\.)?example\.com\b/gi,
    sourceFieldMayBeAllowed: true,
  },
  {
    label: 'lorem ipsum placeholder copy',
    expression: /\blorem\s+ipsum\b/gi,
    sourceFieldMayBeAllowed: false,
  },
  {
    label: 'visible em dash',
    expression: /—/g,
    sourceFieldMayBeAllowed: false,
  },
  {
    label: 'visible en dash',
    expression: /–/g,
    sourceFieldMayBeAllowed: false,
  },
];

function projectRootFromArgs(args) {
  const rootIndex = args.indexOf('--root');
  if (rootIndex === -1) {
    return process.cwd();
  }

  const requestedRoot = args[rootIndex + 1];
  if (!requestedRoot) {
    throw new Error('Missing path after --root');
  }

  return path.resolve(process.cwd(), requestedRoot);
}

function printablePath(projectRoot, filePath) {
  return path.relative(projectRoot, filePath).split(path.sep).join('/');
}

async function collectTextFiles(directory, allowedExtensions) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        return collectTextFiles(entryPath, allowedExtensions);
      }
      return entry.isFile() && allowedExtensions.has(path.extname(entry.name).toLowerCase())
        ? [entryPath]
        : [];
    }),
  );

  return files.flat();
}

function isAllowedSourceField(line) {
  const sourceMatch = line.match(/^\s*url:\s*['"]?(https:\/\/[^\s'"]+)/i);
  if (!sourceMatch) {
    return false;
  }

  try {
    return ALLOWED_SOURCE_HOSTS.has(new URL(sourceMatch[1]).hostname.toLowerCase());
  } catch {
    return false;
  }
}

function findLineResidue(line, lineNumber, filePath) {
  const findings = [];
  const allowedSourceField = isAllowedSourceField(line);

  for (const check of CHECKS) {
    if (check.sourceFieldMayBeAllowed && allowedSourceField) {
      continue;
    }

    check.expression.lastIndex = 0;
    let match;
    while ((match = check.expression.exec(line)) !== null) {
      findings.push({
        filePath,
        line: lineNumber,
        column: match.index + 1,
        label: check.label,
      });

      if (match[0].length === 0) {
        check.expression.lastIndex += 1;
      }
    }
  }

  return findings;
}

async function main() {
  const projectRoot = projectRootFromArgs(process.argv.slice(2));
  const scanTargets = [
    ['src', SOURCE_EXTENSIONS],
    ['content', CONTENT_EXTENSIONS],
    ['public', PUBLIC_METADATA_EXTENSIONS],
  ];
  const findings = [];
  const files = [];

  for (const [relativeDirectory, extensions] of scanTargets) {
    const directory = path.join(projectRoot, relativeDirectory);
    try {
      files.push(...(await collectTextFiles(directory, extensions)));
    } catch (error) {
      findings.push({
        filePath: relativeDirectory,
        line: 1,
        column: 1,
        label: `unable to scan directory: ${error.message}`,
      });
    }
  }

  files.sort((left, right) => left.localeCompare(right, 'en'));

  for (const filePath of files) {
    const relativePath = printablePath(projectRoot, filePath);
    const source = await fs.readFile(filePath, 'utf8');
    const lines = source.split(/\r?\n/);
    for (const [index, line] of lines.entries()) {
      findings.push(...findLineResidue(line, index + 1, relativePath));
    }
  }

  console.log(`Scanned text files: ${files.length}`);
  console.log(`Template residue findings: ${findings.length}`);

  if (findings.length > 0) {
    for (const finding of findings) {
      console.error(
        `- ${finding.filePath}:${finding.line}:${finding.column}: ${finding.label}`,
      );
    }
    process.exitCode = 1;
    return;
  }

  console.log('Template residue scan passed.');
}

await main();
