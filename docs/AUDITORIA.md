# Auditoria técnica — 21/10/2026

## Origem e escopo

O workspace recebido estava vazio. O projeto foi localizado na pasta `TaskFlow_Entrega_Final`, lido antes das alterações e copiado para o workspace autorizado. Os hashes dos 26 arquivos de origem e da cópia eram iguais. Não havia Git, lockfile nem node_modules na origem. A pasta original foi mantida sem alterações.

Foram examinados App.js, package.json, app.json, todos os componentes, quatro telas, contexto, utilitários, testes, scripts e documentação. Não foram encontrados arquivos AGENTS.md nos diretórios examinados do projeto. O link público do enunciado não abriu; o conector Notion também retornou 404 ao consultar o ID da página. Os critérios adicionais da professora permanecem por confirmar.

## Achados e correções

| Achado no código recebido | Alteração |
| --- | --- |
| Operações do contexto não verificavam hidratação; somente o botão da tela inicial fazia bloqueio. | A camada de dados recusa todas as mutações antes de carregar, inclusive chamadas fora da tela inicial. |
| Falha de leitura mostrava três exemplos e desabilitava persistência, permitindo alterações apenas aparentes. | Estado de erro explícito, sem exemplos e sem indicadores falsos, com nova tentativa e preservação do conteúdo salvo. |
| Uma leitura que nunca respondesse mantinha o carregamento indefinido. | Timeout de leitura de 10 segundos; respostas antigas são descartadas; a recuperação continua bloqueando mutações até validar os dados. |
| Efeitos regravavam a lista assim que ela era lida, mesmo sem alterações. | Nenhuma gravação de inicialização. Dados só são escritos por uma operação de usuário. |
| Formulário navegava antes de saber se o AsyncStorage havia gravado. | Operações assíncronas confirmam persistência antes do sucesso e da navegação. Falhas conservam estado anterior e texto do formulário. |
| Funções recriadas e lista inteira montada por ScrollView.map. | Funções estáveis no store, FlatList com lote inicial de oito, callbacks estáveis e TaskCard memoizado. |
| Toques rápidos podiam criar mais de uma tarefa. | Trava imediata com ref e controles desabilitados durante gravação. |
| Edição/exclusão por ID inexistente não informava falha ao chamador. | Operação rejeitada sem gravar nem modificar outras tarefas. |
| Testes cobriam utilitários, mas não as operações do contexto nem as telas. | Testes do mesmo store usado pelo app, telas e navegador real do React Navigation em Jest. |
| Aviso de sucesso não mudava quando a tela existente recebia novos parâmetros após edição. | Sincronização do aviso pelo parâmetro recebido; defeito encontrado pelo teste de navegação. |
| Pesquisa exigia o mesmo acento do texto. | Busca normalizada, combinável com status, sem modificar a lista original. |
| Checkbox dentro do botão do cartão; alvos pequenos e cores secundárias claras. | Controles irmãos, alvos de 48 dp, estados acessíveis, cores de texto mais escuras e largura adaptável. |
| Script de entrega verificava apenas assinatura/tamanho de MP4 e uma pasta .git em node_modules. | Validação por ffprobe/FFmpeg, duração, decodificação e consulta dos arquivos efetivamente rastreados pelo Git. |
| Sem lockfile; versões do app e package divergentes. | package-lock.json versionado; app.json alinhado a 1.1.0. |

Foram mantidos navegação, identidade do app, as quatro telas, categorias, prioridades, chave e formato do AsyncStorage. Não foi adicionado servidor, nem biblioteca de execução. As dependências novas são ferramentas de teste.

## Expo

`npm install` resolveu Expo **57.0.31**, dentro do intervalo 57 declarado. React Native continua **0.86.3**, React **19.2.3**, AsyncStorage **2.2.0**. A matriz foi conferida com o SDK instalado. `npx expo install --check` aprovou as dependências e `npx expo-doctor@latest` aprovou **21/21 verificações**.

`android.edgeToEdgeEnabled` já estava ausente no arquivo recebido. Não foi necessário removê-lo novamente. Nenhuma alteração para SDK 58 foi feita. A execução no Expo Go 57.0.9 permanece uma homologação a realizar no aparelho; o empacotamento não comprova esse teste.

Referências: [SDK 57](https://expo.dev/sdk/57), [Expo Go por SDK](https://expo.dev/go?device=true&platform=android&sdkVersion=57).

## npm audit

A instalação inicial tinha **15 alertas altos**, propagados na árvore Expo/Metro/React Native. Após instalar as ferramentas de teste, a árvore completa apresentou **50 alertas: 45 altos e 5 moderados**. A consulta com `--omit=dev` apresentou 28 alertas (23 altos e 5 moderados), ainda incluindo ferramentas e peers do ecossistema React Native. Isso conta os pacotes afetados na árvore, não 50 vulnerabilidades distintas. O ensaio `npm audit fix --dry-run --json` propôs **zero alterações compatíveis**.

As três causas distintas identificadas nesta consulta foram:

| Pacote / aviso | Situação e avaliação do contexto |
| --- | --- |
| [braces — GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm) | Sem versão corrigida indicada no advisory. Faz parte do processamento de padrões de arquivos das ferramentas. O texto das tarefas não é enviado a esse processamento pelo aplicativo. |
| [node-forge — GHSA-86w9-cpqp-85rv](https://github.com/advisories/GHSA-86w9-cpqp-85rv) | Sem versão corrigida indicada. Presente nas ferramentas Expo de certificados. O TaskFlow não implementa validação RSA nem recebe certificados fornecidos por usuários. |
| [sprintf-js — GHSA-hp3w-g68c-fv3c](https://github.com/advisories/GHSA-hp3w-g68c-fv3c) | Sem versão corrigida indicada. Aparece na árvore das ferramentas, inclusive via peers do preset de testes do React Native. O aplicativo não passa títulos como formatos de sprintf. |

Essa avaliação é de alcance do código, não um pentest e nem uma declaração de ausência de vulnerabilidades. Os alertas continuam abertos. Não foi aplicado `audit fix --force`, override sem patch ou downgrade para Expo 44/React Native 0.72, opções incompatíveis sugeridas em parte do relatório. Um servidor Metro deve ser usado apenas durante desenvolvimento em ambiente confiável.

## Dados e publicação

O aplicativo não tem credenciais, backend ou chamadas de rede para transmitir tarefas. AsyncStorage não é criptografado. Os logs de desempenho contêm tempos e quantidade, sem títulos ou descrições. O script `check:source` examina caminhos e padrões de credenciais sem imprimir um possível segredo; ele não cobre todo formato possível de informação confidencial.

.gitignore exclui dependências, caches, builds, relatórios locais de ferramentas, arquivos .env e chaves. package-lock.json permanece incluído para instalação reproduzível. A identidade do Git foi configurada apenas neste repositório, com endereço noreply público. Outros repositórios não foram alterados.

