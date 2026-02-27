
const {
  getRequestedLanguages,
  subtitleScore,
  selectBestVttFile,
} = require('../src/services/ytDlpService');

describe('ytDlpService helper functions', () => {
  describe('getRequestedLanguages', () => {
    it('parses and normalizes comma-separated language list', () => {
      expect(getRequestedLanguages('en, es ,pt-BR')).toEqual(['en', 'es', 'pt-br']);
    });

    it('returns empty list for empty input', () => {
      expect(getRequestedLanguages('')).toEqual([]);
      expect(getRequestedLanguages(null)).toEqual([]);
    });
  });

  describe('subtitleScore', () => {
    it('returns -Infinity for live chat files', () => {
      expect(subtitleScore('abc.en.live_chat.vtt', ['en'])).toBe(-Infinity);
    });

    it('prefers exact language tag match over fallback match', () => {
      const exact = subtitleScore('abc.en.vtt', ['en']);
      const fallback = subtitleScore('abc.en-us.vtt', ['en']);
      expect(exact).toBeGreaterThan(fallback);
    });

    it('penalizes likely auto/orig variants', () => {
      const manual = subtitleScore('abc.en.vtt', ['en']);
      const auto = subtitleScore('abc.en-orig.vtt', ['en']);
      expect(manual).toBeGreaterThan(auto);
    });
  });

  describe('selectBestVttFile', () => {
    it('chooses best matching file for requested language', () => {
      const files = ['abc.es.vtt', 'abc.en.vtt', 'abc.en-orig.vtt'];
      expect(selectBestVttFile(files, 'en')).toBe('abc.en.vtt');
    });

    it('supports prioritized multi-language requests', () => {
      const files = ['abc.es.vtt', 'abc.en.vtt'];
      expect(selectBestVttFile(files, 'es,en')).toBe('abc.es.vtt');
    });

    it('filters out live chat tracks', () => {
      const files = ['abc.en.live_chat.vtt'];
      expect(selectBestVttFile(files, 'en')).toBeNull();
    });

    it('falls back deterministically by filename when scores tie', () => {
      const files = ['b.vtt', 'a.vtt'];
      expect(selectBestVttFile(files, 'en')).toBe('a.vtt');
    });
  });
});
