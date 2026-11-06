# 🏆 Prompt 05 — Sistema de conquistas

## Status e objetivo

Proposta de conquistas, medalhas, progresso, notificações e recompensas para o jogo. A lista extensa de exemplos recebida é um conjunto de ideias; não representa conteúdo aprovado, catálogo implementado ou condições já instrumentadas.

O sistema deve reconhecer eventos verificáveis de gameplay, apresentar progresso e desbloqueios sem interromper a partida, e evitar concessões duplicadas ou resultados definidos somente pelo cliente.

## Modelo de conquista

Uma definição pode conter:

- ID estável, nome, descrição e categoria.
- Raridade visual, sem implicar vantagem competitiva.
- Condição de desbloqueio e progresso opcional.
- Recompensa aprovada, se houver.
- Indicador de segredo, período/sazonalidade e regras de expiração, quando definidos.
- Ícone, som e animação configuráveis.

O estado por jogador é separado da definição: progresso, conclusão, data de desbloqueio e estado de exibição/resgate da recompensa, se aplicável. Conquistas repetidas/por etapas precisam de regra explícita sobre ID de etapa e elegibilidade.

## Eventos candidatos

O prompt cita eventos como partida concluída/vencida, eliminação, dano recebido, habilidade usada, parry, esquiva, armadilha ativada, vegetal coletado, item desbloqueado, montaria usada e assistência de equipe. Só instrumentar eventos que realmente existam e tenham semântica confiável; não criar conquistas que dependam de mecânicas ainda não aprovadas ou implementadas.

Os exemplos de armas, montarias, armadilhas, chuva de vegetais e eventos caóticos são ideias condicionadas à existência dessas mecânicas. A lista de nomes engraçados/regionalismos precisa de revisão editorial e de lore antes de virar conteúdo oficial.

## Arquitetura alinhada ao projeto

- **Definições:** `AchievementDefinition` e condições como dados configuráveis versionados; evitar lógica exclusiva em UI ou constantes espalhadas por personagem.
- **Eventos de domínio:** sistemas de partida publicam eventos tipados com contexto mínimo; tracker atualiza progresso de forma determinística e testável.
- **Serviço de conquistas:** coordena consulta, progresso e desbloqueio. Não duplicar serviços de recompensa ou perfil existentes.
- **Recompensas:** reutilizar a camada de recompensas; desbloquear conquista e conceder recompensa são operações distintas, idempotentes e reconciliáveis.
- **Autoridade online:** eventos/resultados e concessões vêm do servidor autoritativo ou de resultado validado. Cliente pode apresentar a notificação, mas não validar vitória ou conceder recompensas.
- **Persistência:** salvar estado pela identidade/perfil do jogador, com sincronização quando disponível; tolerar reconexão e resposta repetida sem duplicar progresso ou item.
- **UI:** fila de notificações de desbloqueio no topo, fora das áreas seguras de toque e sem bloquear comandos. É diferente do badge persistente de recompensa pendente documentado em [Fowlgen-Wars-Prompt-08-Badges-Recompensas-Pendentes.md](Fowlgen-Wars-Prompt-08-Badges-Recompensas-Pendentes.md).
- **MVP/Presenter:** View passiva apresenta dados e preferências; Presenter/serviço consome eventos e atualiza UI. Configurações de notificações/áudio respeitam os sistemas existentes.
- **Separação de produto:** conquistas de gameplay pertencem ao jogo. Reputação, selos e atividades da FOWLGEN COMMUNITY permanecem sistemas separados, sem conversão automática entre pontos ou poder de combate.
- **Analytics:** métricas de progresso e conclusão precisam apoiar balanceamento sem expor dados pessoais desnecessários.

## Conteúdo e recompensas

As categorias de combate, sobrevivência, habilidades, caos, armamento, equipe, personalização, progressão, humor e segredos são propostas organizacionais. Recompensas possíveis incluem XP, título, medalha, moldura, emote ou cosmético, mas cada concessão e impacto econômico exige aprovação. Não assumir moedas ou economia completa.

Condições secretas devem ser alcançáveis e intencionais; nunca depender de explorar bugs, trapaças ou estados impossíveis. Conquistas competitivas não devem exigir pagamento nem recompensar ações que prejudiquem aliados.

## Escopo recomendado para POC

Após confirmar eventos existentes, selecionar poucas conquistas baseadas em eventos confiáveis (por exemplo, primeira partida concluída), sem criar catálogo completo. Testar progresso incremental, desbloqueio, deduplicação, reconexão, recompensa e fila/expiração visual em UI; multiplayer deve validar a origem autoritativa separadamente.

## Decisões pendentes

- Quais eventos do jogo já existem e quem é a fonte de verdade.
- Se progresso é por conta, temporada ou partida e como migra versões.
- Condições exatas e regras para partidas incompletas, reconexão, bots e partidas personalizadas.
- Recompensas aprovadas e relação com o sistema de recompensas existente.
- Quantidade/ritmo de notificações, preferências de acessibilidade e áudio.
- Política para conquistas sazonais e histórico permanente.

