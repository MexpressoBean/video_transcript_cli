const path = require('path');
const { Command } = require('commander');
const pc = require('picocolors');
const { generateTranscript } = require('../services/transcriptService');

async function runCli() {
  const program = new Command();

  program
    .name('ytx')
    .description('Fetch and clean a YouTube transcript into a .txt file')
    .argument('<url>', 'YouTube video URL')
    .option('-o, --output <file>', 'Output .txt file path')
    .option('-d, --output-dir <dir>', 'Output directory for transcript files')
    .option('-n, --name <name>', 'Custom output filename (without .txt)')
    .option('-l, --lang <lang>', 'Subtitle language (default: en)', 'en')
    .option('--keep-vtt', 'Keep temporary VTT file')
    .action(async (url, options) => {
      try {
        console.log(pc.cyan('Fetching transcript...'));

        const result = await generateTranscript({
          url,
          lang: options.lang,
          outputPath: options.output,
          outputDir: options.outputDir,
          customName: options.name,
          keepVtt: Boolean(options.keepVtt),
        });

        console.log(pc.green('Transcript created successfully.'));
        console.log(pc.dim(`Text file: ${path.resolve(result.outputPath)}`));

        if (result.vttPath) {
          console.log(pc.dim(`VTT file kept at: ${path.resolve(result.vttPath)}`));
        }
      } catch (error) {
        console.error(pc.red(`Error: ${error.message}`));
        process.exitCode = 1;
      }
    });

  await program.parseAsync(process.argv);
}

module.exports = {
  runCli,
};
