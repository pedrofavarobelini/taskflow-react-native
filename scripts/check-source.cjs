/** Verifica a lista publicável; nunca imprime o conteúdo de um possível segredo. */
const fs = require('node:fs');
const { execFileSync } = require('node:child_process');
const files = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', '-z'], { encoding: 'utf8' }).split('\0').filter(Boolean);
const blockedPath = /(^|\/)(node_modules|\.expo|\.cache|validation|\.git)(\/|$)|(^|\/)\.env(?:\.|$)|\.(pem|key|p12|pfx|jks|keystore)$/i;
const secretPatterns = [/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/, /gh[pousr]_[A-Za-z0-9]{30,}/, /github_pat_[A-Za-z0-9_]{60,}/, /AKIA[A-Z0-9]{16}/];
let failed = false;
for (const file of [...new Set(files)]) {
  if (blockedPath.test(file)) { console.error(`Arquivo não publicável: ${file}`); failed = true; continue; }
  if (!fs.existsSync(file) || /\.(mp4|png|jpg|jpeg|ico)$/i.test(file)) continue;
  if (secretPatterns.some((pattern) => pattern.test(fs.readFileSync(file, 'utf8')))) {
    console.error(`Possível credencial em ${file}; revise antes de publicar.`); failed = true;
  }
}
console.log(`${failed ? 'FAIL' : 'PASS'}: ${new Set(files).size} arquivos examinados (caminhos e padrões de credenciais).`);
console.log('A checagem por padrões não substitui revisão dos arquivos.');
process.exitCode = failed ? 1 : 0;
