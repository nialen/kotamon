#!/usr/bin/env node

import { spawn } from 'node:child_process';
import process from 'node:process';
import { createServer } from 'node:net';
import { pathToFileURL } from 'node:url';

import { JSDOM } from 'jsdom';

const DEFAULT_HOST = '127.0.0.1';
const DEFAULT_PORT = 3214;
const DEFAULT_START_PATH = '/en';
const START_TIMEOUT_MS = 30_000;

function sleep(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function readOption(args, name) {
  const index = args.indexOf(name);
  if (index === -1) {
    return undefined;
  }

  const value = args[index + 1];
  if (!value || value.startsWith('--')) {
    throw new Error(`Missing value after ${name}`);
  }
  return value;
}

function normalizeBaseUrl(value) {
  const url = new URL(value);
  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error(`Unsupported base URL protocol: ${url.protocol}`);
  }
  url.hash = '';
  url.pathname = '/';
  url.search = '';
  return url.toString().replace(/\/$/, '');
}

function internalTarget(href, sourceUrl, origin) {
  const value = href.trim();
  if (value.startsWith('#') || /^(?:mailto|tel):/i.test(value)) {
    return { kind: 'ignored' };
  }

  let target;
  try {
    target = new URL(value, sourceUrl);
  } catch {
    return { kind: 'invalid' };
  }

  if (!['http:', 'https:'].includes(target.protocol)) {
    return { kind: 'unsupported', protocol: target.protocol };
  }

  if (target.origin !== origin) {
    return { kind: 'ignored' };
  }

  target.hash = '';
  return { kind: 'internal', target: target.toString() };
}

export async function crawlInternalLinks({
  baseUrl,
  startPath = DEFAULT_START_PATH,
  fetchImpl = fetch,
}) {
  const normalizedBaseUrl = normalizeBaseUrl(baseUrl);
  const origin = new URL(normalizedBaseUrl).origin;
  const startUrl = new URL(startPath, `${normalizedBaseUrl}/`).toString();
  const queued = new Set([startUrl]);
  const queue = [{ target: startUrl, source: startUrl, href: startPath }];
  const visited = [];
  const broken = [];

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) {
      break;
    }

    let response;
    try {
      response = await fetchImpl(current.target, { redirect: 'manual' });
    } catch (error) {
      broken.push({
        source: current.source,
        href: current.href,
        target: current.target,
        status: `network error: ${error instanceof Error ? error.message : String(error)}`,
      });
      continue;
    }

    visited.push(current.target);
    if (response.status !== 200) {
      broken.push({
        source: current.source,
        href: current.href,
        target: current.target,
        status: response.status,
      });
      continue;
    }

    const contentType = response.headers.get('content-type') ?? '';
    if (!contentType.toLowerCase().includes('text/html')) {
      continue;
    }

    const document = new JSDOM(await response.text()).window.document;
    for (const anchor of document.querySelectorAll('a[href]')) {
      const href = anchor.getAttribute('href');
      if (href === null) {
        continue;
      }
      const resolved = internalTarget(href, current.target, origin);
      if (resolved.kind === 'invalid') {
        broken.push({
          source: current.target,
          href,
          target: null,
          status: 'invalid URL',
          reason: 'URL parser rejected href',
        });
        continue;
      }
      if (resolved.kind === 'unsupported') {
        broken.push({
          source: current.target,
          href,
          target: null,
          status: 'unsupported URL scheme',
          reason: `Only http, https, mailto, tel, and fragment links are supported; received ${resolved.protocol}`,
        });
        continue;
      }
      if (resolved.kind === 'ignored' || queued.has(resolved.target)) {
        continue;
      }
      queued.add(resolved.target);
      queue.push({ target: resolved.target, source: current.target, href });
    }
  }

  return { startUrl, visited, broken };
}

function commandOutputCollector(child) {
  let output = '';
  const append = (chunk) => {
    output = `${output}${chunk.toString()}`.slice(-12_000);
  };
  child.stdout?.on('data', append);
  child.stderr?.on('data', append);
  return () => output;
}

export function createSingleFlightCleanup(cleanupAction) {
  let cleanupPromise;

  return () => {
    if (!cleanupPromise) {
      try {
        cleanupPromise = Promise.resolve(cleanupAction());
      } catch (error) {
        cleanupPromise = Promise.reject(error);
      }
    }
    return cleanupPromise;
  };
}

export function assertOwnedTreeKillResult({
  childExitCode,
  exitCode,
  output,
  pid,
}) {
  if (exitCode === 0 || childExitCode !== null) {
    return;
  }

  const detail = output.trim();
  throw new Error(
    `taskkill failed for owned process tree PID ${pid} with exit code ${exitCode}.${detail ? `\n${detail}` : ''}`,
  );
}

