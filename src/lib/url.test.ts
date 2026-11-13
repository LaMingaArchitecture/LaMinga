import { describe, expect, test } from 'vitest';
import { sanitizeRichTextHtml } from './url';

const link = (href: string): string => `<p><a href="${href}" target="_blank">x</a></p>`;

describe('sanitizeRichTextHtml', () => {
  test.each([
    'javascript:alert(1)',
    'JaVa\tscript:alert(1)',
    'data:text/html,x',
    'x&quot; onmouseover=&quot;alert(1)',
    '//evil.example',
    '/\\evil.example',
  ])('neutralizes %s', (href) => {
    expect(sanitizeRichTextHtml(link(href))).toBe(link('#'));
  });

  test.each([
    'https://ok.fr/?a=1&amp;b=2',
    'mailto:a@b.fr',
    'tel:+33100000000',
    '/projets/x',
    '#haut',
  ])('keeps %s', (href) => {
    expect(sanitizeRichTextHtml(link(href))).toBe(link(href));
  });

  test('returns an empty string for non-string input', () => {
    expect(sanitizeRichTextHtml(undefined)).toBe('');
  });
});
