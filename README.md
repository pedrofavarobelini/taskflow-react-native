# TaskFlow

Gerenciador de tarefas em React Native e JavaScript para um trabalho acadêmico. Permite cadastrar, pesquisar, filtrar, editar, concluir e excluir atividades, acompanhar estatísticas e guardar os dados no próprio dispositivo, sem conta ou servidor.

**Estado da entrega:** código revisado, testado e [publicado no GitHub](https://github.com/pedrofavarobelini/taskflow-react-native). A homologação desta revisão no Samsung Galaxy S23 e o vídeo real ainda precisam ser concluídos. Consulte [o relatório de validação](docs/VALIDACAO.md).

## Objetivo acadêmico

Demonstrar componentes reutilizáveis, props, callbacks, hooks, navegação com parâmetros e persistência local em um aplicativo funcional. Prazo informado: **16/11/2026**.

O [enunciado da professora](https://irradiated-worm-914.notion.site/Trabalho-Pr-tico-Aplicativo-Mobile-com-React-Native-3f9115cb767d80e4aa06f44631687565) não pôde ser consultado nesta revisão. A implementação segue os requisitos fornecidos pelo aluno; critérios adicionais do enunciado precisam ser confirmados.

## Tecnologias

- Expo **SDK 57**, sem migração para SDK 58; versão efetivamente instalada registrada em `package-lock.json`.
- React Native 0.86.3, React 19.2.3 e JavaScript.
- React Navigation 7 com pilha nativa.
- AsyncStorage 2.2.0 e React Hooks.
- `@expo/vector-icons`, safe areas e React Native Web.
- Testes com Node, Jest Expo 57 e React Native Testing Library.

A matriz de dependências passou em `expo install --check` e nas 21 verificações do Expo Doctor. Isso confirma a configuração, mas não substitui abrir esta revisão no **Expo Go 57.0.9**. A execução anterior no Galaxy S23 foi informada pelo aluno.

## Funcionalidades e telas

| Tela / rota | Recursos |
| --- | --- |
| Início / `Inicio` | Lista virtualizada, busca por título, descrição e categoria sem distinguir acentos ou caixa; filtros Todas, Pendentes e Concluídas; progresso; acesso às demais telas. |
| Nova/Editar / `NovaTarefa` | Título obrigatório de até 70 caracteres, descrição até 500, categoria e prioridade; validação; feedback de gravação e erro. |
| Detalhes / `Detalhes` | Consulta por ID, status, descrição, categoria, prioridade e data; conclusão, edição e exclusão com confirmação. |
| Estatísticas / `Estatisticas` | Total, pendentes, concluídas, percentual e progresso por categoria calculados sobre o estado real. |

Não há números fixos usados como estatísticas. Quando a chave ainda não existe, três exemplos são criados em memória. A primeira alteração grava a lista completa; uma lista vazia salva continua vazia.

## Pré-requisitos

- Node.js **22.13+ na linha 22 LTS**, ou 24.3+ na linha 24. Validado nesta revisão com Node 24.13.0 e npm 11.17.0.
- Celular Android com Expo Go compatível com SDK 57. O alvo deste trabalho é Expo Go 57.0.9 no Galaxy S23.
- Computador e celular na mesma rede para o modo LAN; Git para clonar.
- FFmpeg/ffprobe apenas para validar o vídeo, não para usar o aplicativo.

## Instalação reproduzível

Clone o repositório público:

```sh
git clone https://github.com/pedrofavarobelini/taskflow-react-native.git
cd taskflow-react-native
npm ci
```

O acesso público e o clone sem credenciais foram confirmados nesta revisão. `npm ci` usa o lockfile versionado. `npm install` também foi executado nesta revisão.

No PowerShell, use `npm.cmd` e `npx.cmd` se a política local bloquear os atalhos `.ps1`.

## Executar no Expo Go

```sh
npm start
```

Abra o Expo Go e escaneie o QR Code. Aguarde o Metro compilar o primeiro bundle. Para o navegador, use `npm run web`; para um emulador Android já configurado, `npm run android`.

Se a rede local impedir conexão, experimente `npx expo start --tunnel`; esse modo depende de conectividade externa e pode exigir o complemento de túnel do Expo. Use `npx expo start --clear` somente para investigar cache, pois ele torna a próxima compilação mais demorada.

Para conferir compatibilidade sem trocar versões automaticamente:

```sh
npx expo install --check
npx expo-doctor@latest
```

O [download oficial do Expo Go por SDK](https://expo.dev/go?device=true&platform=android&sdkVersion=57) permite selecionar a versão compatível. Não atualize o projeto para SDK 58 para resolver problemas de rede ou cache.

## Navegação e parâmetros

O cartão recebe o ID da tarefa selecionada e abre:

```js
navigation.navigate('Detalhes', { taskId });
```

Os detalhes consultam a versão atual da tarefa, sem transportar uma cópia desatualizada:

```js
const taskId = route.params?.taskId;
const task = tasks.find((item) => item.id === taskId);
```

A edição recebe o mesmo `taskId`. Após salvar, `popTo('Detalhes', { taskId, notice })` retorna à tarefa existente. Um ID inexistente mostra uma mensagem e permite voltar. Um teste usa o navegador real do React Navigation para verificar o trajeto completo.

## Componentes, props e callbacks

| Componente próprio | Props e finalidade |
| --- | --- |
| `TaskCard` | `task`, `onPress`, `onToggle`, `disabled`: exibe dados e devolve o ID nas interações. |
| `SearchField` | `value`, `onChangeText`, `editable`: campo controlado de pesquisa. |
| `FilterChip` | `label`, `selected`, `onPress`, `disabled`: filtros e opções do formulário. |
| `ActionButton` | `title`, `onPress`, `variant`, `loading`, `disabled`: ações com estado de gravação. |
| `TopBar` | `title`, `subtitle`, `onBack`: cabeçalho e retorno. |
| `Screen` | `children`, `onLayout`: áreas seguras, largura e medição do primeiro layout. |
| `StorageWarning` | `message`, `onRetry`: erro de armazenamento e recuperação. |

## Hooks com finalidade real

- `useState`: controla busca e filtro no início, campos e erro no formulário e mensagens nos detalhes.
- `useEffect`: inicia uma única hidratação no provider; sincroniza o formulário quando recebe uma tarefa por ID e o aviso ao retornar da edição. Não existe efeito que regrave a lista só porque ela foi lida.
- `useSyncExternalStore`: liga o React ao estado da camada de persistência, com assinaturas removidas no desmontar.
- `useMemo`: deriva resultados e estatísticas; `useCallback` estabiliza callbacks da lista.
- `useRef`: conserva a instância do armazenamento e impede dois cadastros por toques rápidos.

## Persistência, falhas e inicialização

A chave existente **`@taskflow:tasks:v1`** e o formato das tarefas foram preservados. `taskStorage.cjs` valida o JSON antes de disponibilizá-lo. Dados inválidos não são apagados nem substituídos por exemplos.

O cabeçalho aparece enquanto a leitura assíncrona acontece. Antes da hidratação, cadastro, edição, exclusão e conclusão são bloqueados tanto nos controles quanto na camada de dados. Após 10 segundos sem resposta de leitura, o aplicativo oferece nova tentativa; uma resposta antiga não substitui uma recuperação posterior.

As gravações são serializadas. **A mudança só entra no estado confirmado depois de `setItem` resolver.** Em erro, o estado anterior e o formulário são mantidos, a navegação não anuncia sucesso e o usuário pode tentar novamente. Como em qualquer armazenamento, uma falha nativa ambígua exige conferir os dados após reabrir; não há promessa de transação distribuída.

AsyncStorage é local e não criptografado. Não use o trabalho para armazenar credenciais ou informações sigilosas. Desinstalar o app ou limpar seus dados pode remover as tarefas. Não existe sincronização em nuvem.

A lista usa `FlatList`, oito itens no lote inicial e cartões memoizados. Não há download de fontes ou imagens bloqueando a hidratação; a fonte de ícones é um recurso empacotado.

Veja [as medições e seus limites](docs/DESEMPENHO.md). O tempo de compilação/download pelo Metro e a abertura do Expo Go são etapas diferentes da leitura do AsyncStorage.

## Estrutura

```text
App.js                       rotas e providers
app.json                     configuração Expo SDK 57
package.json / package-lock.json
src/
  components/                sete componentes reutilizáveis
  context/TasksContext.js    conexão entre React e persistência
  screens/                   quatro telas
  theme/colors.js            cores
  utils/
    taskUtils.cjs            validação, busca e estatísticas
    taskStorage.cjs          esquema persistido e serialização
    taskStore.cjs            hidratação, fila e operações
    performance.cjs          medições de desenvolvimento
scripts/                     auditoria de arquivos, benchmark e vídeo
tests/                       lógica, armazenamento, telas e navegação
docs/                        auditoria, desempenho e validação
demo/                        roteiro; MP4 real ainda pendente
```

## Testes e verificações

```sh
npm test
npm run check:source
npm run benchmark
npm run export
npm run validar-entrega
```

`npm test` executa testes de lógica/persistência e de interface. Nesta revisão passaram **32 testes Node e 14 testes Jest**: cadastro, edição, exclusão, conclusão, filtros, busca, estatísticas, persistência ao reabrir a camada de dados, falhas de leitura/escrita, concorrência, dados inválidos, hidratação e navegação real em ambiente de teste.

O AsyncStorage é substituído por uma implementação em memória nos testes; os componentes nativos usam o ambiente do Jest Expo. Isso **não é um teste do binário Android**. Os bundles para Android, iOS e Web foram gerados com Metro/Hermes, sem equivaler a compilação Gradle/Xcode ou homologação em aparelho. Também foram aprovados um clone local e um clone HTTPS anônimo do GitHub em pastas separadas, com npm ci, os 46 testes, checagem de arquivos e matriz Expo, sem alterar o lockfile.

`validar-entrega` retorna falha enquanto faltar `demo/demo.mp4`. Com o arquivo presente, usa ffprobe e FFmpeg para validar contêiner, duração até 30 segundos e decodificação. Autenticidade e legibilidade precisam de revisão humana. Esse comando também não confirma sozinho a publicação no GitHub.

Os alertas do npm foram revisados em [docs/AUDITORIA.md](docs/AUDITORIA.md). Não foi aplicado `npm audit fix --force`.

## Demonstração

**Vídeo real: pendente.** Ainda não existe MP4 validado, nem link alternativo confirmado. Siga [o roteiro de até 30 segundos](demo/ROTEIRO_VIDEO.md) no Galaxy S23 e coloque a gravação em `demo/demo.mp4`. Depois execute `npm run validar-entrega`.

## Publicação e limitações

O repositório [pedrofavarobelini/taskflow-react-native](https://github.com/pedrofavarobelini/taskflow-react-native) está público, com branch principal `main` e push confirmado. A API e o clone responderam sem autenticação. Veja [PUBLICACAO_GITHUB.md](PUBLICACAO_GITHUB.md).

Ainda precisam ser comprovados: abertura desta revisão no Expo Go 57.0.9, teclado/áreas seguras e persistência após fechar o app no Android, acessibilidade com fonte ampliada, desempenho no S23 e vídeo real. Não há migração para SDK 58, integração com servidor, notificações ou sincronização em nuvem.
