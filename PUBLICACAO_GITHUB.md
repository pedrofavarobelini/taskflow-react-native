# Publicação do TaskFlow

**Repositório público confirmado:** https://github.com/pedrofavarobelini/taskflow-react-native

Branch principal: **main**. O push, a visibilidade pública, a resposta anônima HTTP 200 e o clone HTTPS sem credenciais foram confirmados nesta revisão. O resultado completo está em [docs/VALIDACAO.md](docs/VALIDACAO.md).

O código foi publicado na conta solicitada. A configuração de identidade e autenticação Git fica restrita a este projeto; outros repositórios não foram modificados.

## Clonar e conferir

```powershell
git clone https://github.com/pedrofavarobelini/taskflow-react-native.git
cd taskflow-react-native
npm.cmd ci
npm.cmd test
npx.cmd expo install --check
npm.cmd start
```

A ausência do vídeo faz `npm run validar-entrega` falhar de propósito. Código publicado não equivale a entrega acadêmica completa.

## Atualizações futuras

Confirme que a CLI usa a conta correta, sem compartilhar credenciais:

```powershell
gh api user --jq .login
```

O resultado deve ser `pedrofavarobelini`. Se necessário, autentique em um terminal seu com `gh auth login -h github.com`. Nunca coloque tokens em arquivos do projeto ou na URL de origin.

Depois de revisar as alterações:

```powershell
npm.cmd test
npm.cmd run check:source
git status --short
git add <arquivos-revisados>
git commit -m "Descreve a alteracao"
git push
```

Não use `--force` nem envie node_modules, caches, logs locais ou arquivos confidenciais. A configuração do helper Git deste projeto usa a autenticação do GitHub CLI, sem alterar a configuração global.

## Publicar o vídeo real

Copie a gravação verdadeira do Galaxy S23 para `demo/demo.mp4`. Siga [o roteiro](demo/ROTEIRO_VIDEO.md), confira legibilidade e execute:

```powershell
npm.cmd run validar-entrega
git add demo/demo.mp4 README.md docs/VALIDACAO.md
git commit -m "Adiciona demonstracao real do TaskFlow"
git push
```

O verificador usa ffprobe/FFmpeg para duração até 30 segundos, formato e decodificação. O limite de projeto de 25 MB mantém a entrega compacta. Depois teste o download sem autenticação e atualize a documentação com o resultado verdadeiro.

A submissão acadêmica final depende do vídeo, da homologação Android e da confirmação dos critérios adicionais do enunciado.
