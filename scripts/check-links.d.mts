export type BrokenInternalLink = {
  readonly source: string;
  readonly href: string;
  readonly target: string | null;
  readonly status: number | string;
  readonly reason?: string;
};

export type InternalLinkCrawlResult = {
  readonly startUrl: string;
  readonly visited: string[];
  readonly broken: BrokenInternalLink[];
};

export function crawlInternalLinks(options: {
  readonly baseUrl: string;
  readonly startPath?: string;
  readonly fetchImpl?: typeof fetch;
}): Promise<InternalLinkCrawlResult>;

export function createSingleFlightCleanup(
  cleanupAction: () => void | Promise<void>,
): () => Promise<void>;

export function assertOwnedTreeKillResult(options: {
  readonly childExitCode: number | null;
  readonly exitCode: number | null;
  readonly output: string;
  readonly pid: number;
}): void;
