# DevSecOps Anti-Leak Pre-Commit Security Auditor
# Fowlgen Wars - EAP Item 76: Auditoria anti-leak antes da submissao

Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "🛡️ FOWLGEN WARS - AUDITORIA DE SEGURANÇA ANTI-LEAK" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

$leakCount = 0

# 1. Checagem de arquivos sensíveis no Git
Write-Host "`n[1/3] Checando arquivos sensiveis no indice do Git..." -ForegroundColor Yellow
$sensitivePatterns = @("*.keypair", "id.json", "*.pem", "*.id_rsa", ".env.local")
foreach ($pat in $sensitivePatterns) {
    $found = git ls-files $pat
    if ($found) {
        Write-Host "❌ ARQUIVO SENSIVEL RASTREADO NO GIT: $found" -ForegroundColor Red
        $leakCount++
    }
}
if ($leakCount -eq 0) {
    Write-Host "✅ Nenhum arquivo de chave ou credencial rastreado no Git." -ForegroundColor Green
}

# 2. Varredura de código por segredos hardcoded
Write-Host "`n[2/3] Varrendo codigo C#, Rust e TypeScript por strings de segredo..." -ForegroundColor Yellow
$codeFiles = git ls-files "*.cs" "*.rs" "*.ts" "*.js"
$secretRegex = "(privateKey|secretKey|seedPhrase|auth_token)\s*=\s*`"[a-zA-Z0-9_\-]{24,}`""

foreach ($file in $codeFiles) {
    if (Test-Path $file) {
        $matches = Select-String -Path $file -Pattern $secretRegex -AllMatches
        if ($matches) {
            foreach ($m in $matches) {
                Write-Host "❌ Possivel segredo em $file na linha $($m.LineNumber)" -ForegroundColor Red
                $leakCount++
            }
        }
    }
}
if ($leakCount -eq 0) {
    Write-Host "✅ Nenhuma chave privada ou seed phrase hardcoded encontrada no codigo." -ForegroundColor Green
}

# 3. Verificacao de status do Git
Write-Host "`n[3/3] Checando arquivos modificados..." -ForegroundColor Yellow
$status = git status --short
Write-Host $status

Write-Host "`n-------------------------------------------------" -ForegroundColor Cyan
if ($leakCount -eq 0) {
    Write-Host "🎉 AUDITORIA APROVADA: 0 VAZAMENTOS DETECTADOS!" -ForegroundColor Green
    Write-Host "O repositorio esta seguro para commit e submissao." -ForegroundColor Green
    exit 0
} else {
    Write-Host "🚨 AUDITORIA REPROVADA: $leakCount VAZAMENTO(S) ENCONTRADO(S)!" -ForegroundColor Red
    Write-Host "Remova os segredos antes de realizar o commit." -ForegroundColor Red
    exit 1
}
