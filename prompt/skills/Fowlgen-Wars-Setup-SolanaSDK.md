# Setup Solana Unity SDK - Fowlgen Wars

Para garantir a compatibilidade do projeto com o Unity 6 (6000.x) e evitar erros de compilação relacionados a códigos obsoletos de bibliotecas internas, o **Solana Unity SDK** foi configurado como um pacote local customizado ("embedded package").

## Versão Utilizada
- **Nome:** Solana SDK (Magicblock)
- **Versão base:** 1.3.0
- **Instalação:** Pasta física `Packages/com.solana.unity_sdk` (referenciada como `file:com.solana.unity_sdk` no `manifest.json`).

## Atualizações e Correções Realizadas
Ao importar a versão original diretamente do repositório Git, o Unity 6 acusa erros fatais de compilação (`CS0619`) porque as classes de interface gráfica `TreeView` se tornaram obsoletas.

Para corrigir isso e fazer a Solana rodar no Fowlgen Wars:
1. O pacote foi extraído do diretório temporário (`PackageCache`) e movido fisicamente para a pasta `Packages/com.solana.unity_sdk`.
2. Foram excluídos os seguintes scripts de debug do `UniTask` que causavam o erro no Unity 6:
   - `Runtime/Plugins/UniTask/Editor/UniTaskTrackerTreeView.cs`
   - `Runtime/Plugins/UniTask/Editor/UniTaskTrackerWindow.cs`
3. O arquivo `manifest.json` foi atualizado para ler o pacote modificado localmente e não baixar mais a versão defeituosa do github.

## Alertas Restantes (Warnings)
É normal que a aba "Console" apresente alertas amarelos (Warnings) referentes a arquivos internos dessa biblioteca (ex: `CS8632` sobre nullables, `UAC0023` sobre BinaryFormatter, etc). 
- **Esses alertas não quebram o jogo e não impedem o build.**
- Você pode ignorá-los ou ocultá-los no Console (desativando o ícone do triângulo amarelo). 
- Não modifique os arquivos da biblioteca para corrigir warnings para evitar problemas de compatibilidade futuros.

## Regras para Scripts Customizados da Equipe
Ao programar a lógica da Solana (como no arquivo `SolanaReward.cs`), atente-se às seguintes regras das versões atuais das bibliotecas:
1. **Buscar Blockhash:** Use a função com 'H' maiúsculo: `await Web3.Rpc.GetLatestBlockHashAsync();`
2. **Instruções da Transação:** A propriedade `Instructions` da `Transaction` exige uma Lista, e não um Array.
   - ❌ Errado: `Instructions = new[] { instrucao }`
   - ✅ Correto: `Instructions = new System.Collections.Generic.List<TransactionInstruction> { instrucao }`

## Instruções em caso de reimportação
Se precisar atualizar o SDK no futuro, **nunca** adicione a URL do Git diretamente no Package Manager sem antes garantir que os desenvolvedores do repositório original (Magicblock) já corrigiram os erros de `TreeView` para a versão Unity 6. Caso contrário, o projeto voltará a não compilar.
