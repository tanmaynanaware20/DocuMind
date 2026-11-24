import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function runProcess(name, cmd, args, cwd, color) {
  const proc = spawn(cmd, args, {
    cwd: path.resolve(__dirname, cwd),
    shell: true,
    stdio: ['inherit', 'pipe', 'pipe']
  });

  proc.stdout.on('data', (data) => {
    process.stdout.write(`\x1b[${color}m[${name}]\x1b[0m ${data.toString()}`);
  });

  proc.stderr.on('data', (data) => {
    process.stderr.write(`\x1b[${color}m[${name}]\x1b[0m \x1b[31m${data.toString()}\x1b[0m`);
  });

  proc.on('close', (code) => {
    console.log(`[${name}] process exited with code ${code}`);
  });

  return proc;
}

console.log('\x1b[36m%s\x1b[0m', '>>> Starting DocuMind Development Environment...');
const server = runProcess('SERVER', 'npm', ['run', 'dev'], 'server', '32'); // green
const client = runProcess('CLIENT', 'npm', ['run', 'dev'], 'client', '34'); // blue

process.on('SIGINT', () => {
  server.kill('SIGINT');
  client.kill('SIGINT');
  process.exit();
});
