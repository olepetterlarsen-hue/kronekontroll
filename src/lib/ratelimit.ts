/**
 * Enkel rate limiter per prosess-instans (fixed window).
 * Godt nok som første forsvarslinje på auth-, opplastings- og AI-endepunkter.
 * Merk: på Vercel kjører flere instanser, så grensen er per instans, ikke global.
 * Bytt til Upstash Redis e.l. hvis det trengs en global grense senere.
 */
const buckets = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(
  key: string,
  opts: { limit: number; windowMs: number },
): { ok: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + opts.windowMs });
    return { ok: true, retryAfterSeconds: 0 };
  }

  bucket.count += 1;
  if (bucket.count > opts.limit) {
    return { ok: false, retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000) };
  }
  return { ok: true, retryAfterSeconds: 0 };
}

export function tooManyRequests(retryAfterSeconds: number): Response {
  return Response.json(
    { error: "For mange forespørsler. Prøv igjen om litt." },
    { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } },
  );
}
