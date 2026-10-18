# Feature: fowlgen-wars-sistema-de-montarias-entrada-rapida-e-inicio-de-partida

## Title
### FOWLGEN WARS — Sistema de Montarias, Entrada Rápida e Início de Partida

## Summary
### FOWLGEN WARS — Sistema de Montarias, Entrada Rápida e Início de Partida

A proposta é criar um fluxo único para o jogador escolher sua montaria, entrar rapidamente em combate e começar a partida com uma apresentação cinematográfica dos campeões saindo do Galinheiro.

Há um ponto importante: podemos usar bots para preencher partidas rapidamente, mas eles devem ser identificados como bots, sem fingir ser jogadores humanos reais. Podemos dar a eles nomes fictícios, estilos de jogo, reações e personalidades naturais. A prioridade de matchmaking deve favorecer o jogador real sem criar uma fila falsa ou prejudicar a competitividade.

### 1\. Fluxo completo do jogador

Etapa 1 — Coleção de personagens

O jogador escolhe seu campeão, visual e uma montaria disponível.

Etapa 2 — Encontrar partida

Ao tocar em “JOGAR”, o sistema procura adversários reais imediatamente e, se necessário, prepara bots para completar a partida.

Etapa 3 — Entrada na arena

Os campeões aparecem dentro do Galinheiro, montam em suas montarias e começam a se deslocar para suas rotas.

Etapa 4 — Contagem regressiva

Todos se posicionam. O contador marca 3, 2, 1. O galo canta e a partida é liberada.

Meta de experiência: procurar partida imediatamente e tentar começar em até 3 segundos usando bots quando necessário. Isso é um objetivo de produto, não uma garantia técnica universal: conexão, latência e disponibilidade de servidores podem afetar o tempo real.

### 2\. Sistema de seleção de montarias

Na coleção, o jogador escolhe uma montaria desbloqueada. A seleção fica salva no perfil e é carregada quando a partida começa.

### Protótipo de seleção

Javali Turbo

Arrancada agressiva

SELECIONADA

Avestruz Veloz

Visual de velocidade

Bode Blindado

Visual pesado

Dragão de Quintal

Montaria lendária

Montaria escolhida: Javali Turbo

Demonstração de interface. A seleção ainda não está conectada ao jogo.

Para manter o equilíbrio competitivo, as montarias devem ser cosméticas no MVP. Se futuramente concederem habilidades, será necessário balancear suas vantagens e desvantagens.

### 3\. Código-base em Unity C#

Abaixo está uma estrutura inicial para a equipe implementar as etapas. Os componentes visuais, animações, áudio e conexão com um servidor real precisam ser integrados ao projeto.

### A. Dados da montaria

csharp
using UnityEngine;

[CreateAssetMenu(
    fileName = "Mount",
    menuName = "FOWLGEN WARS/Mount"
)]
public class MountData : ScriptableObject
{
    public string mountId;
    public string displayName;
    public GameObject prefab;
    public bool unlocked;
}


### B. Seleção da montaria

csharp
using UnityEngine;

public class MountSelection : MonoBehaviour
{
    public MountData SelectedMount { get; private set; }

    public void SelectMount(MountData mount)
    {
        if (mount == null || !mount.unlocked)
            return;

        SelectedMount = mount;

        PlayerPrefs.SetString(
            "SelectedMountId",
            mount.mountId
        );

        PlayerPrefs.Save();
    }
}


No jogo final, a lista de montarias desbloqueadas e a seleção válida devem ser verificadas pelo servidor quando houver economia online.

### C. Matchmaking rápido com prioridade para jogadores reais

A lógica deve procurar uma partida real imediatamente. Se não houver jogadores disponíveis dentro da janela definida, o sistema poderá completar a equipe adversária com bots identificados como IA.

csharp
using System;
using System.Collections.Generic;
using UnityEngine;

public enum MatchState
{
    Searching,
    Ready,
    Starting,
    InProgress,
    Cancelled
}

public class QuickMatchController : MonoBehaviour
{
    [SerializeField] private float targetWaitSeconds = 3f;

    public MatchState State { get; private set; }

    public event Action OnMatchReady;
    public event Action OnSearchStarted;

    private float searchStartedAt;
    private bool requestPending;

    public void StartSearch()
    {
        if (requestPending)
            return;

        requestPending = true;
        State = MatchState.Searching;
        searchStartedAt = Time.realtimeSinceStartup;

        OnSearchStarted?.Invoke();

        // TODO:
        // Enviar pedido ao servidor de matchmaking.
        // A fila deve ordenar jogadores reais elegíveis
        // por prioridade, região, latência e compatibilidade.
        // Não criar um resultado local fingindo que houve
        // uma conexão com outro jogador.
    }

