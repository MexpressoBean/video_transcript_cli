const { normalizeYouTubeUrl } = require('../src/utils/youtubeUrl');

describe('normalizeYouTubeUrl', () => {
  it('normalizes watch links with extra params', () => {
    const input = 'https://www.youtube.com/watch?v=xBdK2NqEfsE&list=WL&index=4';
    expect(normalizeYouTubeUrl(input)).toBe('https://www.youtube.com/watch?v=xBdK2NqEfsE');
  });

  it('normalizes youtu.be links', () => {
    const input = 'https://youtu.be/xBdK2NqEfsE?si=GOCqZ024WVKkQZIc';
    expect(normalizeYouTubeUrl(input)).toBe('https://www.youtube.com/watch?v=xBdK2NqEfsE');
  });

  it('normalizes escaped youtu.be links', () => {
    const input = 'https://youtu.be/xBdK2NqEfsE\\?si\\=GOCqZ024WVKkQZIc';
    expect(normalizeYouTubeUrl(input)).toBe('https://www.youtube.com/watch?v=xBdK2NqEfsE');
  });

  it('normalizes shorts links', () => {
    const input = 'https://www.youtube.com/shorts/xBdK2NqEfsE?feature=share';
    expect(normalizeYouTubeUrl(input)).toBe('https://www.youtube.com/watch?v=xBdK2NqEfsE');
  });

  it('rejects invalid URLs', () => {
    expect(() => normalizeYouTubeUrl('not-a-url')).toThrow('Invalid URL');
  });

  it('rejects unsupported hosts', () => {
    expect(() => normalizeYouTubeUrl('https://example.com/watch?v=abc')).toThrow('Unsupported URL host');
  });

  it('keeps valid youtube URL when video id cannot be extracted', () => {
    const input = 'https://www.youtube.com/channel/UC123';
    expect(normalizeYouTubeUrl(input)).toBe('https://www.youtube.com/channel/UC123');
  });
});