function startProductionServer({ host, port }) {
  const isWindows = process.platform === 'win32';
  const command = isWindows ? (process.env.ComSpec ?? 'cmd.exe') : 'pnpm';
  const args = isWindows
    ? [
        '/d',
        '/s',
        '/c',
        `pnpm start --hostname ${host} --port ${port}`,
      ]
    : ['start', '--hostname', host, '--port', String(port)];
  const child = spawn(command, args, {
    cwd: process.cwd(),
    detached: !isWindows,
    env: {
      ...process.env,
      NEXT_TELEMETRY_DISABLED: '1',
    },
    shell: false,
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true,
  });
  const output = commandOutputCollector(child);
  const server = { child, output, stop: undefined };
  server.stop = createSingleFlightCleanup(() =>
    stopOwnedProductionServer(server),
  );
  return server;
}

async function waitForServer(server, readyUrl) {
  const deadline = Date.now() + START_TIMEOUT_MS;
  while (Date.now() < deadline) {
    if (server.child.exitCode !== null) {
      throw new Error(
        `Production server exited with ${server.child.exitCode} before startup.\n${server.output()}`,
      );
    }

    try {
      const response = await fetch(readyUrl, {
        redirect: 'manual',
        signal: AbortSignal.timeout(1_000),
      });
      if (response.status === 200) {
        return;
      }
    } catch {
      // Server is not ready yet.
    }
    await sleep(250);
  }

  throw new Error(
    `Production server did not become ready within ${START_TIMEOUT_MS}ms.\n${server.output()}`,
  );
}

async function stopOwnedProductionServer(server) {
  if (server.child.exitCode !== null || !server.child.pid) {
    return;
  }

  if (process.platform === 'win32') {
    const killer = spawn(
      'taskkill.exe',
      ['/PID', String(server.child.pid), '/T', '/F'],
      { stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true },
    );
    const killerOutput = commandOutputCollector(killer);
    const exitCode = await new Promise((resolve, reject) => {
      killer.once('error', reject);
      killer.once('close', resolve);
    });
    if (exitCode !== 0) {
      await sleep(50);
      assertOwnedTreeKillResult({
        childExitCode: server.child.exitCode,
        exitCode,
        output: killerOutput(),
        pid: server.child.pid,
      });
    }
    return;
  }

  try {
    process.kill(-server.child.pid, 'SIGTERM');
  } catch (error) {
    if (!(error instanceof Error) || !('code' in error) || error.code !== 'ESRCH') {
      throw error;
    }
  }
}

function stopProductionServer(server) {
  if (!server) {
    return Promise.resolve();
  }
  return server.stop();
}

async function assertPortAvailable(host, port) {
  await new Promise((resolve, reject) => {
    const probe = createServer();
    probe.once('error', (error) => reject(
      error.code === 'EADDRINUSE'
        ? new Error(`Port ${host}:${port} is already in use. Stop the stale preview or choose --port; use --base-url only for an intentionally external server.`)
        : error,
    ));
    probe.listen(port, host, () => probe.close((error) => error ? reject(error) : resolve()));
  });
}

async function runCli() {
  const args = process.argv.slice(2);
  const requestedBaseUrl =
    readOption(args, '--base-url') ?? process.env.KOTAMON_CRAWL_BASE_URL;
  const startPath = readOption(args, '--start') ?? DEFAULT_START_PATH;
  const host = readOption(args, '--host') ?? DEFAULT_HOST;
  if (!/^[a-z0-9.-]+$/i.test(host)) {
    throw new Error(`Invalid host: ${host}`);
  }
  const portValue = readOption(args, '--port') ?? String(DEFAULT_PORT);
  const port = Number(portValue);
  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    throw new Error(`Invalid port: ${portValue}`);
  }

  const baseUrl = normalizeBaseUrl(
    requestedBaseUrl ?? `http://${host}:${port}`,
  );
  let server;
  const stopForSignal = () => {
    process.exitCode = 130;
    void stopProductionServer(server).catch((error) => {
      console.error(
        `Production server cleanup failed: ${error instanceof Error ? error.message : String(error)}`,
      );
      process.exitCode = 1;
    });
  };
  process.once('SIGINT', stopForSignal);
  process.once('SIGTERM', stopForSignal);

  try {
    if (!requestedBaseUrl) {
      await assertPortAvailable(host, port);
      server = startProductionServer({ host, port });
      await waitForServer(
        server,
        new URL(startPath, `${baseUrl}/`).toString(),
      );
    }

    const result = await crawlInternalLinks({ baseUrl, startPath });
    console.log(`Internal link crawl start: ${result.startUrl}`);
    console.log(`Internal pages visited: ${result.visited.length}`);
    console.log(`Broken internal links: ${result.broken.length}`);

    if (result.broken.length > 0) {
      for (const finding of result.broken) {
        const target = finding.target ?? '(unparseable)';
        const reason = finding.reason ? `; ${finding.reason}` : '';
        console.error(
          `- source ${finding.source} -> href ${finding.href} -> target ${target}: ${finding.status}${reason}`,
        );
      }
      process.exitCode = 1;
      return;
    }

    console.log('Internal link crawl passed.');
  } finally {
    process.removeListener('SIGINT', stopForSignal);
    process.removeListener('SIGTERM', stopForSignal);
    await stopProductionServer(server);
  }
}

const isCli =
  process.argv[1] !== undefined &&
  pathToFileURL(process.argv[1]).href === import.meta.url;

if (isCli) {
  await runCli();
}
