# 🐔 Conceito medieval + mini-MOBA

## Status e alinhamento arquitetural

Este documento registra visão de produto e tema, não aprovação de todas as raças, classes ou mecânicas sugeridas.

- A arena documentada possui três rotas e 18 torres. “Mapa minúsculo” é uma diretriz de ritmo, não autorização para alterar a geometria existente.
- A documentação de arenas prevê uma geometria competitiva compartilhada com temas visuais, incluindo medieval. Tratar medieval como tema até que o Product Owner aprove substituir a identidade global.
- Separar espécie/povo, cultura/civilização, tema, classe/função e rota conforme [`11_fowlgenwars_hierarquia_de_personagens.md`](11_fowlgenwars_hierarquia_de_personagens.md). A lista original mistura essas categorias e requer classificação/aprovação antes de virar conteúdo.
- “JOG” é preservado como texto original; a nomenclatura canônica documentada usa JUNGLE/HUNTER. Confirmar antes de padronizar termos em UI ou dados.
- Implementação futura deve consumir definições de personagens e configurações já existentes, não duplicar classes/rotas em código nem introduzir conteúdo de outros jogos.

## Contexto
"Precisamos que o jogo chicken Wars seja feito no período medieval, pois assim existe um vasto leque de opções."

## Direção principal
- Mundo medieval como base visual e narrativa
- Extrair o melhor de vários jogos sem misturar tudo em um único produto
- Usar classes por função e povos/raças para dar variedade ao elenco

## Funções de combate
- TOP: Tanques colossais
- MID: Magos e assassinos
- JOG: Selvagens caçadores
- SUP: Protetores
- ADC: Atiradores

## Raças e povos sugeridos
- Druidas
- Elfos
- Anões
- Goblins
- Ogros
- Orks
- Trolls
- Ciclopes
- Vikings
- Apaches
- Templários
- Romanos
- Africanos
- Egípcios
- Árabes
- Chineses
- Samurais
- Gauleses
- Indianos
- Dragonoides

## Conceito de mapa e partida
- Mapa enxuto para partidas rápidas
- A partida não pode demorar mais do que o Clash
- O Nexus é o galinheiro e precisa ser defendido a todo custo
- O ritmo deve ser intenso, com objetivos claros e pressão constante

## Conclusão de design
Este prompt funciona como base para um mini-MOBA competitivo com foco em ritmo rápido, variedade de classes e identidade medieval.

## Próximo passo de desenvolvimento

Validar tema, nomenclatura e categorias com o Product Owner; depois alinhar a visão às definições atuais de arena, personagens e partida antes de abrir uma proposta OpenSpec.
