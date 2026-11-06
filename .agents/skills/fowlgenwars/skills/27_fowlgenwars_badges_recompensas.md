# 🎁 Badges e recompensas pendentes

## Status

Proposta de interface e estado de recompensas. Organiza o prompt recebido sem afirmar que o sistema esteja implementado ou aprovado para o escopo atual.

## Objetivo

Mostrar indicadores visuais nos menus e categorias que tenham recompensas não resgatadas ou conteúdo novo ainda não visualizado.

## Requisitos

- Componente reutilizável `NotificationBadge` com bolinha, indicador dourado ou contador.
- Categorias: presentes, baús, recompensas diárias, missões, eventos, itens novos, skins e equipamentos.
- Suportar várias recompensas pendentes, sincronizações ao entrar no jogo e recompensas recebidas durante a sessão.
- Manter indicadores enquanto houver conteúdo pendente; remover somente a notificação correspondente à ação concluída.
- Atualizar menus principais e secundários automaticamente.
- Persistir/sincronizar os estados relevantes entre sessões.
- Evitar duplicatas pelo identificador único da recompensa.
- Animação discreta opcional; Canvas responsivo para Android e iOS.

## Modelo de estado recomendado

Não misturar resgate com visualização:

- Estado de resgate: `AVAILABLE`, `CLAIMING`, `CLAIMED` ou `EXPIRED`.
- Estado de visualização, quando aplicável: campo separado, por exemplo `viewedAt` ou `isViewed`.
- Um badge é uma projeção calculada dos registros pendentes por categoria, não um booleano manual mantido separadamente.
- Abrir um menu pode marcar conteúdo como visto, mas não como resgatado.

Os nomes acima são proposta de modelagem; validar a compatibilidade com os contratos de API e dados atuais antes de adotá-los.

## Arquitetura alinhada ao projeto

- **Domínio/dados:** recompensa identificada por ID estável, categoria, estado de resgate, estado de visualização e metadados mínimos.
- **Aplicação:** `RewardService` consulta e solicita resgates; não deve conceder itens por simples clique local.
- **Notificações:** `NotificationService` deriva os totais/indicadores das recompensas pendentes e publica alterações para a UI.
- **Apresentação:** `NotificationBadge` é independente de economia; `RewardPanelController` e `InventoryNotificationController` consomem os indicadores.
- **Persistência/sincronização:** serviço de perfil/repositório carrega o estado inicial e aplica atualizações durante a sessão; cache local é provisório até confirmação remota.
- **Autoridade e idempotência:** em economia conectada, servidor confirma concessões e resgates. Requisições repetidas, respostas duplicadas e falhas de rede não podem duplicar itens nem remover avisos de forma incorreta.
- **Escopo de partida:** badges e painéis são UI de menus/progressão; não entram na simulação de combate nem no ciclo de autoridade do FishNet.

## Regras de atualização

1. O serviço de recompensas recebe o estado sincronizado.
2. A notificação agrupa recompensas que continuam pendentes de resgate ou visualização, conforme a categoria.
3. A UI atualiza o badge afetado sem limpar os demais.
4. Uma confirmação de resgate altera somente o ID correspondente.
5. A sincronização de estado ocorre após reconexão/entrada e após operações relevantes.

## Critérios de aceitação

- Uma recompensa pendente mostra seu badge.
- Abrir o menu sem resgatar não remove o aviso de resgate.
- Visualizar não é tratado como resgatar.
- Resgatar uma recompensa remove somente o aviso correspondente.
- Outras recompensas pendentes mantêm o indicador da categoria.
- A última recompensa pendente removida limpa o badge agregado.
- Uma nova recompensa reativa o indicador.
- Reabrir o jogo restaura ou sincroniza estados corretos.
- Requisições repetidas não duplicam itens nem recompensas.
- A UI se adapta a diferentes resoluções mobile.
