const { sanitizeFilename } = require('../src/utils/filename');

describe('sanitizeFilename', () => {
  it('returns empty string for nullish inputs', () => {
    expect(sanitizeFilename(undefined)).toBe('');
    expect(sanitizeFilename(null)).toBe('');
  });

  it('strips invalid filename characters', () => {
    expect(sanitizeFilename('a<b>:"c/d\\e|f?g*h')).toBe('a b c d e f g h');
  });

  it('normalizes whitespace and trims', () => {
    expect(sanitizeFilename('  hello    world  ')).toBe('hello world');
  });

  it('removes trailing dot', () => {
    expect(sanitizeFilename('report.')).toBe('report');
  });
});
