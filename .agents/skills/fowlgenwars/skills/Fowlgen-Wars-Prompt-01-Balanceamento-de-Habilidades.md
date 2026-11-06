# ⚔️ Prompt 01 — Sistema de balanceamento de habilidades

## Status e objetivo

Proposta de padronização para comparar e balancear habilidades e efeitos de combate. Os números do prompt original são referências iniciais, não estatísticas aprovadas nem valores presentes no jogo. Antes de implementação, inspecionar os dados, sistemas de combate e testes existentes.

O objetivo arquitetural é permitir que designers configurem habilidades sem espalhar constantes pelo código, mantendo a configuração separada da execução e do estado da partida.

## Princípios de design

- Nenhum campeão deve ser superior em todos os atributos.
- Avaliar dano, alcance, recarga, área, duração, controle, precisão e risco em conjunto.
- Habilidades poderosas precisam de limitações e contra-jogo legível.
- Ataques de área e controle devem permitir reação/escape quando aplicável.
- Bots devem obedecer às mesmas regras de combate que jogadores.
- Raridade de item, nível de conta ou pagamento não concede vantagem competitiva automática.
- Medir resultados de partidas de até 180 segundos; não apresentar hipótese como balanceamento validado.

## Dados de uma habilidade

O prompt sugere registrar, conforme aplicável:

- ID estável, nome, categoria/slot e personagem associado.
- Tipo de dano e valores de dano.
- Alcance de ativação, raio de área e largura de linha como grandezas distintas.
- Cooldown, duração e velocidade de projétil/deslocamento.
- Número máximo de alvos e regras de colisão.
- Efeitos de controle e suas regras de acumulação/substituição.
- Escalonamento com atributos do personagem.
- Precisão, indicador visual, animação, áudio e VFX.

Nem todos os campos fazem sentido para todo tipo de habilidade. Usar dados tipados/validados e defaults explícitos, não um modelo universal cheio de campos irrelevantes.

### Controles do personagem

O projeto define os slots de habilidade como **Skill T, Skill G, Skill Y e Skill H**. Usar esses nomes diretamente na configuração, interface e documentação de controles; não converter para Q/W/E/R. As categorias funcionais (ataque, defesa, especial, ultimate, mobilidade) são dimensões distintas do nome do slot e devem ser configuradas sem presumir um mapeamento até confirmação.

## Referências numéricas recebidas

Para prototipagem, o prompt sugere HP de referência 1.000, faixas de dano de 20–300, distâncias e recargas por tipo, queda de dano em área (100% até 50% do raio, 75% entre 50–80%, 50% entre 80–100%) e exemplos de habilidades. **Tudo isso é ilustrativo e pendente de validação** contra a escala real, arena, velocidade, hitboxes e duração de combate existentes.

Habilidades contínuas/área devem ser avaliadas pelo dano total e pelos alvos atingíveis ao longo da duração, não só pelo dano de um tick ou impacto. Controle, mobilidade e utilidade também precisam ser incluídos na avaliação de poder.

Os exemplos de Galia, Mago/Cientista e Hunter/Assassino não estabelecem catálogo canônico, poderes oficiais, espécie, classe ou estatísticas validadas. Não copiar imagens de referência como assets; não foram incluídas nem tiveram licenças verificadas.

## Arquitetura alinhada ao projeto

- **Definições de design:** `AbilityDefinition`/`AbilityStats` como configuração de conteúdo (por exemplo, ScriptableObject), com ID estável e validação no Inspector. Evitar valores duplicados ou magic numbers em scripts de personagem.
- **Identidade de personagem:** definições referenciam os dados e capacidades existentes do campeão. Manter a separação de espécie, clã/civilização, tema, classe/função e rota.
- **Execução:** componentes/serviços de combate existentes executam habilidades e consultam a definição; `DamageCalculator`, controle de cooldown, colisão e efeitos de status só devem ser criados se não houver equivalentes já implementados.
- **Estado de partida:** cooldowns, alvos, acertos e efeitos ativos pertencem à simulação da partida, não aos assets imutáveis de definição.
- **UI:** HUD/View passiva exibe dados e emite intenção de ativação; Presenter/serviço valida e encaminha a ação. A View não aplica dano nem controla autoridade de rede.
- **Multiplayer:** em partida conectada, autoridade de servidor valida ativação, cooldown, alcance, colisão, dano e efeito. Replicar resultado necessário à apresentação; cliente não decide resultado competitivo.
- **Telemetria:** coletar uso, taxa de acerto, dano efetivo/por minuto, alvos atingidos, eliminações, sobrevivência após o efeito e oportunidades de reação. Tratar os dados de acordo com privacidade e telemetria existentes.
- **Escopo:** um sistema configurável de habilidades pode ser base compartilhada; não implementar de uma vez balanceamento de armas, torres, tropas, bots, armadilhas e todos os efeitos. Cada domínio requer compatibilidade, regras e aceite próprios.
- **Blockchain:** combate em tempo real, cooldowns, colisões e efeitos permanecem off-chain; não usar transações Solana para ações instantâneas.

## Decisões e validações antes de balancear

- Confirmar escala atual de HP, dano, distância e tempo de combate.
- Confirmar catálogo real de campeões, habilidades, categorias e slots.
- Confirmar componentes já existentes para dano, cooldown, hit detection, status e rede.
- Aprovar limites de controle/CC, regras de acumulação, mitigação, esquiva e interrupção.
- Confirmar como medir precisão e dano efetivo para ataques contínuos e em área.
- Comparar testes espelhados, classes e resultados em partidas completas; alterar poucos parâmetros por experimento e preservar rollback.

## POC recomendada

Após inspeção, selecionar uma habilidade real existente, migrar seus dados para uma definição configurável sem alterar o comportamento, validar no Inspector e cobrir ativação, cooldown, colisão, dano/controle, término e resultado online se houver ambiente de rede. Só então expandir para outras habilidades.

