# TaskFlow

Aplicativo de gerenciamento de tarefas desenvolvido com **React Native, Expo e JavaScript**. O projeto surgiu como uma atividade prática de desenvolvimento mobile, com foco em navegação entre telas, componentes reutilizáveis, gerenciamento de estado e armazenamento local.

## Funcionalidades

- Cadastro, edição e exclusão de tarefas.
- Marcação de tarefas como pendentes ou concluídas.
- Organização por categoria e prioridade.
- Pesquisa por título, descrição ou categoria.
- Filtros de tarefas pendentes e concluídas.
- Tela de detalhes e painel de estatísticas.
- Armazenamento no próprio dispositivo com AsyncStorage.

## Tecnologias

- React Native e Expo SDK 57
- JavaScript e React Hooks
- React Navigation
- AsyncStorage
- Jest e React Native Testing Library

## Como executar

É necessário ter o **Node.js** instalado. Para usar o aplicativo no celular, instale uma versão do **Expo Go compatível com o SDK 57**.

```bash
git clone https://github.com/pedrofavarobelini/taskflow-react-native.git
cd taskflow-react-native
npm ci
npm start
```

Com o Metro iniciado, abra o projeto no Expo Go pelo QR Code. Para testar a versão Web, use:

```bash
npm run web
```

## Estrutura do projeto

```text
App.js                 Navegação principal
src/
  components/          Componentes reutilizáveis
  context/             Estado compartilhado das tarefas
  screens/             Telas do aplicativo
  theme/               Cores e estilos compartilhados
  utils/               Regras de negócio e persistência
tests/                 Testes automatizados
```

O aplicativo possui quatro telas principais: **Início**, **Nova/Editar tarefa**, **Detalhes** e **Estatísticas**.

## Testes

Para executar as suítes de testes:

```bash
npm test
```

Também estão disponíveis os comandos `npm run check:source` para verificações do projeto e `npx expo install --check` para conferir as dependências do Expo.

## Observações

As tarefas são armazenadas localmente. O projeto não utiliza servidor, autenticação ou sincronização em nuvem. Por isso, limpar os dados ou desinstalar o aplicativo pode apagar as tarefas salvas.

O repositório reúne o código-fonte e os testes de um projeto acadêmico, disponibilizados para estudo e demonstração de funcionalidades de desenvolvimento mobile.
