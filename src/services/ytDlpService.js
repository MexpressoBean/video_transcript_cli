const fs = require('fs/promises');
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');
const { normalizeYouTubeUrl } = require('../utils/youtubeUrl');

function runChildProcess(command, args, options = {}) {
  const timeoutMs = Number.isFinite(options.timeoutMs) ? options.timeoutMs : 120000;

  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: options.cwd,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let settled = false;
    let timedOut = false;
    let stdout = '';
    let stderr = '';

    const timeout = setTimeout(() => {
      timedOut = true;
      child.kill('SIGTERM');
      setTimeout(() => child.kill('SIGKILL'), 5000).unref();
    }, timeoutMs);

    function finish(error, result) {
      if (settled) {
        return;
      }

      settled = true;
      clearTimeout(timeout);

      if (error) {
        reject(error);
        return;
      }

      resolve(result);
    }

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    child.on('error', (error) => {
      finish(error);
    });

    child.on('close', (code) => {
      if (timedOut) {
        finish(new Error(`${command} timed out after ${timeoutMs}ms`));
        return;
      }

      if (code === 0) {
        finish(null, { stdout, stderr });
        return;
      }

      finish(new Error(stderr.trim() || `${command} exited with code ${code}`));
    });
  });
}

async function runCommand(command, args, options = {}) {
  await runChildProcess(command, args, options);
}

async function runCommandCapture(command, args, options = {}) {
  const { stdout } = await runChildProcess(command, args, options);
  return stdout;
}

function getRequestedLanguages(lang) {
  return String(lang || '')
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
}

function subtitleScore(filename, requestedLanguages) {
  const lower = filename.toLowerCase();

  if (lower.includes('.live_chat.')) {
    return -Infinity;
  }

  const noExt = lower.replace(/\.vtt$/i, '');
  const parts = noExt.split('.');
  const subtitleTag = parts[parts.length - 1] || '';

  let score = 0;

  for (let index = 0; index < requestedLanguages.length; index += 1) {
    const requested = requestedLanguages[index];
    const rankBonus = (requestedLanguages.length - index) * 10;

    if (subtitleTag === requested) {
      score = Math.max(score, 120 + rankBonus);
    } else if (subtitleTag.startsWith(`${requested}-`)) {
      score = Math.max(score, 100 + rankBonus);
    } else if (lower.includes(`.${requested}.`)) {
      score = Math.max(score, 90 + rankBonus);
    }
  }

  if (subtitleTag.includes('orig') || lower.includes('.auto.')) {
    score -= 10;
  }

  return score;
}

function selectBestVttFile(vttFiles, lang) {
  const requestedLanguages = getRequestedLanguages(lang);
  const candidates = vttFiles
    .map((filename) => ({
      filename,
      score: subtitleScore(filename, requestedLanguages),
    }))
    .filter((entry) => entry.score !== -Infinity);

  if (candidates.length === 0) {
    return null;
  }

  candidates.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }

    return a.filename.localeCompare(b.filename);
  });

  return candidates[0].filename;
}


async function cleanupTempDir(tempDir) {
  if (!tempDir) {
    return;
  }

  await fs.rm(tempDir, { recursive: true, force: true });
}

async function fetchVideoTitle({ url }) {
  try {
    const output = await runCommandCapture(
      'yt-dlp',
      ['--no-playlist', '--print', '%(title)s', url],
      { timeoutMs: 30000 }
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
  try {
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
      await runCommand('yt-dlp', args, { cwd: tempDir, timeoutMs: 180000 });
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

    const selected = selectBestVttFile(vttFiles, lang);
    if (!selected) {
      throw new Error('No suitable .vtt subtitle file found for the requested language.');
    }
    const vttPath = path.join(tempDir, selected);
    const vttContent = await fs.readFile(vttPath, 'utf8');

    let videoTitle = null;
    try {
      videoTitle = await fetchVideoTitle({ url: normalizedUrl });
    } catch (_error) {
      // Title lookup is a non-critical enhancement; transcript generation can continue.
      videoTitle = null;
    }

    return {
      normalizedUrl,
      tempDir,
      vttPath,
      vttFilename: selected,
      vttContent,
      videoTitle,
    };
  } catch (error) {
    await cleanupTempDir(tempDir);
    throw error;
  }
}

module.exports = {
  fetchVttFile,
};
