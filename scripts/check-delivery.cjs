/** Checagem local da entrega; execução Android, autenticidade e legibilidade exigem revisão humana. */
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const root = path.join(__dirname, '..');
let errors = 0;
const check = (ok, desc) => { console.log(`${ok ? 'PASS' : 'FAIL'}: ${desc}`); if (!ok) errors++; };
for (const name of ['App.js', 'app.json', 'package.json', 'package-lock.json', 'README.md', '.gitignore',
  'src/context/TasksContext.js', 'src/utils/taskStore.cjs', 'src/screens/HomeScreen.js',
  'src/screens/TaskFormScreen.js', 'src/screens/TaskDetailScreen.js', 'src/screens/StatsScreen.js']) {
  check(fs.existsSync(path.join(root, name)), name);
}
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
check(/^~?57\./.test(pkg.dependencies.expo), 'SDK 57 preservado');
const git = spawnSync('git', ['ls-files', '-z'], { cwd: root, encoding: 'utf8' });
check(git.status === 0, 'Git acessível');
if (git.status === 0) check(!git.stdout.split('\0').some((file) => /^node_modules\//.test(file)), 'node_modules fora do Git');
const video = path.join(root, 'demo/demo.mp4');
if (!fs.existsSync(video)) {
  check(false, 'demo/demo.mp4 ausente: é necessária uma gravação real do aplicativo.');
} else {
  const size = fs.statSync(video).size;
  check(size > 2048 && size <= 25 * 1024 * 1024, 'vídeo não vazio e até 25 MB');
  const probe = spawnSync('ffprobe', ['-v', 'error', '-show_format', '-show_streams', '-of', 'json', video], { encoding: 'utf8' });
  check(probe.status === 0, 'ffprobe consegue abrir o MP4 (instale FFmpeg se necessário)');
  if (probe.status === 0) {
    try {
      const info = JSON.parse(probe.stdout);
      const stream = info.streams.find((item) => item.codec_type === 'video');
      const duration = Number(info.format?.duration);
      check(info.format?.format_name?.split(',').includes('mp4'), 'contêiner MP4');
      check(Number.isFinite(duration) && duration > 0 && duration <= 30, `duração: ${duration} segundos (máximo 30)`);
      check(Boolean(stream?.width && stream?.height), `vídeo com imagem: ${stream?.width}x${stream?.height}`);
      const decode = spawnSync('ffmpeg', ['-v', 'error', '-i', video, '-f', 'null', '-'], { encoding: 'utf8', timeout: 60000 });
      check(decode.status === 0 && !decode.stderr.trim(), 'vídeo decodificado integralmente sem erro');
    } catch { check(false, 'metadados válidos do vídeo'); }
  }
}
console.log('Revisão manual obrigatória: gravação verdadeira, texto legível, navegação e alteração de estado.');
console.log('GitHub público e instalação anônima devem ser verificados remotamente.');
process.exitCode = errors ? 1 : 0;
