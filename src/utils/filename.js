function sanitizeFilename(input) {
  if (input === null || input === undefined) {
    return '';
  }

  return String(input)
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\.$/, '');
}

module.exports = {
  sanitizeFilename,
};
