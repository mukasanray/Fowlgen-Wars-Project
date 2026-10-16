# Fowlgen Wars - Kanban Studio Bootstrap Installer (PowerShell)
param(
    [switch]$ToolsOnly
)

$ErrorActionPreference = "Continue"

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  Fowlgen Wars - Setup de Ferramentas e Ambiente" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Verificar Node.js
$nodeFound = $false
try {
    $v = & node -v 2>$null
    if ($v) { $nodeFound = $true }
} catch {}

if (-not $nodeFound) {
    if (Test-Path "C:\Program Files\nodejs\node.exe") {
        $env:Path = "C:\Program Files\nodejs;" + $env:Path
        $nodeFound = $true
        Write-Host "Node.js localizado em C:\Program Files\nodejs e adicionado ao PATH!" -ForegroundColor Green
    } else {
        Write-Host "Node.js nao detectado no sistema." -ForegroundColor Yellow
        Write-Host "Instalando Node.js LTS via winget..." -ForegroundColor Cyan
        try {
            Start-Process winget -ArgumentList "install OpenJS.NodeJS.LTS --silent --accept-package-agreements --accept-source-agreements" -Wait -NoNewWindow
            $env:Path = "C:\Program Files\nodejs;" + $env:Path
            Write-Host "Node.js LTS instalado com sucesso!" -ForegroundColor Green
        } catch {
            Write-Host "Falha ao instalar Node.js via winget. Baixe em https://nodejs.org/" -ForegroundColor Red
        }
    }
} else {
    Write-Host "Node.js detectado: $(node -v)" -ForegroundColor Green
}

# 2. Verificar Git
$gitFound = $false
try {
    $gv = & git --version 2>$null
    if ($gv) { $gitFound = $true }
} catch {}

if (-not $gitFound) {
    Write-Host "Git nao detectado no sistema." -ForegroundColor Yellow
    Write-Host "Instalando Git via winget..." -ForegroundColor Cyan
    try {
        Start-Process winget -ArgumentList "install Git.Git --silent --accept-package-agreements --accept-source-agreements" -Wait -NoNewWindow
        Write-Host "Git instalado com sucesso!" -ForegroundColor Green
    } catch {
        Write-Host "Falha ao instalar Git via winget. Baixe em https://git-scm.com/" -ForegroundColor Red
    }
} else {
    Write-Host "Git detectado: $(git --version)" -ForegroundColor Green
}

# 3. Entrar na pasta raiz do kanban
$kanbanRoot = (Resolve-Path "$PSScriptRoot\..").Path
Set-Location -Path $kanbanRoot

# 4. Instalar dependencias se node_modules nao existir
if (-not (Test-Path "node_modules")) {
    Write-Host ""
    Write-Host "Instalando dependencias do projeto (npm install)..." -ForegroundColor Cyan
    & npm.cmd install
    Write-Host "Dependencias instaladas com sucesso!" -ForegroundColor Green
} else {
    Write-Host "Dependencias do projeto ja estao instaladas (node_modules)" -ForegroundColor Green
}

# 5. Se nao foi chamado com -ToolsOnly, chama o setup interativo
if (-not $ToolsOnly) {
    Write-Host ""
    Write-Host "Iniciando Menu do Kanban Studio..." -ForegroundColor Cyan
    & npm.cmd run setup
}
