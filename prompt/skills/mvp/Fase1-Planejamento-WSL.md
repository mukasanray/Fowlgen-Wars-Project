# Planejamento Fase 1: Autenticação Off-Chain (Transição para WSL/Ubuntu)

Este documento guarda o registro do planejamento estratégico da **Fase 1 - Autenticação Off-Chain e Banco de Dados**, focado na integração entre Unity, FishNet e Solana, e orienta o setup ideal de ambiente.

## Arquitetura de Ambiente Recomendada (Híbrida)

Para o Fowlgen Wars (Unity + FishNet + Solana + Docker), a configuração de ambiente mais performática e estável é:

1. **Windows (Nativo):**
   - **Uso:** Editor da Unity (Desenvolvimento C#, Client, UI, testes de cena).
   - **Motivo:** Melhor performance e integração gráfica.
2. **Ubuntu (via WSL2 no Windows):**
   - **Uso:** Docker, Banco de Dados (PostgreSQL), Servidor Dedicado FishNet Headless, Scripts CLI (`install.sh`), e futuramente o desenvolvimento Web3 com Rust/Anchor/Solana.
   - **Motivo:** O ecossistema blockchain e os containers rodam nativamente, eliminando dezenas de erros de compilação comuns no Windows.

---

## Estratégia de Autenticação (Fase 1)

O objetivo é autenticar o jogador via sua carteira Phantom/Solflare off-chain, garantindo segurança sem custo de transação (gas), através de **Assinatura de Mensagem**.

### O Fluxo:
1. **Banco de Dados:** Um container PostgreSQL (rodando no WSL2) guardará a tabela `players` (com `wallet_address` e `nickname`).
2. **Desafio (Nonce):** O Unity Client solicita um login, o Servidor FishNet gera um texto aleatório (Nonce) e o envia de volta.
3. **Assinatura:** O jogador usa sua carteira (via Solana Unity SDK) para assinar esse texto. **(Sem transação on-chain)**.
4. **Validação:** O Unity envia a assinatura para o Servidor FishNet, que valida matematicamente a assinatura Ed25519 em C#.
5. **Autorização:** Sendo válida, o servidor conecta o banco, verifica/cria a conta e libera a conexão de rede para o jogador.

---

## Próximos Passos (Após abrir no WSL/Ubuntu)

Quando o ambiente WSL estiver pronto, devemos iniciar pela criação de:

1. **`docker-compose.yml`**: Para iniciar o PostgreSQL (na porta 5432).
2. **Scripts C# Unity**:
   - `ServerAuthManager.cs` (Servidor FishNet: Gera nonce e checa assinatura).
   - `ClientAuthManager.cs` (Cliente Unity: Pede assinatura da carteira e envia ao server).
