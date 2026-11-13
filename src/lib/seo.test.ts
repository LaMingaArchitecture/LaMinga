import { describe, expect, test } from 'vitest';
import { absoluteImageUrl, serializeJsonLd } from './seo';

const SITE = 'https://laminga.example';

describe('serializeJsonLd', () => {
  test('editor text cannot close the script tag or open markup', () => {
    const data = { name: '</script><script>alert(1)</script> & co' };
    const json = serializeJsonLd(data);
    expect(json).not.toMatch(/[<>&]/);
    expect(JSON.parse(json)).toEqual(data);
  });
});

describe('absoluteImageUrl', () => {
  test('rejects a non-http(s) absolute URL', () => {
    expect(absoluteImageUrl('javascript:alert(1)', SITE)).toBeUndefined();
    expect(absoluteImageUrl('data:image/png;base64,AAAA', SITE)).toBeUndefined();
  });

  test('routes Storyblok assets through the image service and resolves site paths', () => {
    expect(absoluteImageUrl('https://a.storyblok.com/f/1/a.jpg', SITE)).toBe(
      'https://a.storyblok.com/f/1/a.jpg/m/1200x630/filters:format(webp):quality(80)',
    );
    expect(absoluteImageUrl('/og-default.png', SITE)).toBe(`${SITE}/og-default.png`);
  });
});
