# Desempenho e carregamento

## O que a inspeção encontrou

O projeto recebido já apresentava o cabeçalho antes de ler o armazenamento e encadeava gravações. Não foi fornecida a versão antiga com a tela inteira de "Carregando tarefas...", nem medições do Galaxy S23. Portanto, não é possível afirmar que a lentidão observada no aparelho foi reproduzida ou eliminada nesta máquina.

Havia trabalho evitável e riscos demonstráveis: regravação logo após toda leitura, montagem de todos os cartões com ScrollView.map, callbacks recriados, possibilidade de mutações chamadas antes da hidratação e ausência de recuperação se a leitura não terminasse.

A revisão elimina a escrita inicial, virtualiza a lista, memoiza cartões e estabiliza callbacks. Mantém bloqueio real das mutações enquanto os dados não estão disponíveis. O timeout de 10 segundos não inventa uma lista: mostra erro, conserva os dados e permite repetir a leitura. O teste de lista grande verifica que 200 tarefas não são todas montadas inicialmente.

## Medições incluídas

Em desenvolvimento, os logs exibem:

- primeiro layout da tela inicial;
- navegação pronta;
- tempo de leitura do AsyncStorage;
- tempo de interpretação/validação;
- tempo total de hidratação e quantidade de tarefas.

`performance.cjs` começa a contar após sua avaliação pelo JavaScript. Essa referência não mede o toque no ícone do Expo Go, a abertura nativa ou o download/compilação anterior pelo Metro. `TaskStore` mede a leitura separadamente. Os números de tempo não incluem conteúdo das tarefas.

## Execução Web observada nesta revisão

Uma abertura real no navegador, em modo de desenvolvimento, registrou:

| Etapa | Tempo |
| --- | ---: |
| Navegação pronta, desde a avaliação do módulo de medição | 446,1 ms |
| Leitura do armazenamento Web | 34,4 ms |
| Interpretação/validação de três tarefas | 3,2 ms |
| Hidratação total | 37,6 ms |
| Primeiro callback de layout da tela inicial | 554,6 ms |
| Compilação Web inicial pelo Metro | 12.829 ms |

São observações de **uma execução Web**, com máquina e ferramentas em uso. O callback de layout não é medição de primeiro pixel. Esses dados distinguem o tempo do bundle do tempo dos dados; não são um benchmark do Android nem uma garantia de latência.

## Comparação controlada reproduzível

```sh
npm run benchmark
```

O script compara a sequência de operações do contexto recebido com o store atual. Usa 1.000 tarefas, armazenamento em memória com atraso artificial de 25 ms por operação e mediana de sete repetições. A sequência anterior é explicitamente reproduzida no script; não é uma gravação histórica de aparelho.

Resultado de uma execução em Node 24.13.0:

| Medida | Sequência anterior | Store atual |
| --- | ---: | ---: |
| Dados disponíveis | 31,75 ms | 35,90 ms |
| Armazenamento sem operação pendente | 62,51 ms | 35,91 ms |
| Leituras iniciais | 1 | 1 |
| Gravações iniciais | 1 | 0 |

A leitura continua sendo necessária. Não houve melhora do tempo até dados disponíveis nessa amostra. O ganho comprovado é remover uma operação de gravação e evitar a montagem inicial de toda a lista. Valores variam conforme máquina e carga; execute o script para obter uma nova amostra.

## Comparação que ainda precisa ser feita no Galaxy S23

1. Guarde a versão anterior e esta revisão em diretórios distintos, mantendo os dados do usuário e a mesma chave do AsyncStorage. Não limpe o armazenamento para melhorar artificialmente os resultados.
2. Use Expo Go 57.0.9, mesma rede e o mesmo número de tarefas. Anote SDK, aparelho, quantidade de tarefas e se o bundle estava em cache.
3. Faça pelo menos cinco aberturas com bundle já compilado de cada versão. Registre os tempos de leitura/hidratação, primeiro layout e tempo percebido a partir da abertura. Não misture com uma medição de `expo start --clear`.
4. Faça uma abertura sem cache separada para identificar o custo de Metro/download.
5. Teste uma lista maior, pesquisa, rolagem e digitação. Observe Android, teclado e escala de fonte no aparelho.
6. Confirme que cadastro, edição e exclusão ficam indisponíveis antes da hidratação e que fechar/reabrir conserva os dados.

**Estado:** melhorias de código e testes concluídos; redução da lentidão no S23 ainda pendente de medição real.
