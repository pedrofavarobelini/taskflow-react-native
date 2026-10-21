# Publicação do TaskFlow

Destino solicitado: `pedrofavarobelini/taskflow-react-native`, público, com branch principal `main`.

## Situação desta revisão

O conector GitHub confirmou a conta `pedrofavarobelini`, mas não oferece criação de repositórios. A consulta ao destino retornou 404. A CLI e o Git Credential Manager disponíveis estavam ligados a `favaropedrinho-spec`; a CLI informou token inválido. O navegador abriu a página de login. Nenhuma publicação foi confirmada e nenhum outro repositório foi alterado.

É necessário autenticar a CLI na conta correta. Faça isso em um terminal seu, sem compartilhar senha ou token:

```powershell
gh auth login -h github.com
gh api user --jq .login
```

A segunda linha deve mostrar `pedrofavarobelini`.

## Conferir e publicar

Na pasta que contém este README:

```powershell
npm.cmd ci
npm.cmd test
npm.cmd run check:source
git status --short
git remote -v
gh repo view pedrofavarobelini/taskflow-react-native
```

Se o destino não existir, crie-o vazio e público:

```powershell
gh repo create pedrofavarobelini/taskflow-react-native --public --description "Gerenciador de tarefas acadêmico em React Native e Expo SDK 57"
```

Não execute a criação em outra conta. Se já existir, examine seu histórico antes de enviar. O Git local deste workspace já foi inicializado em `main`, com identidade restrita ao projeto e o remote solicitado. Não é preciso alterar a configuração global.

```powershell
git push -u origin main
gh repo view pedrofavarobelini/taskflow-react-native --json url,visibility,defaultBranchRef
```

Não use `--force`. Se houver commits remotos inesperados, compare os históricos antes de integrar. A mera presença de um remote local não comprova publicação.

## Conferir acesso anônimo

Abra `https://github.com/pedrofavarobelini/taskflow-react-native` em janela anônima e confirme README, código e vídeo. Em outra pasta, clone sem autenticação e execute `npm ci`, `npm test` e `npx expo install --check`. Um clone local do Git verifica a integridade do projeto, mas não prova acesso público remoto.

## Vídeo posterior

Copie a gravação real do S23 para `demo/demo.mp4`, confira `demo/ROTEIRO_VIDEO.md` e execute:

```powershell
npm.cmd run validar-entrega
git add demo/demo.mp4 README.md docs/VALIDACAO.md
git commit -m "Adiciona demonstracao real do TaskFlow"
git push
```

Atualize a documentação somente com o resultado verdadeiro da validação. O verificador aceita até 25 MB como limite de projeto para manter a entrega compacta; não envie vídeo enorme nem node_modules. Assista ao arquivo no GitHub ou baixe-o anonimamente para conferir acesso.

A submissão acadêmica final e quaisquer critérios adicionais dependem da confirmação do enunciado pela professora.
