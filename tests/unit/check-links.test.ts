import { createServer, type Server } from 'node:http';
import { AddressInfo } from 'node:net';

import { afterEach, describe, expect, it } from 'vitest';

const servers: Server[] = [];

async function fixtureServer(
  routes: Readonly<Record<string, { body: string; status?: number }>>,
) {
  const server = createServer((request, response) => {
    const route = routes[request.url ?? ''];
    response.statusCode = route ? (route.status ?? 200) : 404;
    response.setHeader('content-type', 'text/html; charset=utf-8');
    response.end(route?.body ?? 'Not found');
  });
  servers.push(server);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address() as AddressInfo;
  return `http://127.0.0.1:${address.port}`;
}

afterEach(async () => {
  await Promise.all(
    servers.splice(0).map(
      (server) =>
        new Promise<void>((resolve, reject) =>
          server.close((error) => (error ? reject(error) : resolve())),
        ),
    ),
  );
});

describe('internal link crawler', () => {
  it('visits same-origin links once and ignores only approved non-page protocols and valid external links', async () => {
    const baseUrl = await fixtureServer({
      '/en': {
        body: [
          '<a href="/en/guide">Guide</a>',
          '<a href="/en/guide#details">Guide fragment</a>',
          '<a href="#top">Page fragment</a>',
          '<a href="mailto:help@example.test">Mail</a>',
          '<a href="tel:+10000000000">Telephone</a>',
          '<a href="https://outside.example.test/guide">External</a>',
          '<a href="//outside.example.test/guide">Protocol-relative external</a>',
          '<a href="/mailto-local">Protocol lookalike</a>',
        ].join(''),
      },
      '/en/guide': { body: '<a href="/en">Home</a>' },
      '/mailto-local': { body: 'Local page' },
    });

    const { crawlInternalLinks } = await import('../../scripts/check-links.mjs');
    const result = await crawlInternalLinks({ baseUrl, startPath: '/en' });

    expect(result.visited).toEqual([
      `${baseUrl}/en`,
      `${baseUrl}/en/guide`,
      `${baseUrl}/mailto-local`,
    ]);
    expect(result.broken).toEqual([]);
  });

  it('reports javascript and data URL schemes as deterministic unsafe findings', async () => {
    const baseUrl = await fixtureServer({
      '/en': {
        body: [
          '<a href="javascript:void(0)">Script</a>',
          '<a href="data:text/plain,unsafe">Data</a>',
        ].join(''),
      },
    });

    const { crawlInternalLinks } = await import('../../scripts/check-links.mjs');
    const result = await crawlInternalLinks({ baseUrl, startPath: '/en' });

    expect(result.broken).toEqual([
      {
        source: `${baseUrl}/en`,
        href: 'javascript:void(0)',
        target: null,
        status: 'unsupported URL scheme',
        reason: 'Only http, https, mailto, tel, and fragment links are supported; received javascript:',
      },
      {
        source: `${baseUrl}/en`,
        href: 'data:text/plain,unsafe',
        target: null,
        status: 'unsupported URL scheme',
        reason: 'Only http, https, mailto, tel, and fragment links are supported; received data:',
      },
    ]);
  });

  it('reports malformed href syntax with its source and a deterministic reason', async () => {
    const baseUrl = await fixtureServer({
      '/en': { body: '<a href="http://[::1">Malformed target</a>' },
    });

    const { crawlInternalLinks } = await import('../../scripts/check-links.mjs');
    const result = await crawlInternalLinks({ baseUrl, startPath: '/en' });

    expect(result.broken).toEqual([
      {
        source: `${baseUrl}/en`,
        href: 'http://[::1',
        target: null,
        status: 'invalid URL',
        reason: 'URL parser rejected href',
      },
    ]);
  });

  it('reports every parseable unsupported URL scheme instead of ignoring it as external', async () => {
    const baseUrl = await fixtureServer({
      '/en': {
        body: [
          '<a href="ftp://files.example.test/guide">FTP</a>',
          '<a href="webcal://calendar.example.test/event">Webcal</a>',
          '<a href="vbscript:msgbox(1)">VBScript</a>',
          '<a href="sms:+10000000000">SMS</a>',
        ].join(''),
      },
    });

    const { crawlInternalLinks } = await import('../../scripts/check-links.mjs');
    const result = await crawlInternalLinks({ baseUrl, startPath: '/en' });

    expect(result.broken).toEqual([
      {
        source: `${baseUrl}/en`,
        href: 'ftp://files.example.test/guide',
        target: null,
        status: 'unsupported URL scheme',
        reason: 'Only http, https, mailto, tel, and fragment links are supported; received ftp:',
      },
      {
        source: `${baseUrl}/en`,
        href: 'webcal://calendar.example.test/event',
        target: null,
        status: 'unsupported URL scheme',
        reason: 'Only http, https, mailto, tel, and fragment links are supported; received webcal:',
      },
      {
        source: `${baseUrl}/en`,
        href: 'vbscript:msgbox(1)',
        target: null,
        status: 'unsupported URL scheme',
        reason: 'Only http, https, mailto, tel, and fragment links are supported; received vbscript:',
      },
      {
        source: `${baseUrl}/en`,
        href: 'sms:+10000000000',
        target: null,
        status: 'unsupported URL scheme',
        reason: 'Only http, https, mailto, tel, and fragment links are supported; received sms:',
      },
    ]);
  });

  it('reports the source page and original href for every non-200 target', async () => {
    const baseUrl = await fixtureServer({
      '/en': { body: '<a href="/missing?from=home">Missing guide</a>' },
      '/missing?from=home': { body: 'Gone', status: 404 },
    });

    const { crawlInternalLinks } = await import('../../scripts/check-links.mjs');
    const result = await crawlInternalLinks({ baseUrl, startPath: '/en' });

    expect(result.broken).toEqual([
      {
        source: `${baseUrl}/en`,
        href: '/missing?from=home',
        target: `${baseUrl}/missing?from=home`,
        status: 404,
      },
    ]);
  });

  it('runs destructive cleanup once for concurrent and repeated callers', async () => {
    const { createSingleFlightCleanup } = await import(
      '../../scripts/check-links.mjs'
    );
    let calls = 0;
    let releaseCleanup: (() => void) | undefined;
    const cleanup = createSingleFlightCleanup(
      () =>
        new Promise<void>((resolve) => {
          calls += 1;
          releaseCleanup = resolve;
        }),
    );

    const first = cleanup();
    const second = cleanup();
    expect(second).toBe(first);
    expect(calls).toBe(1);

    releaseCleanup?.();
    await Promise.all([first, second]);
    expect(cleanup()).toBe(first);
    expect(calls).toBe(1);
  });

  it('replays cleanup failure without retrying the destructive action', async () => {
    const { createSingleFlightCleanup } = await import(
      '../../scripts/check-links.mjs'
    );
    let calls = 0;
    const cleanup = createSingleFlightCleanup(async () => {
      calls += 1;
      throw new Error('taskkill exited 1');
    });

    await expect(cleanup()).rejects.toThrow('taskkill exited 1');
    await expect(cleanup()).rejects.toThrow('taskkill exited 1');
    expect(calls).toBe(1);
  });

  it('reports a failed taskkill while the owned PID is still running', async () => {
    const { assertOwnedTreeKillResult } = await import(
      '../../scripts/check-links.mjs'
    );

    expect(() =>
      assertOwnedTreeKillResult({
        childExitCode: null,
        exitCode: 1,
        output: 'Access is denied.',
        pid: 4242,
      }),
    ).toThrow(
      'taskkill failed for owned process tree PID 4242 with exit code 1.\nAccess is denied.',
    );
  });
});
