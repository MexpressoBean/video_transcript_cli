const { cleanVttToText } = require('../src/utils/vttParser');

describe('cleanVttToText', () => {
  it('removes headers, timestamps, tags, entities, and duplicate adjacent lines', () => {
    const input = [
      'WEBVTT',
      '',
      '1',
      '00:00:00.000 --> 00:00:01.000',
      '<c.colorE5E5E5>Hello &amp; welcome</c>',
      '',
      '2',
      '00:00:01.000 --> 00:00:02.000',
      '<i>Hello &amp; welcome</i>',
      '',
      '3',
      '00:00:02.000 --> 00:00:03.000',
      'World',
      '',
      'NOTE this is ignored',
      'ignored note line',
    ].join('\n');

    expect(cleanVttToText(input)).toBe(['Hello & welcome', 'World', 'ignored note line'].join('\n'));
  });

  it('returns empty string when no content lines are present', () => {
    const input = ['WEBVTT', '', '1', '00:00:00.000 --> 00:00:01.000'].join('\n');
    expect(cleanVttToText(input)).toBe('');
  });

  it('collapses whitespace in content lines', () => {
    const input = [
      'WEBVTT',
      '',
      '00:00:00.000 --> 00:00:01.000',
      'hello      there',
    ].join('\n');

    expect(cleanVttToText(input)).toBe('hello there');
  });
});