    public void OnServerMatchFound()
    {
        if (!requestPending)
            return;

        State = MatchState.Ready;
        requestPending = false;
        OnMatchReady?.Invoke();
    }

    public bool ShouldRequestBotFill()
    {
        return requestPending
            && Time.realtimeSinceStartup - searchStartedAt
               >= targetWaitSeconds;
    }

    public void OnServerBotMatchReady()
    {
        if (!requestPending)
            return;

        // O servidor confirmou uma partida com bots.
        State = MatchState.Ready;
        requestPending = false;
        OnMatchReady?.Invoke();
    }

    public void CancelSearch()
    {
        if (!requestPending)
            return;

        requestPending = false;
        State = MatchState.Cancelled;

        // TODO: Cancelar também no servidor.
    }
}


Importante: ShouldRequestBotFill() apenas indica quando solicitar o preenchimento com bots. Não cria uma partida automaticamente. O servidor precisa confirmar os participantes, evitar partidas duplicadas e validar o resultado. O prazo de 3 segundos é uma meta de resposta, não uma garantia de matchmaking online.

Os bots podem usar nomes fictícios, personalidades e estilos diferentes, mas a interface deve deixar claro que são bots. Quando mais jogadores reais estiverem disponíveis, o sistema poderá priorizá-los nas partidas seguintes.

### D. Entrada dos campeões e contagem regressiva

O controlador abaixo organiza a sequência de apresentação. Os métodos de animação e a reprodução do canto do galo serão conectados aos objetos e arquivos de áudio do jogo.

csharp
using System.Collections;
using UnityEngine;
using TMPro;

public class MatchIntroController : MonoBehaviour
{
    [SerializeField] private TMP_Text countdownText;
    [SerializeField] private AudioSource roosterAudio;
    [SerializeField] private AudioClip roosterCrow;

    private bool started;

    public IEnumerator RunIntro()
    {
        if (started)
            yield break;

        started = true;

        // 1. Todos os campeões aparecem no Galinheiro.
        SpawnAllChampions();

        // 2. Animações de saída e deslocamento às rotas.
        yield return StartCoroutine(
            MoveChampionsToLanes()
        );

        // 3. Contagem regressiva sincronizada.
        for (int i = 3; i >= 1; i--)
        {
            countdownText.text = i.ToString();
            yield return new WaitForSeconds(1f);
        }

        countdownText.text = "VAI!";

        // 4. O galo canta no início oficial.
        if (roosterAudio != null && roosterCrow != null)
            roosterAudio.PlayOneShot(roosterCrow);

        // 5. Solicitar ao controlador da partida
        // que libere os controles e o combate.
        StartGameplay();
    }

    private void SpawnAllChampions()
    {
        // TODO: Instanciar campeões e montarias
        // nas posições iniciais autorizadas pelo servidor.
    }

    private IEnumerator MoveChampionsToLanes()
    {
        // TODO: Executar animações de saída do Galinheiro,
        // montar, percorrer o caminho e posicionar as unidades.
        yield return null;
    }

    private void StartGameplay()
    {
        // TODO: Liberar movimento, ataques, habilidades,
        // tropas, torres e eventos de arena.
    }
}


Para partidas online, a contagem regressiva oficial deve ser sincronizada pelo servidor. Assim, um jogador com conexão lenta não começa a atacar antes do adversário.

### 4\. Regras de prioridade do matchmaking

A ordem recomendada é:

* Prioridade inicial: encontrar jogadores reais elegíveis na mesma região, com latência aceitável.

* Preenchimento rápido: se não houver adversários suficientes dentro da janela configurada, solicitar bots.

* Transparência: informar quando a partida contém bots.

* Evolução gradual: conforme a base de usuários crescer, aumentar a frequência de partidas entre pessoas reais.

* Competitividade: evitar que a prioridade de entrada coloque o jogador contra adversários com vantagem injusta.

A fila não deve permitir que usuários privilegiados ignorem indefinidamente outros jogadores ou que uma partida seja iniciada sem adversários válidos.

### 5\. Ordem de implementação

* Primeiro: coleção de personagens e seleção de montarias.

* Segundo: fila de matchmaking e preenchimento controlado com bots.

* Terceiro: animação de saída do Galinheiro e deslocamento para as rotas.

* Quarto: contagem regressiva sincronizada, canto do galo e liberação do combate.

* Quinto: testes de latência, cancelamento de fila, reconexão e partidas com jogadores reais.

Essa arquitetura cria uma experiência de entrada rápida sem misturar seleção de montaria, matchmaking e início do combate em um único script difícil de manter. O próximo passo técnico é conectar esses componentes ao sistema real de partidas do FOWLGEN WARS.

