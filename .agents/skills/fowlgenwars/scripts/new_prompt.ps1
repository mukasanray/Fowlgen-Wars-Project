[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [ValidateNotNullOrEmpty()]
    [string]$Title,

    [Parameter(Mandatory = $false)]
    [string]$Slug
)

$skillRoot = Split-Path -Parent $PSScriptRoot
$promptsRoot = Join-Path $skillRoot 'skills'
$indexPath = Join-Path $promptsRoot '56_fowlgenwars_indice_documentos.md'

if (-not (Test-Path $indexPath)) {
    throw "Índice geral de documentos não encontrado: $indexPath"
}

if ([string]::IsNullOrWhiteSpace($Slug)) {
    $Slug = $Title
}

$normalizedSlug = $Slug.Normalize([System.Text.NormalizationForm]::FormD)
$normalizedSlug = [System.Text.RegularExpressions.Regex]::Replace($normalizedSlug, '\p{Mn}', '')
$normalizedSlug = $normalizedSlug.ToLowerInvariant()
$normalizedSlug = [System.Text.RegularExpressions.Regex]::Replace($normalizedSlug, '[^a-z0-9]+', '_')
$normalizedSlug = $normalizedSlug.Trim('_')

if ([string]::IsNullOrWhiteSpace($normalizedSlug)) {
    throw 'O titulo ou slug precisa conter letras ou numeros.'
}

$pattern = '^(?<number>\d+)_fowlgenwars_[a-z0-9_]+\.md$'
$maxNumber = 0
Get-ChildItem -Path $promptsRoot -Recurse -File -Filter '*.md' | ForEach-Object {
    if ($_.Name -cmatch $pattern) {
        $number = [int]$Matches['number']
        if ($number -gt $maxNumber) {
            $maxNumber = $number
        }
    }
}

$nextNumber = $maxNumber + 1
$numberText = '{0:D2}' -f $nextNumber
$fileName = '{0}_fowlgenwars_{1}.md' -f $numberText, $normalizedSlug
$filePath = Join-Path $promptsRoot $fileName

if (Test-Path $filePath) {
    throw "O arquivo já existe: $filePath"
}

$template = @"
# $Title

## Status e objetivo

Descreva a proposta, seu status e o que ainda depende de aprovacao. Nao declare implementacao sem evidencia.

## Arquitetura de desenvolvimento

- Dados e configuracao: indique definicoes existentes a reutilizar; evite valores duplicados.
- Dominio e servicos: descreva responsabilidades sem criar servicos redundantes.
- Apresentacao: mantenha Views passivas; entrada do usuario deve passar pelo Presenter/servico apropriado.
- Persistencia e autoridade: indique a fonte de verdade, comportamento offline e autoridade de rede quando aplicavel.
- Integracoes: mantenha gameplay em tempo real fora da blockchain; documente dependencias reais.
- Testes e criterios de aceite: defina validacoes observaveis e o que permanece fora do escopo.

## Conflitos e decisoes pendentes

- Liste fontes divergentes, impacto e decisao necessaria.

## Proximo passo

- Registre a menor etapa verificavel, sem assumir aprovacao ou implementacao.
"@

$utf8WithoutBom = New-Object -TypeName System.Text.UTF8Encoding -ArgumentList $false
[System.IO.File]::WriteAllText($filePath, $template, $utf8WithoutBom)

$indexContent = [System.IO.File]::ReadAllText($indexPath)
$conventionHeading = '## Depend'
$insertAt = $indexContent.IndexOf($conventionHeading)
if ($insertAt -lt 0) {
    Remove-Item -Path $filePath
    throw "Nao foi possivel encontrar a secao de dependencias no indice: $indexPath"
}

$beforeConvention = $indexContent.Substring(0, $insertAt).TrimEnd([char[]]"`r`n")
$afterConvention = $indexContent.Substring($insertAt)
$indexContent = $beforeConvention + "`r`n| $numberText | [$fileName]($fileName) | $Title | Novo prompt |`r`n`r`n" + $afterConvention
[System.IO.File]::WriteAllText($indexPath, $indexContent, $utf8WithoutBom)

Write-Output $filePath
