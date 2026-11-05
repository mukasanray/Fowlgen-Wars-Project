# Relatório Analítico: O Instalador (`install.sh`) e o `prompt/Claude.md`

Este documento apresenta a auditoria técnica e situacional do `install.sh` em relação ao planejamento estratégico e tático da **G5B Studios**, guiado pelo documento `prompt/Claude.md`.

---

## ✅ O Que Já Foi Desenvolvido e Corrigido (Concluído)

De acordo com as diretivas de DevSecOps e Arquitetura Híbrida do `Claude.md`:

1. **Migração para Kubernetes (Fase 4 K8s)**: O instalador superou a dependência antiga e engessada do Docker Compose e agora automatiza deploys no Minikube (ambiente local) e no K3s (ambiente de produção VPS).
2. **Gerenciamento Seguro de Chaves (Anti-Leak) e Gitleaks**: O script encapsula credenciais em **Kubernetes Secrets** e roda escaneamento profissional nativo com o **Gitleaks** via fluxo Pré-Commit (Opção 6 -> 5), solicitando instalação caso ausente e prevenindo vazamentos.
3. **Módulos Independentes (Desacoplamento)**: A trilha Blockchain (Anchor) opera desvinculada do Game Server.
4. **Identidade Visual Abrasileirada**: Menu formatado com a paleta autêntica verde/amarelo/azul.
5. **Prevenção de Execuções Acidentais**: A Primeira Instalação (Opção 1) agora exige expressa confirmação `(S/n)` antes de modificar o sistema, protegendo a máquina de execuções inadvertidas.
6. **Detector de Conflitos (Limpador de Portas)**: O instalador verifica proativamente se portas (5432, 8080, 7770) estão em uso por contêineres Docker antigos e permite pará-los antes de lançar o Minikube, eliminando conflitos silenciosos.
7. **Fim de Senhas Hardcoded no Dev**: Para o deploy do Minikube, o script gera automaticamente strings randômicas seguras via `/dev/urandom` para Banco de Dados (12 bytes) e JWT (32 bytes), permitindo que o usuário as aceite com `[Enter]` ou redefina, erradicando senhas fixas previsíveis no código.
8. **Build Automático do Dedicated Server Unity**: Inserida automação via CLI do Unity (`-buildLinux64Player`) para compilar o Servidor Headless localmente em background, logo antes de empacotar o contêiner do FishNet no Minikube.
9. **Testes de Integração Unity (PlayMode)**: Adicionado suporte ao Test Runner da Unity via linha de comando no menu `[6] Executar Testes`, resolvendo a falta de cobertura de QA (Movimentação, Colisões, UI e Áudio).
10. **Segurança no Setup (Default Localnet)**: O fluxo de "Primeira Instalação" foi reconfigurado para usar a `Localnet` como rede padrão de desenvolvimento na Solana CLI, isolando a máquina de testes públicos antes da etapa oficial de deploy.
11. **Correção de Paths do Build Unity**: Sincronização rigorosa de diretórios entre o `install.sh` e o `Dockerfile` do Server (`build/LinuxServer/`), impedindo falhas na cópia de artefatos.
12. **Estabilidade de Build da API**: Inserção nativa de inicialização de submódulos do Git (`git submodule update --init`) para garantir a presença do `Onix.Framework` antes da compilação.
13. **Kubernetes Storage Dinâmico (PVC)**: Remoção de `storageClassName` rígido (`local-path`) no banco Postgres, forçando o Kubernetes a herdar magicamente a classe correta de cada ambiente (Minikube ou K3s).
14. **Política de Imagem Híbrida**: Configuração das imagens com `imagePullPolicy: IfNotPresent`, assegurando que o cluster local use o cache recém-compilado sem tentar downloads erráticos.
15. **Instalador Gitleaks Resiliente**: O `curl` corrompido que retornava Erro 404 foi substituído por uma consulta inteligente à API do GitHub Releases para extrair, baixar e instalar dinamicamente a versão mais recente do binário de vazamento.

---

## ❌ O Que Tem de Erros e Fragilidades Atuais

*(Nenhum erro de infraestrutura primária. As três grandes fragilidades relatadas na última análise — Senhas Fixas, Conflito de Portas e Scan Superficial — foram todas resolvidas e incorporadas na branch principal do script nesta sessão.)*

---

## ⏳ O Que Está Pendente

1. **Gitleaks Ativo (Git Hooks)**: Apesar da verificação já existir via comando de menu interativo, ainda falta automatizar a injeção nativa desse binário dentro do `.git/hooks/pre-commit` para que qualquer dev que ignore o menu também seja bloqueado fisicamente no terminal.

---

## 🚀 Próximas Melhorias (Roadmap do Instalador)

Para alinhar 100% o `install.sh` ao prazo do Hackathon:

- **Implementar Hooks Nativos de Segurança**: Atualizar a Opção de Primeira Instalação para que ela injete silenciosamente o *hook pre-commit* na pasta oculta `.git`.
- **Setup e Sync Rápido de Assets Unity**: Integrar um comando que acione a Unity CLI em background para importar os grandes pacotes da cena de POC, encurtando o onboarding de desenvolvedores Juniores que sofrem com lentidão na primeira abertura do projeto visual.