## Motivation
### FOWLGEN WARS — Sistema de Montarias, Entrada Rápida e Início de Partida

A proposta é criar um fluxo único para o jogador escolher sua montaria, entrar rapidamente em combate e começar a partida com uma apresentação cinematográfica dos campeões saindo do Galinheiro.

Há um ponto importante: podemos usar bots para preencher partidas rapidamente, mas eles devem ser identificados como bots, sem fingir ser jogadores humanos reais. Podemos dar a eles nomes fictícios, estilos de jogo, reações e personalidades naturais. A prioridade de matchmaking deve favorecer o jogador real sem criar uma fila falsa ou prejudicar a competitividade.

### 1\. Fluxo completo do jogador

Etapa 1 — Coleção de personagens

O jogador escolhe seu campeão, visual e uma montaria disponível.

Etapa 2 — Encontrar partida

Ao tocar em “JOGAR”, o sistema procura adversários reais imediatamente e, se necessário, prepara bots para completar a partida.

Etapa 3 — Entrada na arena

Os campeões aparecem dentro do Galinheiro, montam em suas montarias e começam a se deslocar para suas rotas.

Etapa 4 — Contagem regressiva

Todos se posicionam. O contador marca 3, 2, 1. O galo canta e a partida é liberada.

Meta de experiência: procurar partida imediatamente e tentar começar em até 3 segundos usando bots quando necessário. Isso é um objetivo de produto, não uma garantia técnica universal: conexão, latência e disponibilidade de servidores podem afetar o tempo real.

### 2\. Sistema de seleção de montarias

Na coleção, o jogador escolhe uma montaria desbloqueada. A seleção fica salva no perfil e é carregada quando a partida começa.

### Protótipo de seleção

Javali Turbo

Arrancada agressiva

SELECIONADA

Avestruz Veloz

Visual de velocidade

Bode Blindado

Visual pesado

Dragão de Quintal

Montaria lendária

Montaria escolhida: Javali Turbo

Demonstração de interface. A seleção ainda não está conectada ao jogo.

Para manter o equilíbrio competitivo, as montarias devem ser cosméticas no MVP. Se futuramente concederem habilidades, será necessário balancear suas vantagens e desvantagens.

### 3\. Código-base em Unity C#

Abaixo está uma estrutura inicial para a equipe implementar as etapas. Os componentes visuais, animações, áudio e conexão com um servidor real precisam ser integrados ao projeto.

### A. Dados da montaria

csharp
using UnityEngine;

[CreateAssetMenu(
    fileName = "Mount",
    menuName = "FOWLGEN WARS/Mount"
)]
public class MountData : ScriptableObject
{
    public string mountId;
    public string displayName;
    public GameObject prefab;
    public bool unlocked;
}


### B. Seleção da montaria

csharp
using UnityEngine;

public class MountSelection : MonoBehaviour
{
    public MountData SelectedMount { get; private set; }

    public void SelectMount(MountData mount)
    {
        if (mount == null || !mount.unlocked)
            return;

        SelectedMount = mount;

        PlayerPrefs.SetString(
            "SelectedMountId",
            mount.mountId
        );

        PlayerPrefs.Save();
    }
}


No jogo final, a lista de montarias desbloqueadas e a seleção válida devem ser verificadas pelo servidor quando houver economia online.

### C. Matchmaking rápido com prioridade para jogadores reais

A lógica deve procurar uma partida real imediatamente. Se não houver jogadores disponíveis dentro da janela definida, o sistema poderá completar a equipe adversária com bots identificados como IA.

csharp
using System;
using System.Collections.Generic;
using UnityEngine;

public enum MatchState
{
    Searching,
    Ready,
    Starting,
    InProgress,
    Cancelled
}

public class QuickMatchController : MonoBehaviour
{
    [SerializeField] private float targetWaitSeconds = 3f;

    public MatchState State { get; private set; }

    public event Action OnMatchReady;
    public event Action OnSearchStarted;

    private float searchStartedAt;
    private bool requestPending;

    public void StartSearch()
    {
        if (requestPending)
            return;

        requestPending = true;
        State = MatchState.Searching;
        searchStartedAt = Time.realtimeSinceStartup;

        OnSearchStarted?.Invoke();

        // TODO:
        // Enviar pedido ao servidor de matchmaking.
        // A fila deve ordenar jogadores reais elegíveis
        // por prioridade, região, latência e compatibilidade.
        // Não criar um resultado local fingindo que houve
        // uma conexão com outro jogador.
    }

