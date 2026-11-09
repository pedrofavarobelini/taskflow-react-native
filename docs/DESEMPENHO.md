# Desempenho do TaskFlow

## Estratégias utilizadas

A lista principal utiliza `FlatList`, que renderiza os itens gradualmente. O componente `TaskCard` usa memoização, e os callbacks da lista evitam recriações desnecessárias.

O carregamento das tarefas acontece a partir do AsyncStorage. Enquanto os dados não estiverem disponíveis, o aplicativo bloqueia ações de escrita para evitar alterações inconsistentes. Não há gravação automática da lista apenas por abrir o app.

## Medições de desenvolvimento

Os utilitários em `src/utils/performance.cjs` registram eventos como navegação pronta e primeiro layout. Há também medições do carregamento do armazenamento.

Para executar o comparativo em ambiente Node:

```bash
npm run benchmark
```

O benchmark usa dados e atrasos simulados. Ele ajuda a comparar operações de armazenamento, mas **não mede o tempo real de abertura no Android**.

## Teste no aparelho

Uma verificação de desempenho no celular deve observar a abertura inicial, a rolagem de uma lista grande, a digitação na pesquisa e a persistência após fechar e abrir o aplicativo.

Ainda não há resultado de benchmark Android publicado para esta versão.
