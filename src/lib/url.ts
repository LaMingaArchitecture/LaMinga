/**
 * True when a URL uses a safe http(s) scheme. Rejects editor-supplied `javascript:`,
 * `data:`, etc. before they reach an `href` — per rules/security.md (URL fields must be
 * restricted to http/https). Narrows the type so callers can render the anchor safely.
 */
export function isHttpUrl(url: string | undefined | null): url is string {
  return typeof url === 'string' && /^https?:\/\//i.test(url.trim());
}

/** Build a `tel:` href from a display phone number (strips whitespace); undefined when empty. */
export function telHref(telephone?: string | null): string | undefined {
  const digits = telephone?.replace(/\s+/g, '');
  return digits ? `tel:${digits}` : undefined;
}

/**
 * Collapse all whitespace runs (newlines, tabs, repeated spaces) to a single space and trim.
 * Returns undefined when the result is empty. Used to flatten multiline textarea fields (addresses)
 * onto one line for JSON-LD / llms.txt so a stray line break can't break structured output.
 */
export function collapseWhitespace(value?: string | null): string | undefined {
  return value?.replace(/\s+/g, ' ').trim() || undefined;
}

// http(s) / mailto / tel / same-origin (relative or #anchor) are the schemes allowed in richtext.
// A single leading `/` is a same-origin path; `//host` or `/\host` are protocol-relative
// (external) and must be rejected — hence the negative lookahead.
const SAFE_HREF = /^(?:https?:|mailto:|tel:|\/(?![/\\])|#)/i;

/**
 * Defense-in-depth for editor-authored richtext links: neutralize any `href` whose scheme
 * isn't http(s)/mailto/tel/same-origin (e.g. `javascript:`, `data:`, `vbscript:`) to `#`.
 * Whitespace is stripped before the scheme test so `java\tscript:` can't slip through.
 * Applied wherever richtext renders (see RichText.astro).
 */
export function sanitizeRichTextHtml(html: unknown): string {
  const source = typeof html === 'string' ? html : '';
  return source.replace(/(<a\b[^>]*?\shref=")([^"]*)(")/gi, (match, pre, url, post) => {
    const scheme = url.replace(/&amp;/g, '&').replace(/\s+/g, '');
    return SAFE_HREF.test(scheme) ? match : `${pre}#${post}`;
  });
}
