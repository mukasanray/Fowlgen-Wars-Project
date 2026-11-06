# 🌿 Chuva de legumes — evento ambiental

## Status e alinhamento arquitetural

Proposta de evento para partida de 180 segundos. Valores e classes abaixo são parâmetros conceituais, não balanceamento aprovado ou implementação existente.

- Consumir o relógio e o estado de partida existentes; não criar um cronômetro paralelo.
- Integrar dano e cura por meio do componente/serviço de vida já existente; confirmar limites de cura e regras de equipe antes de alterar HP.
- Separar configuração (`VegetableRainConfig`), simulação/estado do legume e apresentação (aviso/VFX). O pooling deve reutilizar a infraestrutura existente quando disponível.
- Em partidas conectadas, spawn, colisão, dano, coleta e limite de cura exigem autoridade de servidor. Verificar a integração de rede antes de afirmar sincronização validada.
- O evento não altera regras de rota, torres nem geometria da arena; posições de spawn respeitam colisores e limites reais do mapa.
- Os intervalos, percentuais e durações sugeridos são pontos de partida para teste e devem ser ajustados à escala real do HP e do combate.

## Objetivo
Implementar em Unity C# um evento ambiental chamado `Vegetable Rain`, uma chuva progressiva de legumes integrada às partidas de 180 segundos.

## Regras da partida
1. A partida dura 180 segundos.
2. Entre 0 e 60 segundos, a chuva é leve.
3. Entre 60 e 120 segundos, a frequência aumenta progressivamente.
4. Entre 120 e 180 segundos, a chuva alcança intensidade máxima.
5. Os legumes surgem acima da área jogável, respeitando os limites da arena.
6. Cada legume possui trajetória, velocidade, colisão e estado próprios.
7. Um impacto direto em um campeão aplica dano uma única vez.
8. Após aterrissar sem atingir um campeão, o legume pode virar coletável.
9. Ao ser coletado, recupera HP em pequena quantidade.
10. Cada jogador possui limite de cura por evento.
11. O legume desaparece após impacto, coleta ou fim do tempo de vida.
12. A chuva termina com o fim da partida.

## Parâmetros iniciais sugeridos
- Duração: 180s
- Velocidade de queda inicial: 2–3 unidades por segundo
- Dano de impacto: 2% do HP máximo
- Cura por coleta: 3% do HP máximo
- Limite de cura: 12% do HP máximo por jogador por evento
- Tempo máximo no chão: 4–6s
- Intervalo inicial de surgimento: 3–4s
- Intervalo final: 0,8–1,5s
- Aviso visual antes do impacto: 0,5–0,8s

## Arquitetura sugerida
- `VegetableRainManager`: controla tempo, fases e frequência
- `VegetableProjectile`: controla queda e impacto
- `VegetablePickup`: controla coleta e expiração
- `HealthComponent`: aplica dano e cura respeitando limites do jogo
- `VegetableRainConfig`: armazena parâmetros configuráveis
- `ObjectPool`: reutiliza objetos para reduzir alocações

## Regras técnicas
- Utilizar pooling para evitar `Instantiate` e `Destroy` excessivos
- Garantir que cada legume só cause dano ou seja coletado uma vez
- Aplicar colisões filtradas para reconhecer campeões, cenário e chão
- Evitar surgimento em paredes ou diretamente sobre o jogador
- Sincronizar impactos e coletas por autoridade do servidor
- Desativar todos os objetos ao fim da partida
- Expor parâmetros no Inspector
- Implementar testes para impacto, cura, expiração, limite de cura e encerramento

## Critérios de aceitação
- O sistema começa com poucos legumes e aumenta gradualmente
- Impactos causam dano limitado
- Coletas restauram HP limitado
- Não prejudica significativamente o desempenho
- Resultados permanecem consistentes em partidas online

## Uso do prompt
Este documento serve como base técnica para sprint de gameplay ambiental e eventos de partida em Unity.
