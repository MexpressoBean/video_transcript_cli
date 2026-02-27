const {
  runChildProcess,
  runCommand,
  runCommandCapture,
} = require('../src/services/ytDlpService');

describe('ytDlpService process helpers', () => {
  it('runChildProcess returns stdout/stderr on success', async () => {
    const result = await runChildProcess('node', ['-e', "process.stdout.write('ok'); process.stderr.write('warn');"]);
    expect(result).toEqual({ stdout: 'ok', stderr: 'warn' });
  });

  it('runCommandCapture returns stdout only', async () => {
    const result = await runCommandCapture('node', ['-e', "process.stdout.write('hello');"]);
    expect(result).toBe('hello');
  });

  it('runCommand resolves for zero exit code', async () => {
    await expect(runCommand('node', ['-e', 'process.exit(0);'])).resolves.toBeUndefined();
  });

  it('runChildProcess rejects with stderr message on non-zero exit', async () => {
    await expect(
      runChildProcess('node', ['-e', "process.stderr.write('bad'); process.exit(2);"])
    ).rejects.toThrow('bad');
  });

  it('runChildProcess times out and rejects', async () => {
    await expect(
      runChildProcess('node', ['-e', 'setTimeout(() => {}, 1000);'], { timeoutMs: 20 })
    ).rejects.toThrow('timed out');
  });
});
