# video-transcript-cli

Minimal local CLI to fetch a YouTube transcript and save it as a cleaned `.txt` file.

## Requirements

- Node.js 18+
- `yt-dlp` installed and available in your `PATH`

## Install

```bash
npm install
npm link
```

`npm link` makes the `ytx` command available globally on your machine.

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

Example:

```bash
ytx "https://www.youtube.com/watch?v=VIDEO_ID" -o ./my-transcript.txt
```

Default output goes to `~/Documents/ytx_video_transcripts/<video-title>.txt`.
If `ytx_video_transcripts` does not exist, it is created automatically.

The CLI supports standard YouTube links and short links, including playlist/extra params:

```bash
ytx "https://www.youtube.com/watch?v=xBdK2NqEfsE&list=WL&index=4"
ytx "https://youtu.be/xBdK2NqEfsE?si=GOCqZ024WVKkQZIc"
```

By default, the output file uses the YouTube video title (sanitized for filenames).
