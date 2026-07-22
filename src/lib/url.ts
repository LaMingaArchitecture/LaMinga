/**
 * True when a URL uses a safe http(s) scheme. Rejects editor-supplied `javascript:`,
 * `data:`, etc. before they reach an `href` — per rules/security.md (URL fields must be
 * restricted to http/https). Narrows the type so callers can render the anchor safely.
 */
export function isHttpUrl(url: string | undefined | null): url is string {
  return typeof url === 'string' && /^https?:\/\//i.test(url.trim());
}
