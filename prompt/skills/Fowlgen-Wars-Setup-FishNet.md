# Setup FishNet - Fowlgen Wars

Para evitar problemas de duplicação de assembly (`Assembly already exists`) ao clonar o projeto, a biblioteca FishNet foi configurada para ser gerenciada **exclusivamente pelo Unity Package Manager**.

## Versão Utilizada
- **FishNet: Networking Evolved**
- **Versão:** 4.7.3

## Como a FishNet é importada no projeto
A instalação é feita adicionando a dependência diretamente no arquivo `Packages/manifest.json`:
`"com.firstgeargames.fishnet": "https://github.com/FirstGearGames/FishNet.git?path=Assets/FishNet"`

Isso mantém a pasta `Assets` limpa e garante que a biblioteca seja facilmente atualizada.

## Instruções em caso de reimportação / erros
Se ocorrerem erros de conflito (`Assembly already exists`):
1. **NÃO coloque a pasta do FishNet fisicamente dentro de `Assets/FishNet`**. Se ela existir lá, exclua-a (junto com o arquivo `FishNet.meta`).
2. Garanta que a linha referente ao FishNet esteja no arquivo `manifest.json`.
3. Os códigos customizados criados pela equipe (como os das POCs 1v1) devem ser mantidos em diretórios separados dentro de `Assets/`, nunca dentro da pasta da biblioteca do FishNet.
