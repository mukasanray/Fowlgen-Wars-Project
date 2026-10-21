#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
generate_official_report_pdf.py
Gerador de Relatórios Técnicos Oficiais em PDF para o Kanban Studio (Fowlgen Wars).
Suporta:
1. Geração por Card de Tarefa / Feature (--feature <feature_name>)
2. Geração Individual por Integrante (--member <member_id>)
3. Geração Consolidada para Toda a Equipe (--member all)

Mesmo padrão visual, tipográfico e institucional de Relatorio_Alinhamento_Site_API_Apoiadores_Junior_Marcos.pdf.
"""

import os
import sys
import json
import re
import argparse
from datetime import datetime

# Garante saída compatível com Windows PowerShell / CMD
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.pdfgen import canvas

REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../"))
OPEN_SPEC_DIR = os.path.join(REPO_ROOT, "openspec", "changes")
MEMBERS_FILE = os.path.join(REPO_ROOT, "kanban", "src", "config", "members.json")

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        self.doc_title = kwargs.pop("doc_title", "Fowlgen Wars — Relatório Técnico Oficial")
        super(NumberedCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            canvas.Canvas.showPage(self)
        canvas.Canvas.save(self)

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 7.2)
        self.setFillColor(colors.HexColor("#64748b"))
        footer_text = "Fowlgen Wars — G5B Studios • Kanban Studio & OpenSpec Integration"
        page_text = f"Página {self._pageNumber} de {page_count}"
        self.drawString(13 * mm, 8 * mm, footer_text)
        self.drawRightString(A4[0] - 13 * mm, 8 * mm, page_text)
        self.setStrokeColor(colors.HexColor("#e2e8f0"))
        self.setLineWidth(0.5)
        self.line(13 * mm, 11 * mm, A4[0] - 13 * mm, 11 * mm)
        self.restoreState()

def load_members():
    if os.path.exists(MEMBERS_FILE):
        try:
            with open(MEMBERS_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return [
        {"id": "marcos", "name": "Marcos", "role": "Líder Técnico • Dev Core Unity & Web3", "avatar": "💻"},
        {"id": "samuel", "name": "Samuel", "role": "Product Owner • Game Design • Kanban", "avatar": "👑"},
        {"id": "junior", "name": "Junior", "role": "Dev Web (React/Node) • Docs & Prompts", "avatar": "🌐"},
        {"id": "jorge", "name": "Jorge", "role": "Game Designer • 3D/VFX & Arte Conceitual", "avatar": "🎨"},
        {"id": "maria-clara", "name": "Maria Clara", "role": "Sound Designer • Áudio & Trilha Sonora", "avatar": "🎶"},
        {"id": "ramiro", "name": "Ramiro", "role": "Dev Unity • Combat & IA de Inimigos", "avatar": "🛡️"},
        {"id": "sthefany", "name": "Sthefany", "role": "QA & Balanceamento • Testes e Feedback", "avatar": "📊"},
        {"id": "vaguinhow", "name": "Vaguinhow", "role": "Dev Gameplay & Shaders • Otimização", "avatar": "⚙️"}
    ]

def detect_feature_directory(feat_name, title, task_texts):
    combined = (feat_name + " " + title + " " + " ".join(task_texts)).lower()
    if any(k in combined for k in ["site", "app", "hub", "react", "node", "vite", "portal", "web"]):
        return "🌐 Site: App (Web)"
    if any(k in combined for k in ["unity", "animac", "mixamo", "rig", "shader", "combat", "arena", "ia", "audio", "sound", "vfx"]):
        return "🎮 Game: Unity"
    if any(k in combined for k in ["prompt", "skill", "agent", "ia", "copilot"]):
        return "🤖 Skills: Prompt"
    if any(k in combined for k in ["solana", "program", "smart contract", "anchor"]):
        return "⚡ Solana Program"
    return "📁 Projeto Geral"

def parse_all_tasks():
    features_tasks = []
    if not os.path.exists(OPEN_SPEC_DIR):
        return features_tasks

    for entry in sorted(os.listdir(OPEN_SPEC_DIR)):
        feat_path = os.path.join(OPEN_SPEC_DIR, entry)
        if not os.path.isdir(feat_path):
            continue

        proposal_file = os.path.join(feat_path, "proposal.md")
        tasks_file = os.path.join(feat_path, "tasks.md")

        title = entry
        summary = ""
        motivation = ""
        proposed_solution = ""
        proposal_status = "Aprovado"

        if os.path.exists(proposal_file):
            try:
                with open(proposal_file, "r", encoding="utf-8") as pf:
                    pcontent = pf.read()
                    m = re.search(r"##\s*Title\s*\n+([^\n#]+)", pcontent, re.IGNORECASE)
                    if m:
                        title = m.group(1).strip()
                    m_sum = re.search(r"##\s*Summary\s*\n+([^\n#]+(?:\n[^\n#]+)*)", pcontent, re.IGNORECASE)
                    if m_sum:
                        summary = m_sum.group(1).strip()
                    m_mot = re.search(r"##\s*Motivation\s*\n+([^\n#]+(?:\n[^\n#]+)*)", pcontent, re.IGNORECASE)
                    if m_mot:
                        motivation = m_mot.group(1).strip()
                    m_sol = re.search(r"##\s*Proposed Solution\s*\n+([^\n#]+(?:\n[^\n#]+)*)", pcontent, re.IGNORECASE)
                    if m_sol:
                        proposed_solution = m_sol.group(1).strip()
                    m_st = re.search(r"##\s*Status\s*\n+([^\n#]+)", pcontent, re.IGNORECASE)
                    if m_st:
                        proposal_status = m_st.group(1).strip()
            except Exception:
                pass

        tasks = []
        task_texts = []
        if os.path.exists(tasks_file):
            try:
                with open(tasks_file, "r", encoding="utf-8") as tf:
                    for line in tf:
                        m = re.match(r"^-\s*\[([ xX])\]\s*(.+)$", line.strip())
                        if m:
                            done = m.group(1).lower() == 'x'
                            raw_desc = m.group(2).strip()
                            task_texts.append(raw_desc)
                            
                            t_id = ""
                            id_match = re.search(r"\*\*([0-9.]+)\*\*", raw_desc)
                            if id_match:
                                t_id = id_match.group(1).strip()
                            
                            assignee = "Equipe"
                            assignee_match = re.search(r"\(@([^\)]+)\)", raw_desc)
                            if assignee_match:
                                assignee = assignee_match.group(1).strip()
                            
                            clean_desc = re.sub(r"\(@[^\)]+\)", "", raw_desc)
                            clean_desc = re.sub(r"\*\*[0-9.]+\*\*", "", clean_desc).strip()

                            tasks.append({
                                "id": t_id,
                                "done": done,
                                "raw": raw_desc,
                                "desc": clean_desc or raw_desc,
                                "assignee": assignee,
                                "feature": entry,
                                "feature_title": title
                            })
            except Exception:
                pass

        if tasks:
            features_tasks.append({
                "feature": entry,
                "title": title,
                "summary": summary,
                "motivation": motivation,
                "proposed_solution": proposed_solution,
                "proposal_status": proposal_status,
                "directory": detect_feature_directory(entry, title, task_texts),
                "tasks": tasks
            })

    return features_tasks

def match_member(assignee_str, member):
    target = assignee_str.lower().replace("@", "").strip()
    m_id = member.get("id", "").lower()
    m_name = member.get("name", "").lower()
    m_github = member.get("github", "").lower() if member.get("github") else ""
    
    if m_id in target or target in m_id:
        return True
    if m_name in target or target in m_name:
        return True
    first_name = m_name.split()[0]
    if first_name and (first_name in target or target in first_name):
        return True
    if m_github and (m_github in target or target in m_github):
        return True
    return False

def build_pdf_report(target_member_id, output_path, target_feature=None):
    members = load_members()
    all_features = parse_all_tasks()

    doc = SimpleDocTemplate(
        output_path,
        pagesize=A4,
        leftMargin=13 * mm,
        rightMargin=13 * mm,
        topMargin=10 * mm,
        bottomMargin=14 * mm,
    )

    styles = getSampleStyleSheet()

    PRIMARY = colors.HexColor("#0f172a") 
    ACCENT = colors.HexColor("#d97706")  
    BURGUNDY = colors.HexColor("#991b1b") 
    TEXT_MAIN = colors.HexColor("#1e293b")
    TEXT_MUTED = colors.HexColor("#475569")
    BG_LIGHT = colors.HexColor("#f8fafc")
    BORDER_LIGHT = colors.HexColor("#e2e8f0")
    SUCCESS = colors.HexColor("#15803d")
    WARNING = colors.HexColor("#b45309")
    CODE_BG = colors.HexColor("#f1f5f9")

    style_top_bar = ParagraphStyle('TopBar', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=8, textColor=BURGUNDY, spaceAfter=2)
    style_title = ParagraphStyle('Title', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=12, leading=14.5, textColor=PRIMARY, spaceAfter=2)
    style_subtitle = ParagraphStyle('SubTitle', parent=styles['Normal'], fontName='Helvetica', fontSize=8, leading=10.5, textColor=TEXT_MUTED, spaceAfter=5)
    style_meta = ParagraphStyle('Meta', parent=styles['Normal'], fontName='Helvetica', fontSize=7.2, leading=9.5, textColor=TEXT_MAIN)
    style_meta_bold = ParagraphStyle('MetaBold', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=7.2, leading=9.5, textColor=PRIMARY)
    style_section_title = ParagraphStyle('SectionTitle', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=9, leading=11.5, textColor=PRIMARY, spaceBefore=4, spaceAfter=2.5)
    style_body = ParagraphStyle('Body', parent=styles['Normal'], fontName='Helvetica', fontSize=7.2, leading=9.5, textColor=TEXT_MAIN)
    style_bullet = ParagraphStyle('Bullet', parent=styles['Normal'], fontName='Helvetica', fontSize=6.8, leading=8.8, textColor=TEXT_MAIN, spaceAfter=1)
    style_th = ParagraphStyle('TH', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=6.6, leading=8.3, textColor=colors.white)
    style_td = ParagraphStyle('TD', parent=styles['Normal'], fontName='Helvetica', fontSize=6.3, leading=8, textColor=TEXT_MAIN)
    style_td_bold = ParagraphStyle('TDBold', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=6.3, leading=8, textColor=PRIMARY)

    story = []
    today_str = datetime.now().strftime("%d/%m/%Y às %H:%M")

    # =========================================================================
    # CASO 1: RELATÓRIO DO CARD DE TAREFA / FEATURE ESPECÍFICA
    # =========================================================================
    if target_feature:
        matched_feat = None
        for f in all_features:
            if f["feature"].lower() == target_feature.lower() or target_feature.lower() in f["feature"].lower():
                matched_feat = f
                break
        
        if not matched_feat:
            # Fallback se não encontrar tarefas
            matched_feat = {
                "feature": target_feature,
                "title": target_feature,
                "summary": "Proposta registrada no OpenSpec.",
                "motivation": "Melhorias contínuas para o ecossistema Fowlgen Wars.",
                "proposed_solution": "",
                "proposal_status": "Aprovado",
                "directory": "📁 Projeto Geral",
                "tasks": []
            }

        total_tasks = len(matched_feat["tasks"])
        done_tasks = len([t for t in matched_feat["tasks"] if t["done"]])
        pending_tasks = total_tasks - done_tasks
        pct = int(done_tasks / total_tasks * 100) if total_tasks > 0 else 0

        card_status = "DONE" if (total_tasks > 0 and pct == 100) else ("IN PROGRESS" if done_tasks > 0 else "BACKLOG")
        card_status_color = "#15803d" if card_status == "DONE" else ("#7c3aed" if card_status == "IN PROGRESS" else "#475569")

        assignees_set = set([t["assignee"] for t in matched_feat["tasks"] if t.get("assignee") and t["assignee"] != "Equipe"])
        assignees_display = ", ".join([f"👤 {a}" for a in sorted(assignees_set)]) if assignees_set else "👥 Toda a Equipe"

        # Topo
        story.append(Paragraph("FOWLGEN WARS — RELATÓRIO TÉCNICO OFICIAL DE CARD & SPRINT", style_top_bar))
        story.append(Paragraph(f"Card de Tarefa: {matched_feat['title']}", style_title))
        story.append(Paragraph(f"Módulo OpenSpec: <code>openspec/changes/{matched_feat['feature']}/</code> • Fowlgen Wars G5B Studios", style_subtitle))

        # Metadados
        meta_data = [
            [
                Paragraph(f"<b>Projeto:</b> {matched_feat['directory']}", style_meta),
                Paragraph(f"<b>Status do Card:</b> <font color='{card_status_color}'><b>{card_status}</b></font>", style_meta),
                Paragraph(f"<b>Emissão:</b> {today_str}", style_meta),
            ],
            [
                Paragraph(f"<b>Responsáveis:</b> {assignees_display}", style_meta),
                Paragraph(f"<b>Progresso:</b> {done_tasks}/{total_tasks} ({pct}%)", style_meta_bold),
                Paragraph("<b>Homologação:</b> Kanban Studio", style_meta),
            ]
        ]
        meta_table = Table(meta_data, colWidths=[68 * mm, 60 * mm, 56 * mm])
        meta_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), BG_LIGHT),
            ('BOX', (0,0), (-1,-1), 0.5, BORDER_LIGHT),
            ('INNERGRID', (0,0), (-1,-1), 0.5, BORDER_LIGHT),
            ('TOPPADDING', (0,0), (-1,-1), 2.5),
            ('BOTTOMPADDING', (0,0), (-1,-1), 2.5),
            ('LEFTPADDING', (0,0), (-1,-1), 4.5),
            ('RIGHTPADDING', (0,0), (-1,-1), 4.5),
        ]))
        story.append(meta_table)
        story.append(Spacer(1, 3 * mm))

        # 1. Indicadores do Card
        story.append(Paragraph("1. Indicadores de Execução do Card", style_section_title))
        summary_data = [
            [
                Paragraph("Status no Kanban", style_th),
                Paragraph("Tarefas Concluídas", style_th),
                Paragraph("Tarefas Pendentes", style_th),
                Paragraph("Total de Tarefas", style_th),
                Paragraph("Índice de Conclusão", style_th)
            ],
            [
                Paragraph(f"<font color='{card_status_color}'><b>{card_status}</b></font>", style_td_bold),
                Paragraph(f"<font color='#15803d'><b>{done_tasks} concluída(s)</b></font>", style_td_bold),
                Paragraph(f"<font color='#b45309'><b>{pending_tasks} pendente(s)</b></font>", style_td),
                Paragraph(f"<b>{total_tasks} tarefas</b>", style_td),
                Paragraph(f"<font color='#15803d'><b>{pct}% Concluído</b></font>", style_td_bold)
            ]
        ]
        summary_table = Table(summary_data, colWidths=[36 * mm, 38 * mm, 38 * mm, 36 * mm, 36 * mm])
        summary_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), PRIMARY),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('TOPPADDING', (0,0), (-1,-1), 2.5),
            ('BOTTOMPADDING', (0,0), (-1,-1), 2.5),
            ('LEFTPADDING', (0,0), (-1,-1), 4),
            ('RIGHTPADDING', (0,0), (-1,-1), 4),
            ('GRID', (0,0), (-1,-1), 0.5, BORDER_LIGHT),
            ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, BG_LIGHT]),
        ]))
        story.append(summary_table)
        story.append(Spacer(1, 3.5 * mm))

        # 2. Checklist Detalhado das Tarefas do Card
        story.append(Paragraph("2. Checklist & Detalhamento das Tarefas do Card", style_section_title))
        tasks_rows = [
            [
                Paragraph("ID", style_th),
                Paragraph("Descrição da Tarefa / Prompt", style_th),
                Paragraph("Responsável", style_th),
                Paragraph("Status da Entrega", style_th)
            ]
        ]

        if not matched_feat["tasks"]:
            tasks_rows.append([
                Paragraph("-", style_td),
                Paragraph("<i>Nenhuma tarefa detalhada encontrada no tasks.md.</i>", style_td),
                Paragraph("-", style_td),
                Paragraph("Pendente", style_td)
            ])
        else:
            for t in matched_feat["tasks"]:
                status_html = "<font color='#15803d'><b>[x] Concluído</b></font>" if t["done"] else "<font color='#b45309'><b>[ ] Pendente</b></font>"
                tasks_rows.append([
                    Paragraph(f"<b>{t['id'] or '-'}</b>", style_td_bold),
                    Paragraph(t["desc"], style_td),
                    Paragraph(f"👤 {t['assignee']}", style_td),
                    Paragraph(status_html, style_td)
                ])

        tasks_table = Table(tasks_rows, colWidths=[18 * mm, 108 * mm, 32 * mm, 26 * mm], repeatRows=1)
        tasks_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), PRIMARY),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('TOPPADDING', (0,0), (-1,-1), 2.5),
            ('BOTTOMPADDING', (0,0), (-1,-1), 2.5),
            ('LEFTPADDING', (0,0), (-1,-1), 4),
            ('RIGHTPADDING', (0,0), (-1,-1), 4),
            ('GRID', (0,0), (-1,-1), 0.5, BORDER_LIGHT),
            ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, BG_LIGHT]),
        ]))
        story.append(tasks_table)
        story.append(Spacer(1, 3.5 * mm))

        # 3. Escopo da Proposta & Contexto da Feature
        story.append(Paragraph("3. Escopo da Proposta & Contexto Técnico", style_section_title))
        summary_text = matched_feat.get("summary") or "Implementação e alinhamento do módulo conforme especificações do Game Design de Fowlgen Wars."
        motivation_text = matched_feat.get("motivation") or "Garantir a evolução contínua da experiência de combate e integridade da arquitetura."
        solution_text = matched_feat.get("proposed_solution") or ""

        proposal_box_content = f"• <b>Resumo do Escopo:</b> {summary_text}<br/>• <b>Motivação:</b> {motivation_text}"
        if solution_text:
            proposal_box_content += f"<br/>• <b>Solução Proposta:</b> {solution_text}"

        story.append(Paragraph(proposal_box_content, style_body))
        story.append(Spacer(1, 3 * mm))

        # 4. Critérios de Aceite & Validação
        story.append(Paragraph("4. Diretrizes de Aceite & Homologação", style_section_title))
        guidelines = (
            "• <b>Evidência em PlayMode:</b> A conclusão de cada tarefa requer validação funcional em PlayMode na cena <code>BattleArena</code> ou build web funcional.<br/>"
            "• <b>Alinhamento com Claude.md:</b> Modificações de código devem seguir a menor mudança viável, preservando compatibilidade e contratos existentes.<br/>"
            "• <b>Sincronização com o Kanban:</b> As tarefas concluídas devem ser salvas pelo botão <i>💾 Salvar Alterações</i> no Kanban Studio para commit oficial."
        )
        story.append(Paragraph(guidelines, style_body))

    # =========================================================================
    # CASO 2: RELATÓRIO POR INTEGRANTE OU CONSOLIDADO
    # =========================================================================
    else:
        is_all = (target_member_id.lower() in ["all", "todos", "equipe"])
        selected_member = None
        if not is_all:
            for m in members:
                if m.get("id", "").lower() == target_member_id.lower():
                    selected_member = m
                    break
            if not selected_member:
                selected_member = {"id": target_member_id, "name": target_member_id.capitalize(), "role": "Membro da Equipe", "avatar": "👤"}

        story.append(Paragraph("FOWLGEN WARS — RELATÓRIO TÉCNICO OFICIAL DE SPRINT & ALINHAMENTO", style_top_bar))
        if is_all:
            report_title = "Relatório Executivo Geral de Entregas & Produtividade da Equipe"
            report_sub = "Status consolidado de tarefas, progresso por integrante e metas da Sprint no OpenSpec."
        else:
            report_title = f"Relatório Individual de Alinhamento Técnico — {selected_member.get('avatar', '👤')} {selected_member['name']}"
            report_sub = f"Detalhamento de tarefas atribuídas, entregas concluídas e pendências técnicas de {selected_member['name']} ({selected_member.get('role', 'Integrante')})."

        story.append(Paragraph(report_title, style_title))
        story.append(Paragraph(report_sub, style_subtitle))

        meta_data = [
            [
                Paragraph("<b>Projeto:</b> Fowlgen Wars (G5B Studios)", style_meta),
                Paragraph("<b>Sprint:</b> Fase 2 — Alinhamento Web & Core", style_meta),
                Paragraph(f"<b>Data de Emissão:</b> {today_str}", style_meta),
            ],
            [
                Paragraph("<b>Repositório:</b> mukasanray/Fowlgen-Wars-Project", style_meta),
                Paragraph(f"<b>Escopo:</b> {'Equipe Completa' if is_all else selected_member['name']}", style_meta),
                Paragraph("<b>Status:</b> Homologado no Kanban Studio", style_meta_bold),
            ]
        ]
        meta_table = Table(meta_data, colWidths=[65 * mm, 62 * mm, 57 * mm])
        meta_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), BG_LIGHT),
            ('BOX', (0,0), (-1,-1), 0.5, BORDER_LIGHT),
            ('INNERGRID', (0,0), (-1,-1), 0.5, BORDER_LIGHT),
            ('TOPPADDING', (0,0), (-1,-1), 2.5),
            ('BOTTOMPADDING', (0,0), (-1,-1), 2.5),
            ('LEFTPADDING', (0,0), (-1,-1), 4.5),
            ('RIGHTPADDING', (0,0), (-1,-1), 4.5),
        ]))
        story.append(meta_table)
        story.append(Spacer(1, 3 * mm))

        if is_all:
            member_stats = []
            total_team_tasks = 0
            total_team_done = 0

            for m in members:
                done_count = 0
                pending_count = 0
                for feat in all_features:
                    for t in feat["tasks"]:
                        if match_member(t["assignee"], m):
                            if t["done"]:
                                done_count += 1
                            else:
                                pending_count += 1
                tot = done_count + pending_count
                pct = int(done_count / tot * 100) if tot > 0 else 0
                member_stats.append({
                    "member": m,
                    "done": done_count,
                    "pending": pending_count,
                    "total": tot,
                    "pct": pct
                })
                total_team_tasks += tot
                total_team_done += done_count

            team_pct = int(total_team_done / total_team_tasks * 100) if total_team_tasks > 0 else 0

            story.append(Paragraph("1. Visão Geral da Sprint & Indicadores Chave", style_section_title))
            summary_data = [
                [
                    Paragraph("Total de Tarefas", style_th),
                    Paragraph("Tarefas Concluídas", style_th),
                    Paragraph("Tarefas Pendentes", style_th),
                    Paragraph("Índice de Conclusão", style_th),
                    Paragraph("Integrantes Ativos", style_th)
                ],
                [
                    Paragraph(f"<b>{total_team_tasks}</b>", style_td_bold),
                    Paragraph(f"<font color='#15803d'><b>{total_team_done}</b></font>", style_td_bold),
                    Paragraph(f"<font color='#b45309'><b>{total_team_tasks - total_team_done}</b></font>", style_td_bold),
                    Paragraph(f"<font color='#15803d'><b>{team_pct}%</b></font>", style_td_bold),
                    Paragraph(f"<b>{len(members)} integrantes</b>", style_td)
                ]
            ]
            summary_table = Table(summary_data, colWidths=[36 * mm, 38 * mm, 38 * mm, 36 * mm, 36 * mm])
            summary_table.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (-1,0), PRIMARY),
                ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
                ('TOPPADDING', (0,0), (-1,-1), 2.5),
                ('BOTTOMPADDING', (0,0), (-1,-1), 2.5),
                ('LEFTPADDING', (0,0), (-1,-1), 4),
                ('RIGHTPADDING', (0,0), (-1,-1), 4),
                ('GRID', (0,0), (-1,-1), 0.5, BORDER_LIGHT),
                ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, BG_LIGHT]),
            ]))
            story.append(summary_table)
            story.append(Spacer(1, 3 * mm))

            story.append(Paragraph("2. Produtividade & Alocação por Integrante da Equipe", style_section_title))
            team_rows = [
                [
                    Paragraph("Integrante", style_th),
                    Paragraph("Cargo / Especialidade", style_th),
                    Paragraph("Concluídas", style_th),
                    Paragraph("Pendentes", style_th),
                    Paragraph("Total", style_th),
                    Paragraph("Progresso", style_th)
                ]
            ]

            for s in member_stats:
                m = s["member"]
                team_rows.append([
                    Paragraph(f"<b>{m.get('avatar', '👤')} {m['name']}</b>", style_td_bold),
                    Paragraph(m.get("role", "Integrante"), style_td),
                    Paragraph(f"<font color='#15803d'><b>{s['done']}</b></font>", style_td),
                    Paragraph(f"<font color='#b45309'><b>{s['pending']}</b></font>", style_td),
                    Paragraph(f"<b>{s['total']}</b>", style_td),
                    Paragraph(f"<b>{s['pct']}%</b>", style_td_bold)
                ])

            team_table = Table(team_rows, colWidths=[38 * mm, 62 * mm, 20 * mm, 20 * mm, 20 * mm, 24 * mm])
            team_table.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (-1,0), PRIMARY),
                ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
                ('TOPPADDING', (0,0), (-1,-1), 2),
                ('BOTTOMPADDING', (0,0), (-1,-1), 2),
                ('LEFTPADDING', (0,0), (-1,-1), 3.5),
                ('RIGHTPADDING', (0,0), (-1,-1), 3.5),
                ('GRID', (0,0), (-1,-1), 0.5, BORDER_LIGHT),
                ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, BG_LIGHT]),
            ]))
            story.append(team_table)
            story.append(Spacer(1, 3.5 * mm))

            story.append(Paragraph("3. Status das Tarefas por Integrante", style_section_title))

            for m in members:
                m_done_tasks = []
                m_pending_tasks = []
                for feat in all_features:
                    for t in feat["tasks"]:
                        if match_member(t["assignee"], m):
                            clean_desc = re.sub(r"\(@[^\)]+\)", "", t["raw"]).strip()
                            if t["done"]:
                                m_done_tasks.append(f"<b>[{feat['feature']}]</b> {clean_desc}")
                            else:
                                m_pending_tasks.append(f"<b>[{feat['feature']}]</b> {clean_desc}")

                tot = len(m_done_tasks) + len(m_pending_tasks)
                if tot == 0:
                    continue

                done_html = "<br/>".join([f"• <font color='#15803d'>[x]</font> {x}" for x in m_done_tasks[:6]]) or "<i>Nenhuma tarefa concluída no momento.</i>"
                if len(m_done_tasks) > 6:
                    done_html += f"<br/><i>... e mais {len(m_done_tasks) - 6} tarefas concluídas.</i>"

                pend_html = "<br/>".join([f"• <font color='#b45309'>[ ]</font> {x}" for x in m_pending_tasks[:6]]) or "<i>Todas as tarefas atribuídas foram concluídas! 🎯</i>"
                if len(m_pending_tasks) > 6:
                    pend_html += f"<br/><i>... e mais {len(m_pending_tasks) - 6} tarefas pendentes.</i>"

                m_box_data = [
                    [
                        Paragraph(f"<b>{m.get('avatar', '👤')} {m['name']} — {m.get('role', '')}</b>", ParagraphStyle('MTitle', parent=style_meta_bold, textColor=PRIMARY)),
                        Paragraph(f"<b>Progresso: {len(m_done_tasks)}/{tot} ({int(len(m_done_tasks)/tot*100)}%)</b>", ParagraphStyle('MPct', parent=style_meta_bold, alignment=2, textColor=ACCENT))
                    ],
                    [
                        Paragraph(f"<b>Concluídas ({len(m_done_tasks)}):</b><br/>{done_html}", style_bullet),
                        Paragraph(f"<b>Pendentes ({len(m_pending_tasks)}):</b><br/>{pend_html}", style_bullet)
                    ]
                ]
                m_box = Table(m_box_data, colWidths=[92 * mm, 92 * mm])
                m_box.setStyle(TableStyle([
                    ('BACKGROUND', (0,0), (-1,0), CODE_BG),
                    ('BACKGROUND', (0,1), (-1,-1), BG_LIGHT),
                    ('BOX', (0,0), (-1,-1), 0.5, BORDER_LIGHT),
                    ('INNERGRID', (0,0), (-1,-1), 0.5, BORDER_LIGHT),
                    ('TOPPADDING', (0,0), (-1,-1), 2),
                    ('BOTTOMPADDING', (0,0), (-1,-1), 2),
                    ('LEFTPADDING', (0,0), (-1,-1), 4),
                    ('RIGHTPADDING', (0,0), (-1,-1), 4),
                    ('VALIGN', (0,0), (-1,-1), 'TOP'),
                ]))
                story.append(KeepTogether(m_box))
                story.append(Spacer(1, 2.5 * mm))

        else:
            m_done_tasks = []
            m_pending_tasks = []
            for feat in all_features:
                for t in feat["tasks"]:
                    if match_member(t["assignee"], selected_member):
                        clean_desc = re.sub(r"\(@[^\)]+\)", "", t["raw"]).strip()
                        item = {
                            "feature": feat["feature"],
                            "feature_title": feat["title"],
                            "desc": clean_desc,
                            "done": t["done"]
                        }
                        if t["done"]:
                            m_done_tasks.append(item)
                        else:
                            m_pending_tasks.append(item)

            total_m = len(m_done_tasks) + len(m_pending_tasks)
            pct_m = int(len(m_done_tasks) / total_m * 100) if total_m > 0 else 0

            story.append(Paragraph("1. Indicadores de Produtividade do Integrante", style_section_title))
            ind_data = [
                [
                    Paragraph("Status Atual", style_th),
                    Paragraph("Tarefas Concluídas", style_th),
                    Paragraph("Tarefas Pendentes", style_th),
                    Paragraph("Total de Demandas", style_th),
                    Paragraph("Índice de Conclusão", style_th)
                ],
                [
                    Paragraph("⚡ Ativo na Sprint", style_td_bold),
                    Paragraph(f"<font color='#15803d'><b>{len(m_done_tasks)} tarefas</b></font>", style_td),
                    Paragraph(f"<font color='#b45309'><b>{len(m_pending_tasks)} tarefas</b></font>", style_td),
                    Paragraph(f"<b>{total_m} tarefas</b>", style_td),
                    Paragraph(f"<font color='#15803d'><b>{pct_m}% Concluído</b></font>", style_td_bold)
                ]
            ]
            ind_table = Table(ind_data, colWidths=[36 * mm, 38 * mm, 38 * mm, 36 * mm, 36 * mm])
            ind_table.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (-1,0), PRIMARY),
                ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
                ('TOPPADDING', (0,0), (-1,-1), 2.5),
                ('BOTTOMPADDING', (0,0), (-1,-1), 2.5),
                ('LEFTPADDING', (0,0), (-1,-1), 4),
                ('RIGHTPADDING', (0,0), (-1,-1), 4),
                ('GRID', (0,0), (-1,-1), 0.5, BORDER_LIGHT),
                ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, BG_LIGHT]),
            ]))
            story.append(ind_table)
            story.append(Spacer(1, 3 * mm))

            story.append(Paragraph(f"2. Detalhamento de Tarefas — {selected_member['name']}", style_section_title))

            max_rows = max(len(m_done_tasks), len(m_pending_tasks))
            tasks_table_data = [
                [
                    Paragraph(f"<b>Tarefas Concluídas ({len(m_done_tasks)}):</b>", ParagraphStyle('T1', parent=style_meta_bold, textColor=SUCCESS)),
                    Paragraph(f"<b>Tarefas Pendentes ({len(m_pending_tasks)}):</b>", ParagraphStyle('T2', parent=style_meta_bold, textColor=WARNING))
                ]
            ]

            if max_rows == 0:
                tasks_table_data.append([
                    Paragraph("<i>Nenhuma tarefa concluída no momento.</i>", style_bullet),
                    Paragraph("<i>Todas as tarefas atribuídas foram concluídas! 🎯</i>", style_bullet)
                ])
            else:
                for idx in range(max_rows):
                    d_p = ""
                    if idx < len(m_done_tasks):
                        d = m_done_tasks[idx]
                        d_p = f"• <font color='#15803d'><b>[x]</b></font> <b>[{d['feature']}]</b> {d['desc']}"

                    p_p = ""
                    if idx < len(m_pending_tasks):
                        p = m_pending_tasks[idx]
                        p_p = f"• <font color='#b45309'><b>[ ]</b></font> <b>[{p['feature']}]</b> {p['desc']}"

                    tasks_table_data.append([
                        Paragraph(d_p, style_bullet) if d_p else Paragraph("", style_bullet),
                        Paragraph(p_p, style_bullet) if p_p else Paragraph("", style_bullet)
                    ])

            tasks_table = Table(tasks_table_data, colWidths=[92 * mm, 92 * mm], repeatRows=1)
            tasks_table.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (-1,0), CODE_BG),
                ('BACKGROUND', (0,1), (-1,-1), colors.white),
                ('BOX', (0,0), (-1,-1), 0.5, BORDER_LIGHT),
                ('INNERGRID', (0,0), (-1,-1), 0.5, BORDER_LIGHT),
                ('TOPPADDING', (0,0), (-1,-1), 2),
                ('BOTTOMPADDING', (0,0), (-1,-1), 2),
                ('LEFTPADDING', (0,0), (-1,-1), 4),
                ('RIGHTPADDING', (0,0), (-1,-1), 4),
                ('VALIGN', (0,0), (-1,-1), 'TOP'),
            ]))
            story.append(tasks_table)
            story.append(Spacer(1, 3 * mm))

            story.append(Paragraph("3. Alinhamento de Escopo & Próximas Ações", style_section_title))
            notes_text = (
                f"• <b>Foco de Entrega:</b> As tarefas pendentes de <b>{selected_member['name']}</b> devem ser priorizadas de acordo com o Kanban da Fase 2 e alinhadas às diretrizes de <code>Claude.md</code>.<br/>"
                f"• <b>Evidência de Conclusão:</b> Conforme o padrão do projeto, marcar uma tarefa como <code>[x]</code> requer código/arte compilável, testado e validado em PlayMode ou homologado.<br/>"
                f"• <b>Sincronização:</b> Ao finalizar tarefas locais, utilize a opção <i>💾 Salvar Alterações</i> no topo do Kanban Studio para registrar o commit oficial no Git."
            )
            story.append(Paragraph(notes_text, style_body))

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"[OK] PDF gerado com sucesso em: {output_path}")

def main():
    parser = argparse.ArgumentParser(description="Gerador de Relatórios Técnicos Oficiais em PDF - Kanban Studio")
    parser.add_argument("--member", type=str, default="all", help="ID do integrante (marcos, junior, samuel, etc.) ou 'all'")
    parser.add_argument("--feature", type=str, default=None, help="Nome/ID da feature/card (ex: animacoes-personagens-mixamo)")
    parser.add_argument("--output", type=str, default=None, help="Caminho do arquivo PDF de saída")

    args = parser.parse_args()
    member_id = (args.member or "all").strip()
    feature_id = args.feature.strip() if args.feature else None

    if not args.output:
        reports_dir = os.path.join(REPO_ROOT, "prompt", "files", "pdf")
        os.makedirs(reports_dir, exist_ok=True)
        if feature_id:
            filename = f"Relatorio_Oficial_Card_{feature_id.replace('-', '_')}.pdf"
        elif member_id != "all":
            filename = f"Relatorio_Oficial_Sprint_{member_id.capitalize()}.pdf"
        else:
            filename = "Relatorio_Oficial_Sprint_Equipe_Consolidado.pdf"
        output_path = os.path.join(reports_dir, filename)
    else:
        output_path = os.path.abspath(args.output)
        os.makedirs(os.path.dirname(output_path), exist_ok=True)

    build_pdf_report(member_id, output_path, target_feature=feature_id)

if __name__ == "__main__":
    main()
