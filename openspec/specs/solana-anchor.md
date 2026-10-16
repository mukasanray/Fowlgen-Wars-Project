# Especificação: Smart Contract Anchor na Solana Devnet

## Contexto
O smart contract de Fowlgen Wars na pasta `program/` opera exclusivamente na camada on-chain para registro de vitórias, inventário e integridade da pontuação, sem acoplamento à física de combate em tempo real.

## Especificação Técnica
1. **Identificadores Oficiais:**
   - Program ID Devnet: `81MprTi78xQvtVg9aaK4s4Cw9K62CU6PtcPYsChLNyxE`
   - Cluster: Solana Devnet (`https://api.devnet.solana.com`)
2. **Instruções Anchor:**
   - `initialize`: Inicializa a conta de estado do contador/partida.
   - `increment`: Incrementa o registro de vitórias e partidas concluídas.
3. **Validação Automatizada:**
   - Teste de integração `test_initialize.rs` executado via LiteSVM com 100% de sucesso (`cargo test --manifest-path program/Cargo.toml`).
4. **Sincronização com o Cliente Unity:**
   - Arquivo IDL: `unity/Assets/Resources/fowlgen_wars_contract.json`.
   - Classes C#: `IdlInspector.cs` e `FowlgenWarsProgram.cs`.
5. **Segurança e DevSecOps:**
   - Proibição estrita de commitar private keys ou seed phrases.
   - Verificação automática com Gitleaks em pull requests.
