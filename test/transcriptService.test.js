const path = require('path');
const os = require('os');

const {
  DEFAULT_OUTPUT_DIR,
  deriveBaseName,
  resolveOutputPath,
} = require('../src/services/transcriptService');

describe('transcriptService helpers', () => {
  it('derives base name by removing vtt and language suffix', () => {
    expect(deriveBaseName('abc123.en.vtt')).toBe('abc123');
    expect(deriveBaseName('abc123.vtt')).toBe('abc123');
  });

  it('respects explicit output path', () => {
    const out = resolveOutputPath({
      outputPath: './custom/output.txt',
      outputDir: undefined,
      customName: undefined,
      videoTitle: 'Video Title',
      vttFilename: 'abc123.en.vtt',
    });

    expect(out).toBe(path.resolve('./custom/output.txt'));
  });

  it('uses custom name when output path is not provided', () => {
    const out = resolveOutputPath({
      outputPath: undefined,
      outputDir: '/tmp/ytx-tests',
      customName: 'My Custom Name',
      videoTitle: 'Video Title',
      vttFilename: 'abc123.en.vtt',
    });

    expect(out).toBe(path.join(path.resolve('/tmp/ytx-tests'), 'My Custom Name.txt'));
  });

  it('uses video title when custom name is missing', () => {
    const out = resolveOutputPath({
      outputPath: undefined,
      outputDir: '/tmp/ytx-tests',
      customName: undefined,
      videoTitle: 'A Great Video',
      vttFilename: 'abc123.en.vtt',
    });

    expect(out).toBe(path.join(path.resolve('/tmp/ytx-tests'), 'A Great Video.txt'));
  });

  it('falls back to vtt-derived base name if title is unavailable', () => {
    const out = resolveOutputPath({
      outputPath: undefined,
      outputDir: '/tmp/ytx-tests',
      customName: undefined,
      videoTitle: null,
      vttFilename: 'abc123.en.vtt',
    });

    expect(out).toBe(path.join(path.resolve('/tmp/ytx-tests'), 'abc123.txt'));
  });

  it('uses Documents default output directory when no outputDir is provided', () => {
    expect(DEFAULT_OUTPUT_DIR).toBe(path.join(os.homedir(), 'Documents', 'ytx_video_transcripts'));

    const out = resolveOutputPath({
      outputPath: undefined,
      outputDir: undefined,
      customName: undefined,
      videoTitle: 'Video Title',
      vttFilename: 'abc123.en.vtt',
    });

    expect(out).toBe(path.join(DEFAULT_OUTPUT_DIR, 'Video Title.txt'));
  });
});
