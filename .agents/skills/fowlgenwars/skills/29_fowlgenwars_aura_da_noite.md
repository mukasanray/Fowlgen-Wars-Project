# 🌙 Farm de Aura da Noite

## Status

Ideia de sistema de coleção e cosméticos. Este documento organiza o conceito; não aprova sua inclusão no escopo atual nem afirma que exista implementação.

## Conceito recebido

O jogador usa um botão **FARMAR AURA** para iniciar uma coleta simplificada. A coleta pode conceder auras em forma de chamas coloridas, que ficam na coleção e podem ser equipadas. O conceito sugere progressão, raridade, efeitos visuais e proteção contra azar.

## Auras e raridades mencionadas

| Aura | Raridade indicada | Identidade descrita |
|---|---|---|
| Laranja | Comum | Energia flamejante |
| Verde | Incomum | Energia natural |
| Azul | Rara | Energia elétrica |
| Amarela | Épica | Energia solar |
| Vermelha | Lendária | Energia infernal |
| Roxa | Não definida | Citada na coleção como “roxo sóbrio” |

A cor roxa não recebeu raridade ou descrição consistente no material recebido. Não inferir esses dados.

## Fluxo proposto

1. O jogador toca em **FARMAR AURA**.
2. A coleta ocorre automaticamente durante um período ainda não definido.
3. O sistema sorteia uma aura e informa o resultado.
4. A aura desbloqueada é registrada na coleção.
5. O jogador pode equipá-la para exibição cosmética.
6. Pode haver proteção contra azar, ainda sem regra ou valores definidos.

## Regras de design

- As auras são cosméticas por padrão e não concedem atributos ou vantagem em combate.
- A coleção deve diferenciar aura desbloqueada de aura equipada.
- Efeitos visuais devem ser leves e adequados a dispositivos móveis.
- As imagens externas incluídas no prompt original são referências visuais; não foram incorporadas como assets e suas licenças não foram verificadas.

## Arquitetura alinhada ao projeto

- **Definição de conteúdo:** `AuraDefinition` como dado configurável (por exemplo, ScriptableObject), contendo ID estável, nome, raridade aprovada, cor e referência ao efeito visual.
- **Coleção do jogador:** serviço de perfil/inventário mantém IDs desbloqueados e a aura equipada. Não guardar estado definitivo somente em um objeto visual ou variável local da cena.
- **Aquisição:** tratar a coleta como uma concessão de recompensa e reutilizar os conceitos do Sistema de Recompensas, evitando criar moedas ou inventários paralelos.
- **Autoridade:** se a coleção for persistente ou conectada a uma economia online, validar o sorteio e registrar a concessão no serviço autoritativo; cliente apenas solicita e apresenta o resultado.
- **Apresentação:** componente visual de aura separado do modelo e dos atributos de combate do campeão, sem collider ou participação em hit detection.
- **Sincronização:** sincronizar apenas a aura equipada necessária à apresentação dos demais jogadores; a abertura de menus e o histórico completo da coleção não pertencem ao loop de combate.
- **Blockchain:** não colocar sorteio, partículas, equipar ou estado de combate em transações Solana. Integração on-chain não é requisito deste prompt.

## Decisões pendentes antes de implementação

- O que “farmar” significa: coleta por toque, sessão automática, recompensa de partida ou outra fonte?
- Duração e intervalo da coleta automática, custo e limite de tentativas.
- Probabilidades por raridade, duplicatas e destino de duplicatas.
- Regra de proteção contra azar, caso aprovada.
- Se a aura é desbloqueio permanente, temporário ou recompensa de evento.
- Quais campeões/skins aceitam cada aura e se é possível equipar mais de uma.
- Fonte autoritativa e formato de persistência do perfil.

## Critérios mínimos para uma futura POC

- Um toque inicia o fluxo sem exigir toques repetidos.
- Uma concessão é registrada uma única vez e aparece na coleção após reabrir a sessão.
- Desbloqueio e equipamento são estados distintos.
- Equipar uma aura altera somente a apresentação, sem mudar atributos ou colisões.
- Perfis e efeitos visuais não geram allocations excessivas durante a partida.
