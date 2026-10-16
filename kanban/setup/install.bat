@echo off
setlocal enabledelayedexpansion
title Instalador - OpenSpec Kanban Studio

echo ========================================================
echo   Fowlgen Wars - Setup de Ferramentas e Ambiente
echo ========================================================
echo.

:: 1. Verificar se Node.js esta instalado
where node >nul 2>nul
if %errorlevel% neq 0 (
    if exist "C:\Program Files\nodejs\node.exe" (
        set "PATH=C:\Program Files\nodejs;%PATH%"
        echo [OK] Node.js localizado em C:\Program Files\nodejs!
    ) else (
        echo [!] Node.js nao detectado.
        echo [*] Instalando Node.js LTS via winget...
        winget install OpenJS.NodeJS.LTS --silent --accept-package-agreements --accept-source-agreements
        set "PATH=C:\Program Files\nodejs;%PATH%"
    )
) else (
    echo [OK] Node.js detectado!
)

:: 2. Verificar Git
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo [!] Git nao detectado.
    echo [*] Instalando Git via winget...
    winget install Git.Git --silent --accept-package-agreements --accept-source-agreements
) else (
    echo [OK] Git detectado!
)

:: 3. Entrar na pasta raiz do kanban (um nivel acima)
cd /d "%~dp0.."

:: 4. Instalar dependencias se node_modules nao existir
if not exist "node_modules\" (
    echo.
    echo [*] Instalando dependencias do projeto (npm install)...
    call npm.cmd install
) else (
    echo [OK] Dependencias node_modules ja instaladas!
)

:: 5. Executar o menu interativo se nao for apenas tools
if "%1" neq "--tools-only" (
    echo.
    echo [*] Iniciando Menu do Kanban Studio...
    call npm.cmd run setup
    pause
)
