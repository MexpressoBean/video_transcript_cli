function decodeEntities(text) {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

function stripVttTags(text) {
  return text
    .replace(/<\/?c[^>]*>/g, '')
    .replace(/<\/?i>/g, '')
    .replace(/<\/?b>/g, '')
    .replace(/<\/?u>/g, '')
    .replace(/<[^>]+>/g, '')
    .trim();
}

function isTimestampLine(line) {
  return /^(?:\d{2}:)?\d{2}:\d{2}\.\d{3}\s+-->\s+(?:\d{2}:)?\d{2}:\d{2}\.\d{3}/.test(line);
}

function isSequenceNumber(line) {
  return /^\d+$/.test(line.trim());
}

function cleanVttToText(vttContent) {
  const lines = vttContent.split(/\r?\n/);
  const output = [];
  let prev = '';

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      continue;
    }

    if (line === 'WEBVTT') {
      continue;
    }

    if (line.startsWith('NOTE')) {
      continue;
    }

    if (isTimestampLine(line) || isSequenceNumber(line)) {
      continue;
    }

    const cleaned = decodeEntities(stripVttTags(line)).replace(/\s+/g, ' ').trim();

    if (!cleaned || cleaned === prev) {
      continue;
    }

    output.push(cleaned);
    prev = cleaned;
  }

  return output.join('\n').trim();
}

module.exports = {
  cleanVttToText,
};
