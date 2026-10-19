# Especificação: Multiplayer Híbrido FishNet (Camada Off-Chain)

## Contexto
O multiplayer em tempo real do Fowlgen Wars utiliza a arquitetura FishNet desacoplada da blockchain, garantindo latência zero para movimentação, dano e colisão.

## Especificação Técnica
1. **Topologia:**
   - Modo 1v1 Local: Host & Client com transporte Tugboat.
   - Modo Batalha Rápida (Solo vs IA): Jogo local offline na BattleArena para garantir experiência aos jurados sem depender de pareamento.
2. **Sincronização de Estado:**
   - HP e dano sincronizados através de `SyncVar` e chamadas `CmdTakeDamage` -> `TakeDamage`.
   - Evento `OnStructureDestroyed` sincronizado ao destruir o Galinheiro adversário.
3. **Servidor Dedicado (Fase 4 / Backlog):**
   - Container Linux headless empacotando o executável Unity para autoridade de partida anti-cheat em Kubernetes/Minikube na porta UDP 7770.
