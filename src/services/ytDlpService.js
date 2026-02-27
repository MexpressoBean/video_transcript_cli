const fs = require('fs/promises');
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');
const { normalizeYouTubeUrl } = require('../utils/youtubeUrl');

function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: options.cwd,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let stderr = '';

    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    child.on('error', (error) => {
      reject(error);
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(stderr.trim() || `${command} exited with code ${code}`));
    });
  });
}

function runCommandCapture(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: options.cwd,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    child.on('error', (error) => {
      reject(error);
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve(stdout);
        return;
      }

      reject(new Error(stderr.trim() || `${command} exited with code ${code}`));
    });
  });
}

async function fetchVideoTitle({ url }) {
  try {
    const output = await runCommandCapture(
      'yt-dlp',
      ['--no-playlist', '--print', '%(title)s', url],
      {}
    );

    const title = output
      .split(/\r?\n/)
      .map((line) => line.trim())
      .find(Boolean);

    return title || null;
  } catch (error) {
    if (error && error.code === 'ENOENT') {
      throw new Error('`yt-dlp` is not installed or not in PATH.');
    }

    throw new Error(`Failed to fetch video title with yt-dlp: ${error.message}`);
  }
}

async function fetchVttFile({ url, lang }) {
  const normalizedUrl = normalizeYouTubeUrl(url);
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'ytx-'));

  const args = [
    '--skip-download',
    '--write-subs',
    '--write-auto-subs',
    '--sub-langs',
    lang,
    '--sub-format',
    'vtt',
    '--no-playlist',
    '--output',
    '%(id)s.%(ext)s',
    normalizedUrl,
  ];

  try {
    await runCommand('yt-dlp', args, { cwd: tempDir });
  } catch (error) {
    if (error && error.code === 'ENOENT') {
      throw new Error('`yt-dlp` is not installed or not in PATH.');
    }

    throw new Error(`Failed to fetch subtitles with yt-dlp: ${error.message}`);
  }

  const files = await fs.readdir(tempDir);
  const vttFiles = files.filter((file) => file.endsWith('.vtt'));

  if (vttFiles.length === 0) {
    throw new Error('No .vtt subtitle file found. The video may not have subtitles in that language.');
  }

  vttFiles.sort();
  const selected = vttFiles[0];
  const vttPath = path.join(tempDir, selected);
  const vttContent = await fs.readFile(vttPath, 'utf8');
  const videoTitle = await fetchVideoTitle({ url: normalizedUrl });

  return {
    normalizedUrl,
    tempDir,
    vttPath,
    vttFilename: selected,
    vttContent,
    videoTitle,
  };
}

module.exports = {
  fetchVttFile,
};
