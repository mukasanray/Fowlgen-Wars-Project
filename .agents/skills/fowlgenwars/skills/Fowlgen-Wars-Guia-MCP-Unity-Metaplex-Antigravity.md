# FOWLGEN WARS — Guia de Integração: MCP, Skills e AI Agents (Unity & Metaplex no Antigravity)

Este documento consolida as referências de Inteligência Artificial, **Model Context Protocol (MCP)**, **Unity MCP**, **Metaplex Agent Skills** e **Solana Program Examples**, fornecendo um tutorial prático de configuração e uso no ambiente de desenvolvimento do **Antigravity (IDE 2.0)** e **Unity**.

---

## 📑 Índice
1. [Visão Geral de MCP, Skills e Agents no FOWLGEN WARS](#1-visão-geral)
2. [Unity MCP: Solução Gratuita (Open Source) vs Oficial](#2-unity-mcp)
3. [Metaplex Agent Skills & Ecossistema Solana](#3-metaplex-agent-skills--solana)
4. [Tutorial Passo a Passo: Configuração no Antigravity](#4-tutorial-de-configuração-no-antigravity)
5. [Prompts Prontos para Uso no Dia a Dia da Equipe](#5-prompts-prontos-para-o-time)
6. [Regras de Segurança e Boas Práticas](#6-regras-de-segurança)

---

## 🌐 1. Visão Geral

O **Model Context Protocol (MCP)** é um padrão aberto que conecta agentes de IA (como o Antigravity) diretamente a ferramentas externas, IDEs, motores de jogos (Unity) e blockchains (Solana/Metaplex).

```text
┌────────────────────────────────────────────────────────┐
│           ANTIGRAVITY 2.0 (Agente IA / IDE)           │
└──────────────────────────┬─────────────────────────────┘
                           │ Protocolo MCP (JSON-RPC)
            ┌──────────────┴──────────────┐
            ▼                             ▼
   🎮 UNITY MCP SERVER           ⛓️ METAPLEX / SOLANA MCP
   • Inspeciona GameObjects       • Mint de NFTs Metaplex Core
   • Lê Console & Erros C#       • Consulta de Coleções & DAS API
   • Executa Testes Unity        • Gestão de Metadados On-Chain
   • Controla Cenas & Prefabs    • Validação com Program Examples
```

---

## 🎮 2. Unity MCP: Soluções e Capacidades

### 2.1 O Projeto Open Source: `ivanmurzak/unity-mcp`
* **Repositório:** [https://github.com/ivanmurzak/unity-mcp](https://github.com/ivanmurzak/unity-mcp)
* **Licença:** **100% Gratuito e Open-Source (Licença MIT)**.
* **Sem custos:** Todas as funcionalidades de inspeção, execução e manipulação são totalmente gratuitas, sem planos pagos ou limites artificiais.

#### Principais Funcionalidades do `unity-mcp`:
| Funcionalidade | Descrição | Utilidade no FOWLGEN WARS |
| :--- | :--- | :--- |
| **Console Logs** | Lê erros, warnings e logs da Unity em tempo real | Depuração imediata de scripts C# pelo agente |
| **Hierarchy & Scene** | Lista GameObjects, tags, layers e componentes | Análise do mapa de 3 rotas e torres |
| **Component Inspector** | Lê e altera propriedades de componentes | Ajuste de colliders, rigidbody e scripts |
| **Unity Test Runner** | Executa testes automatizados (UTF / NUnit) | Validação técnica contínua (QA de física) |
| **Asset & Prefab Management** | Cria, edita e instancia prefabs e materiais | Automação de setup de minions e bombas |
| **Menu Items & Editor Scripts** | Invoca comandos do menu da Unity | Builds headless e triggers de geração de assets |

### 2.2 Unity AI Assistant Oficial (`com.unity.ai.assistant` - Unity 6)
* **Documentação:** [Unity AI MCP Overview](https://docs.unity3d.com/Packages/com.unity.ai.assistant@2.0/manual/unity-mcp-overview.html)
* **Blog:** [Unity AI MCP - How to get started](https://unity.com/pt/blog/unity-ai-mcp-how-to-get-started)
* O pacote oficial da Unity introduz suporte ao MCP a partir do Unity 6. Contudo, para projetos focados em custo zero e total customização de código local, o `ivanmurzak/unity-mcp` oferece flexibilidade direta e compatibilidade com UPM via Git.

---

## ⛓️ 3. Metaplex Agent Skills & Solana

### 3.1 O que é Metaplex Agent Skills?
* **Documentação Oficial:** [https://www.metaplex.com/docs/agents/skill](https://www.metaplex.com/docs/agents/skill)
* **Portal Metaplex:** [https://www.metaplex.com/docs](https://www.metaplex.com/docs)
* **Solana Program Examples:** [https://github.com/solana-foundation/program-examples](https://github.com/solana-foundation/program-examples)

O **Metaplex Agent Skill** (integrado via Solana Agent Kit) dota o agente de IA com habilidades autônomas para executar transações e gerenciar ativos digitais no padrão **Metaplex Core** (o padrão moderno e econômico para NFTs na Solana).

#### Ações disponíveis para o Agente:
1. `create_core_collection`: Criar coleções oficiais de personagens FOWLGEN.
2. `create_core_asset`: Cunhar (mint) uma galinha guerreira com atributos determinísticos.
3. `fetch_asset`: Consultar metadados e status de ownership via DAS API.
4. `transfer_asset` e `burn_asset`: Mecânicas de marketplace e queima para evolução.
5. `add_plugin`: Configurar plugins do Metaplex Core (atributos imutáveis, royalties e freeze).

---

## 🛠️ 4. Tutorial de Configuração no Antigravity

### Passo 1 — Configurar o Unity MCP no Projeto Unity
1. Abra o projeto Unity em `unity/` (ou abra o arquivo `unity/Packages/manifest.json`).
2. Adicione a dependência do pacote `ivanmurzak/unity-mcp` via Git URL no UPM (Unity Package Manager):
   ```json
   "dependencies": {
     "com.ivanmurzak.unity-mcp": "https://github.com/ivanmurzak/unity-mcp.git?path=/Packages/com.ivanmurzak.unity-mcp",
     ...
   }
   ```
3. Abra o Unity Editor. Um servidor MCP local em WebSocket/IPC iniciará automaticamente (porta padrão `8080` ou via stdio conforme configurado).

---

### Passo 2 — Configurar os MCP Servers no Antigravity

No Antigravity, as configurações de servidores MCP são definidas no arquivo de configuração de customização:
* **Local do Projeto:** `.agents/mcp_config.json`
* **Local Global do Usuário:** `C:\Users\marco\.gemini\config\mcp_config.json`

Crie ou edite o arquivo `mcp_config.json` com a estrutura abaixo:

```json
{
  "mcpServers": {
    "unity": {
      "command": "node",
      "args": [
        "C:/caminho/para/unity-mcp/build/index.js"
      ],
      "env": {
        "UNITY_PORT": "8080"
      }
    },
    "solana-metaplex": {
      "command": "npx",
      "args": [
        "-y",
        "@solana/agent-kit-mcp"
      ],
      "env": {
        "SOLANA_NETWORK": "devnet",
        "RPC_URL": "https://api.devnet.solana.com",
        "KEYPAIR_PATH": "C:/Users/marco/.config/solana/id.json"
      }
    }
  }
}
```

---

## 💬 5. Prompts Prontos para o Time

Aqui estão os templates de prompts otimizados para usar no chat do **Antigravity**:

### Prompt 1: Depuração em Tempo Real com Unity MCP
```text
Atue como meu assistente técnico Unity. 
Conecte-se ao servidor Unity MCP e:
1. Inspecione o Console da Unity e me liste os últimos 5 erros ou avisos ativos.
2. Identifique o script C# e a linha exata que está causando a falha.
3. Proponha e aplique a correção respeitando os padrões de Clean Code do FOWLGEN WARS.
```

### Prompt 2: Validação de Cena e GameObjects do Mini-MOBA
```text
Usando a ferramenta de Unity MCP:
1. Liste a hierarquia da cena ativa e encontre os GameObjects sob o mapa da Arena.
2. Verifique se as 18 torres e as 3 rotas possuem BoxCollider e a Layer correta configurada.
3. Se algum objeto estiver sem colisor, adicione ou ajuste o componente conforme Folwgen-Wars-Terreno-Mapa-3rota-3torres-cada.md.
```

### Prompt 3: Mint de NFT Metaplex Core via Agent Skill
```text
Atue como o desenvolvedor Web3 Solana do projeto FOWLGEN WARS.
Utilizando as referências do Metaplex Agent Skill e os dados de Fowlgen-Wars-Roadmap-de-Pocs.md (POC 06):
1. Monte o schema de metadados para o personagem 'FOWLGEN #001' (Classe: Warrior, Espécie: Rooster, Raridade: Common).
2. Execute o script de criação do NFT Metaplex Core na Devnet apontando para a coleção oficial.
3. Registre o Asset ID gerado e a URI de metadados.
```

### Prompt 4: Consulta de Exemplos Oficiais da Solana Foundation
```text
Consulte o repositório solana-foundation/program-examples e analise o exemplo de 'basics/pda' e 'tokens/create-token'.
Adapte a estrutura para o nosso smart contract Anchor em 'program/programs/fowlgen_wars_contract/src/state/fowlgendata.rs', garantindo o correto cálculo de espaço de conta e discriminator Anchor.
```

---

## 🔒 6. Regras de Segurança e Boas Práticas (Governança Claude.md)

1. **Proteção Pétrea de Chaves Privadas:**
   * Nunca inclua chaves privadas, frases mnemônicas ou seed phrases dentro de prompts, arquivos `.json` comitados no Git ou variáveis de ambiente compartilhadas.
   * O MCP da Solana deve apontar exclusivamente para carteiras de teste locais na **Devnet**.
2. **Fair Play & Desacoplamento:**
   * O Unity MCP atua na automação da IDE e QA. Ele não deve ser incluído na build final de produção do jogo (Android APK).
   * O Metaplex Agent Skills é uma ferramenta de desenvolvimento e automação de deploy; as transações dos jogadores dentro do jogo continuam sendo assinadas pela wallet do usuário via Solana Unity SDK.
3. **Validação Obrigatória:**
   * Toda ação automatizada de criação ou modificação de arquivos de cena ou scripts C# deve ser validada executando `git status` e `git diff` antes de comitar.