    public void OnServerMatchFound()
    {
        if (!requestPending)
            return;

        State = MatchState.Ready;
        requestPending = false;
        OnMatchReady?.Invoke();
    }

    public bool ShouldRequestBotFill()
    {
        return requestPending
            && Time.realtimeSinceStartup - searchStartedAt
               >= targetWaitSeconds;
    }

    public void OnServerBotMatchReady()
    {
        if (!requestPending)
            return;

        // O servidor confirmou uma partida com bots.
        State = MatchState.Ready;
        requestPending = false;
        OnMatchReady?.Invoke();
    }

    public void CancelSearch()
    {
        if (!requestPending)
            return;

        requestPending = false;
        State = MatchState.Cancelled;

        // TODO: Cancelar também no servidor.
    }
}


Importante: ShouldRequestBotFill() apenas indica quando solicitar o preenchimento com bots. Não cria uma partida automaticamente. O servidor precisa confirmar os participantes, evitar partidas duplicadas e validar o resultado. O prazo de 3 segundos é uma meta de resposta, não uma garantia de matchmaking online.

Os bots podem usar nomes fictícios, personalidades e estilos diferentes, mas a interface deve deixar claro que são bots. Quando mais jogadores reais estiverem disponíveis, o sistema poderá priorizá-los nas partidas seguintes.

### D. Entrada dos campeões e contagem regressiva

O controlador abaixo organiza a sequência de apresentação. Os métodos de animação e a reprodução do canto do galo serão conectados aos objetos e arquivos de áudio do jogo.

csharp
using System.Collections;
using UnityEngine;
using TMPro;

public class MatchIntroController : MonoBehaviour
{
    [SerializeField] private TMP_Text countdownText;
    [SerializeField] private AudioSource roosterAudio;
    [SerializeField] private AudioClip roosterCrow;

    private bool started;

    public IEnumerator RunIntro()
    {
        if (started)
            yield break;

        started = true;

        // 1. Todos os campeões aparecem no Galinheiro.
        SpawnAllChampions();

        // 2. Animações de saída e deslocamento às rotas.
        yield return StartCoroutine(
            MoveChampionsToLanes()
        );

        // 3. Contagem regressiva sincronizada.
        for (int i = 3; i >= 1; i--)
        {
            countdownText.text = i.ToString();
            yield return new WaitForSeconds(1f);
        }

        countdownText.text = "VAI!";

        // 4. O galo canta no início oficial.
        if (roosterAudio != null && roosterCrow != null)
            roosterAudio.PlayOneShot(roosterCrow);

        // 5. Solicitar ao controlador da partida
        // que libere os controles e o combate.
        StartGameplay();
    }

    private void SpawnAllChampions()
    {
        // TODO: Instanciar campeões e montarias
        // nas posições iniciais autorizadas pelo servidor.
    }

    private IEnumerator MoveChampionsToLanes()
    {
        // TODO: Executar animações de saída do Galinheiro,
        // montar, percorrer o caminho e posicionar as unidades.
        yield return null;
    }

    private void StartGameplay()
    {
        // TODO: Liberar movimento, ataques, habilidades,
        // tropas, torres e eventos de arena.
    }
}


Para partidas online, a contagem regressiva oficial deve ser sincronizada pelo servidor. Assim, um jogador com conexão lenta não começa a atacar antes do adversário.

### 4\. Regras de prioridade do matchmaking

A ordem recomendada é:

* Prioridade inicial: encontrar jogadores reais elegíveis na mesma região, com latência aceitável.

* Preenchimento rápido: se não houver adversários suficientes dentro da janela configurada, solicitar bots.

* Transparência: informar quando a partida contém bots.

* Evolução gradual: conforme a base de usuários crescer, aumentar a frequência de partidas entre pessoas reais.

* Competitividade: evitar que a prioridade de entrada coloque o jogador contra adversários com vantagem injusta.

A fila não deve permitir que usuários privilegiados ignorem indefinidamente outros jogadores ou que uma partida seja iniciada sem adversários válidos.

### 5\. Ordem de implementação

* Primeiro: coleção de personagens e seleção de montarias.

* Segundo: fila de matchmaking e preenchimento controlado com bots.

* Terceiro: animação de saída do Galinheiro e deslocamento para as rotas.

* Quarto: contagem regressiva sincronizada, canto do galo e liberação do combate.

* Quinto: testes de latência, cancelamento de fila, reconexão e partidas com jogadores reais.

Essa arquitetura cria uma experiência de entrada rápida sem misturar seleção de montaria, matchmaking e início do combate em um único script difícil de manter. O próximo passo técnico é conectar esses componentes ao sistema real de partidas do FOWLGEN WARS.

## Status
[CRIADO]
