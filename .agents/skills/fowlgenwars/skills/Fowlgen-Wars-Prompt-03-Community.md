# 🐔 Prompt 03 — FOWLGEN COMMUNITY

## Status e limites

Proposta de plataforma comunitária composta por Fandom, Fanarts e Fórum, com áreas transversais para criadores, eventos, perfis, notificações e moderação. Este documento organiza a visão; não afirma que esses módulos estejam implementados nem aprova toda a lista como escopo de uma única entrega.

A FOWLGEN COMMUNITY é uma experiência Web, separada do gameplay Unity/FishNet. A documentação atual atribui ao trabalho Web em `app/` o site oficial e não comprova que uma plataforma comunitária, backend, banco de dados ou autenticação compartilhada já existam. Inspecionar o estado real do app e da API antes de planejar ou codar integração.

## Visão

Criar um espaço responsivo para jogadores, fãs, artistas e criadores:

1. **Fandom:** enciclopédia com conteúdo oficial claramente separado de sugestões, teorias e contribuições comunitárias.
2. **Fanarts:** publicação e descoberta de criações com atribuição do autor e controles de interação.
3. **Fórum:** conversas, estratégias, sugestões, suporte e discussões organizadas.

Áreas transversais propostas: início, criadores, eventos/desafios, ranking comunitário, perfil, notificações e configurações.

## Regras editoriais e de participação

- Conteúdo oficial só pode ser publicado/alterado por fluxo autorizado e revisado; contribuições não se tornam cânone automaticamente.
- Sinalizar conteúdo sugerido pela comunidade, teoria ou material desatualizado.
- Uma fanart não transfere direitos autorais ao projeto. Qualquer uso promocional/comercial ou inclusão no jogo requer autorização expressa e registrada.
- Identificar conteúdo assistido por IA quando aplicável, conforme política definida.
- Votos medem interesse; não aprovam automaticamente uma sugestão para desenvolvimento.
- Humor e regionalismos não justificam assédio, discriminação ou humilhação.
- Reputação e ranking da comunidade ficam separados de XP, moedas, recompensas e poder competitivo do jogo.

## Arquitetura conceitual

- **Aplicação Web:** interface responsiva em `app/`, organizada por rotas/módulos e componentes existentes. O frontend consome APIs; não concede badges, privilégios ou direitos de moderação por estado local.
- **API/serviços:** autenticação, autorização por papel, publicação, comentários, reações, busca, denúncias, notificações e moderação devem ser fornecidos por backend real. A tecnologia e contratos atuais precisam ser descobertos; não criar um backend paralelo por suposição.
- **Domínios separados:** Fandom/edições; Fanarts/mídia; Fórum/tópicos e respostas; Identidade/perfil; Eventos/submissões; Moderação/denúncias e trilha de auditoria; Notificações. Reutilizar serviços compartilhados de identidade, mídia e moderação quando disponíveis.
- **Persistência:** entidades sugeridas pelo prompt incluem usuários/perfis/papéis, artigos/revisões, fanarts/comentários, categorias/tópicos/posts, eventos/submissões, notificações, denúncias e ações de moderação. Validar o esquema existente antes de criar migrações.
- **Mídia:** armazenar imagem/vídeo em storage apropriado, não como blobs no banco quando houver alternativa compatível. Validar tipo, tamanho, autorização, upload e acesso.
- **Moderação:** acesso privilegiado por função; operações registradas em auditoria; denúncias têm fluxo de revisão. Ferramentas de moderação automatizada são propostas a validar, não requisito presumido.
- **Segurança e privacidade:** minimização de dados, controles de acesso, proteção contra abuso/spam, política de retenção/exclusão e salvaguardas adequadas à participação de menores. Definir regras jurídicas e operacionais antes do lançamento.
- **Integração com o jogo:** futura e opcional, via contratos autenticados e consentidos. Não exigir wallet/Solana para usar a comunidade; não misturar reputação comunitária com vantagem de combate.

## Escopo sugerido por fases

### MVP proposto

Validar um recorte pequeno: identidade/perfil, artigos oficiais somente leitura, publicações de fanart e tópicos/comentários essenciais, denúncia e moderação mínima. Escolher as áreas efetivas e os fluxos de publicação após validar capacidade da API, storage e equipe.

### Expansões propostas

- Reputação e selos comunitários, eventos e desafios.
- Ranking e votação de sugestões.
- Revisões colaborativas do Fandom.
- Seguir criadores, favoritos e notificações avançadas.
- Integração autenticada com o jogo.

As versões e funcionalidades listadas no prompt são ideias para sequenciamento, não compromissos de roadmap.

## Critérios para uma futura proposta OpenSpec

- Limitar escopo a uma fatia testável e aprovada.
- Descrever papéis e permissões, conteúdo oficial versus comunitário, política de mídia/direitos e moderação.
- Especificar endpoints/modelos com base na API real e cenários de erro/abuso.
- Definir aceites observáveis para desktop/mobile, publicação, edição, denúncia, moderação e privacidade.
- Testar autenticação/autorização, uploads, rate limits, acessibilidade e fluxos em ambiente de teste.
- Rodar `openspec validate` antes da aprovação, conforme o processo do repositório.

