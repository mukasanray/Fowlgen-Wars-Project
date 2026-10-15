-- ============================================================================
-- 🐔 FOWLGEN WARS — OPEN SPEC & KANBAN DATABASE SCHEMA
-- PostgreSQL 15 (Docker / Kubernetes / Local)
-- ============================================================================

-- Tabela de Features / Propostas OpenSpec
CREATE TABLE IF NOT EXISTS kanban_features (
    id VARCHAR(120) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    summary TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'Backlog',
    kanban_column VARCHAR(50) NOT NULL DEFAULT 'Backlog',
    proposal_raw TEXT,
    github_item_id VARCHAR(100),
    github_issue_number INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Tarefas detalhadas do OpenSpec
CREATE TABLE IF NOT EXISTS kanban_tasks (
    id SERIAL PRIMARY KEY,
    feature_id VARCHAR(120) NOT NULL REFERENCES kanban_features(id) ON DELETE CASCADE,
    task_number VARCHAR(20) NOT NULL,
    description TEXT NOT NULL,
    section VARCHAR(100) DEFAULT 'Implementation',
    status VARCHAR(50) DEFAULT 'Backlog',
    is_completed BOOLEAN DEFAULT FALSE,
    assignee VARCHAR(100) DEFAULT 'Equipe',
    raw_line TEXT,
    github_task_id VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_feature_task UNIQUE (feature_id, task_number)
);

-- Tabela de Auditoria e Logs de Sincronização
CREATE TABLE IF NOT EXISTS kanban_sync_logs (
    id SERIAL PRIMARY KEY,
    source VARCHAR(50) NOT NULL, -- 'frontend', 'openspec', 'github', 'cli'
    action VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'success',
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices de Performance para Produção
CREATE INDEX IF NOT EXISTS idx_features_status ON kanban_features(status);
CREATE INDEX IF NOT EXISTS idx_features_column ON kanban_features(kanban_column);
CREATE INDEX IF NOT EXISTS idx_tasks_feature_id ON kanban_tasks(feature_id);
CREATE INDEX IF NOT EXISTS idx_tasks_is_completed ON kanban_tasks(is_completed);
CREATE INDEX IF NOT EXISTS idx_sync_logs_created_at ON kanban_sync_logs(created_at DESC);
