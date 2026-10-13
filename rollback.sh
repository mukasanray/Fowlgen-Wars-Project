#!/usr/bin/env bash
# ==============================================================================
# 🐔 FOWLGEN WARS — SCRIPT DE ROLLBACK DE EMERGÊNCIA (VERCEL & GITHUB)
# ==============================================================================
# Ponto de restauração: 4ac34dcc47dd846e95c0f0ee0343b506a5f13b62
# Tag de referência: rollback-point-pre-deploy
# ==============================================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

echo -e "${YELLOW}${BOLD}⚠️  INICIANDO ROLLBACK DO DEPLOY VERCEL / GITHUB...${NC}"
echo -e "Voltando para o commit seguro: ${CYAN}rollback-point-pre-deploy (4ac34dc)${NC}"

# Confirmação de segurança
read -rp "Tem certeza que deseja reverter o branch 'main' para o estado anterior? [s/N]: " confirm
if [[ "$confirm" != "s" && "$confirm" != "S" ]]; then
    echo -e "${RED}Rollback cancelado pelo usuário.${NC}"
    exit 0
fi

# 1. Reset local
git reset --hard rollback-point-pre-deploy
echo -e "${GREEN}✅ Repositório local restaurado para rollback-point-pre-deploy.${NC}"

# 2. Pergunta se deseja enviar o rollback para o GitHub (o que reverte o Vercel automaticamente)
read -rp "Deseja sincronizar o rollback com o GitHub (git push origin main --force)? [s/N]: " push_confirm
if [[ "$push_confirm" == "s" || "$push_confirm" == "S" ]]; then
    git push origin main --force
    echo -e "${GREEN}✅ GitHub e Vercel revertidos com sucesso!${NC}"
else
    echo -e "${YELLOW}ℹ️  Rollback aplicado apenas localmente. Para enviar à nuvem, rode: git push origin main --force${NC}"
fi

echo -e "${GREEN}${BOLD}🏁 Rollback finalizado com segurança!${NC}"
