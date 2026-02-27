# video-transcript-cli

Minimal local CLI to fetch a YouTube transcript and save it as a cleaned `.txt` file.

## Platform

- Tested on **macOS only**.

## Requirements

- Node.js 18+
- `yt-dlp` installed and available in your `PATH`

## Quick Start (macOS)

1. Install dependencies:

```bash
# Homebrew (if needed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Node.js (includes npm)
brew install node

# yt-dlp
brew install yt-dlp
```

2. Verify dependencies:

```bash
node -v
npm -v
yt-dlp --version
```

3. Install project packages and run:

```bash
npm install
node bin/ytx.js "https://www.youtube.com/watch?v=VIDEO_ID"
```

4. Optional: make the command globally available:

```bash
npm link
ytx "https://www.youtube.com/watch?v=VIDEO_ID"
```

## Install

```bash
npm install
npm link
```

`npm link` makes the `ytx` command available globally on your machine.

If you do not want to use `npm link`, run it directly:

```bash
node bin/ytx.js "https://www.youtube.com/watch?v=VIDEO_ID"
```

## Usage

```bash
ytx "https://www.youtube.com/watch?v=VIDEO_ID"
```

Options:

- `-o, --output <file>`: output path for the transcript file
- `-d, --output-dir <dir>`: output directory for transcript files
- `-n, --name <name>`: custom output filename (without `.txt`)
- `-l, --lang <lang>`: subtitle language (default `en`)
- `--keep-vtt`: keep the downloaded `.vtt` file in temp storage

Examples:

```bash
# full output path override
ytx "https://www.youtube.com/watch?v=VIDEO_ID" -o ./my-transcript.txt

# custom output directory
ytx "https://www.youtube.com/watch?v=VIDEO_ID" -d ~/Desktop/transcripts

# custom output file name (still writes into output directory/default directory)
ytx "https://www.youtube.com/watch?v=VIDEO_ID" -n "team-sync-notes"
```

Default output goes to `~/Documents/ytx_video_transcripts/<video-title>.txt`.
If `ytx_video_transcripts` does not exist, it is created automatically.

The CLI supports standard YouTube links and short links, including playlist/extra params:

```bash
ytx "https://www.youtube.com/watch?v=xBdK2NqEfsE&list=WL&index=4"
ytx "https://youtu.be/xBdK2NqEfsE?si=GOCqZ024WVKkQZIc"
```

By default, the output file uses the YouTube video title (sanitized for filenames).

## Development

```bash
npm run lint
npm test
```
