const fs = require('fs/promises');
const os = require('os');
const path = require('path');
const { fetchVttFile } = require('./ytDlpService');
const { cleanVttToText } = require('../utils/vttParser');
const { sanitizeFilename } = require('../utils/filename');

const DEFAULT_OUTPUT_DIR = path.join(os.homedir(), 'Documents', 'ytx_video_transcripts');

function deriveBaseName(vttFilename) {
  return vttFilename.replace(/\.vtt$/i, '').replace(/\.[a-zA-Z-]+$/, '');
}

function resolveOutputPath({ outputPath, outputDir, customName, videoTitle, vttFilename }) {
  if (outputPath) {
    return path.resolve(outputPath);
  }

  const normalizedCustomName = sanitizeFilename(customName).replace(/\.txt$/i, '');
  const base =
    normalizedCustomName ||
    sanitizeFilename(videoTitle) ||
    sanitizeFilename(deriveBaseName(vttFilename)) ||
    'transcript';

  const baseDir = outputDir
    ? path.resolve(outputDir)
    : DEFAULT_OUTPUT_DIR;

  return path.join(baseDir, `${base}.txt`);
}

async function generateTranscript({ url, lang, outputPath, outputDir, customName, keepVtt }) {
  const { tempDir, vttPath, vttFilename, vttContent, videoTitle } = await fetchVttFile({ url, lang });

  try {
    const text = cleanVttToText(vttContent);

    if (!text) {
      throw new Error('Transcript parsing returned empty text.');
    }

    const finalOutputPath = resolveOutputPath({
      outputPath,
      outputDir,
      customName,
      videoTitle,
      vttFilename,
    });

    await fs.mkdir(path.dirname(finalOutputPath), { recursive: true });
    await fs.writeFile(finalOutputPath, `${text}\n`, 'utf8');

    return {
      outputPath: finalOutputPath,
      vttPath: keepVtt ? vttPath : null,
    };
  } finally {
    if (!keepVtt) {
      await fs.rm(tempDir, { recursive: true, force: true });
    }
  }
}

module.exports = {
  DEFAULT_OUTPUT_DIR,
  deriveBaseName,
  resolveOutputPath,
  generateTranscript,
};
