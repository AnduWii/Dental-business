// Resilience helpers for outbound calls (AI, SMS, email): a timeout-bounded
// fetch and exponential-backoff retry. The deterministic AI fallback acts as
// the circuit breaker, if retries are exhausted we degrade, never hang.

export async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs = 12_000,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

interface RetryOptions {
  retries?: number;
  baseMs?: number;
  factor?: number;
  onRetry?: (attempt: number, err: unknown) => void;
}

export async function withRetry<T>(fn: () => Promise<T>, opts: RetryOptions = {}): Promise<T> {
  const { retries = 2, baseMs = 250, factor = 3, onRetry } = opts;
  let lastErr: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (attempt === retries) break;
      onRetry?.(attempt + 1, err);
      const delay = baseMs * Math.pow(factor, attempt) + Math.random() * 100;
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw lastErr;
}
