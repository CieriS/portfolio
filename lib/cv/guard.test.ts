import { describe, expect, it } from 'vitest';
import { guardCvPost } from './guard';

const SITE = 'https://cieri.vercel.app';
const own = (origin: string | null, contentType: string | null = 'application/json', url = `${SITE}/api/cv`) =>
  guardCvPost({ contentType, origin, requestUrl: url, siteUrl: SITE });

describe('guardCvPost (#113)', () => {
  it('lets a JSON request from the site through', () => {
    expect(own(SITE)).toBe('ok');
    expect(own(SITE, 'application/json; charset=utf-8')).toBe('ok');
    expect(own(SITE, 'Application/JSON')).toBe('ok');
  });

  it('accepts the origin the request was sent to, so previews and localhost keep working', () => {
    const preview = 'https://portfolio-abc123-cieri.vercel.app';
    expect(own(preview, 'application/json', `${preview}/api/cv`)).toBe('ok');
    expect(own('http://localhost:3210', 'application/json', 'http://localhost:3210/api/cv')).toBe('ok');
  });

  it('accepts a request without Origin: only a browser sends one, and only a browser can be tricked', () => {
    expect(own(null)).toBe('ok');
  });

  it('refuses anything but JSON with 415, before looking at the origin', () => {
    expect(own(SITE, 'text/plain')).toBe(415);
    expect(own(SITE, 'text/plain;charset=UTF-8')).toBe(415);
    expect(own(SITE, 'application/x-www-form-urlencoded')).toBe(415);
    expect(own(SITE, 'multipart/form-data; boundary=x')).toBe(415);
    expect(own(SITE, 'application/jsonp')).toBe(415);
    expect(own(SITE, null)).toBe(415);
    expect(own('https://evil.example', 'text/plain')).toBe(415);
  });

  it('refuses a foreign origin with 403', () => {
    expect(own('https://evil.example')).toBe(403);
    expect(own('https://cieri.vercel.app.evil.example')).toBe(403);
    expect(own('http://cieri.vercel.app')).toBe(403);
    expect(own('null')).toBe(403);
    expect(own('not a url')).toBe(403);
  });
});
