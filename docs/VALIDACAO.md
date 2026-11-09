# Testes e validação

Esta página reúne as principais verificações do TaskFlow. Os números abaixo são da execução registrada em **21/10/2026**; não representam uma nova execução.

## Testes automatizados

| Verificação | Último resultado registrado |
| --- | --- |
| Testes de lógica e armazenamento (Node) | 32 aprovados |
| Testes de interface e navegação (Jest) | 14 aprovados |
| Verificação de dependências Expo | Aprovada |
| Expo Doctor | 21 verificações aprovadas |
| Exportação dos bundles para Android, iOS e Web | Aprovada |

Para executar os testes no seu ambiente:

```bash
npm ci
npm test
npm run check:source
npx expo install --check
```

Os testes cobrem cadastro, edição, exclusão, conclusão de tarefas, pesquisa, filtros, estatísticas, persistência, tratamento de erros e navegação. Nos testes de interface, os recursos nativos são simulados; isso não substitui a execução no celular.

## O que falta conferir no Android

- [ ] Iniciar o app no Expo Go compatível com o SDK 57.
- [ ] Cadastrar, editar, concluir e excluir tarefas.
- [ ] Verificar pesquisa, filtros e estatísticas.
- [ ] Fechar e abrir novamente para conferir se as tarefas continuam salvas.
- [ ] Conferir teclado, navegação, tamanho dos textos e diferentes estados da lista.
- [ ] Registrar uma demonstração da execução do aplicativo.

## Demonstração

O arquivo `demo/demo.mp4`, esperado pelo script de conferência da entrega, ainda não está no repositório. Por isso, o comando `npm run validar-entrega` não conclui a verificação do vídeo. Veja as orientações em [demo/README.md](../demo/README.md).

A compilação do bundle e a aprovação dos testes automatizados não garantem, por si só, funcionamento correto em todos os dispositivos.
