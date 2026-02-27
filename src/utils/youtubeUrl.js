function unescapeShellEscapes(rawUrl) {
  return String(rawUrl).trim().replace(/\\([?=&])/g, '$1');
}

function isYouTubeHost(hostname) {
  return (
    hostname === 'youtube.com' ||
    hostname === 'www.youtube.com' ||
    hostname === 'm.youtube.com' ||
    hostname === 'youtu.be'
  );
}

function normalizeYouTubeUrl(rawUrl) {
  const unescaped = unescapeShellEscapes(rawUrl);

  let parsed;
  try {
    parsed = new URL(unescaped);
  } catch (error) {
    throw new Error('Invalid URL. Please provide a valid YouTube link.', { cause: error });
  }

  const hostname = parsed.hostname.toLowerCase();
  if (!isYouTubeHost(hostname)) {
    throw new Error('Unsupported URL host. Please provide a youtube.com or youtu.be link.');
  }

  let videoId = '';

  if (hostname === 'youtu.be') {
    videoId = parsed.pathname.replace(/^\/+/, '').split('/')[0];
  } else if (parsed.pathname === '/watch') {
    videoId = parsed.searchParams.get('v') || '';
  } else if (parsed.pathname.startsWith('/shorts/')) {
    videoId = parsed.pathname.split('/')[2] || '';
  }

  if (videoId) {
    return `https://www.youtube.com/watch?v=${videoId}`;
  }

  return parsed.toString();
}

module.exports = {
  normalizeYouTubeUrl,
};
