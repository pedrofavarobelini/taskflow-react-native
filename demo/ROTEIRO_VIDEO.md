# Gravação real do TaskFlow — máximo 30 segundos

**Estado: pendente.** Não existe `demo/demo.mp4` nesta revisão. Não há acesso a dispositivo Android ou emulador funcional pelo ambiente; adb e Android SDK não foram encontrados. FFmpeg/ffprobe estão disponíveis para validar uma gravação recebida.

## Preparação fora da gravação

1. Execute `npm ci` e `npm start`; abra esta revisão no Expo Go 57.0.9 do Galaxy S23.
2. Confirme as operações do checklist em `docs/VALIDACAO.md`, inclusive fechar/reabrir o app. Aguarde o bundle Metro carregar antes de gravar.
3. Tenha ao menos uma tarefa pendente com título curto e legível. Use dados de demonstração; não mostre notificações ou informações pessoais.
4. Grave em retrato com o gravador nativo do Samsung, idealmente em 1080p, com texto legível. Faça um ensaio para concluir dentro do tempo.

## Tomada contínua sugerida: 28 segundos

| Tempo | Ação | Evidência |
| --- | --- | --- |
| 0–5 s | Mostre início, lista e progresso. | Aplicativo real e estado inicial. |
| 5–10 s | Digite parte curta do título ou selecione Pendentes. | Pesquisa ou filtro funcional. |
| 10–16 s | Abra a tarefa selecionada. | Navegação; detalhes consultados pelo taskId recebido. |
| 16–22 s | Toque em Concluir tarefa e retorne ao início. | Status e progresso mudam. |
| 22–28 s | Abra Nova tarefa, digite um título curto e salve. | Formulário, criação e retorno aos detalhes reais. |

Não é preciso mostrar o valor técnico do ID na tela: a correspondência entre o item selecionado e os detalhes, junto ao código documentado, demonstra o parâmetro. Não acrescente telas técnicas artificiais para isso.

## Depois de gravar

1. Assista à tomada inteira. Ações e texto precisam estar visíveis; falhas não podem ser escondidas por cortes.
2. Pode remover apenas a sobra no início/fim, mantendo a sequência contínua. Se ultrapassar 30 segundos, prefira repetir a tomada. Não acelere para disfarçar falhas.
3. Envie a gravação verdadeira do S23 para revisão ou copie-a como `demo/demo.mp4` neste projeto. Sem esse arquivo, o vídeo continua pendente.
4. Execute `npm run validar-entrega`. O script usa ffprobe para duração/contêiner e FFmpeg para decodificação. Confira manualmente a legibilidade na escala de um celular.
5. Publique e teste o download anônimo. Atualize README e `docs/VALIDACAO.md` com o resultado real.

Se for necessário compactar um MP4 real, preserve a tela inteira, a sequência e a legibilidade. Não use mockups, slides, imagens geradas, dublagem de interface ou animações como prova de execução.
