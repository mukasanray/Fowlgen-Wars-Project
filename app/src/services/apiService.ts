// ─────────────────────────────────────────────────────────
// apiService.ts — Fowlgen Wars REST API (.NET 9)
// Base URL configurável via .env (VITE_API_URL)
// Fallback gracioso para modo local
// ─────────────────────────────────────────────────────────
import type {
  UserDTO,
  RegisterRequestDTO,
  LoginWeb3DTO,
  SupporterDTO,
  SupporterPostDTO,
  PagedResult,
} from '../types/api';

const BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:5000';

// ── Dados de fallback para modo offline ──────────────────
const FALLBACK_SUPPORTERS: SupporterDTO[] = [
  { id: '1', nickname: 'Marcos_Dev', tier: 3, msg: 'Líder técnico, orgulho do projeto!', created_at: '2026-10-01' },
  { id: '2', nickname: 'SamuelPO', tier: 2, msg: 'O visão do produto é nossa força!', created_at: '2026-10-05' },
  { id: '3', nickname: 'ArarAzul_Fã', tier: 1, msg: 'Proteção à fauna e à arte!', created_at: '2026-10-10' },
  { id: '4', nickname: 'CaosArcano99', tier: 2, msg: 'Pelo Reino Obscuro!', created_at: '2026-10-12' },
  { id: '5', nickname: 'ImperioLuz', tier: 1, msg: 'A Ordem Imperial prevalecerá!', created_at: '2026-10-14' },
  { id: '6', nickname: 'MicoGuardiao', tier: 3, msg: 'Web3 + conservação = futuro.', created_at: '2026-10-16' },
  { id: '7', nickname: 'JorgeDevOps', tier: 2, msg: 'Infra sólida, jogo voando!', created_at: '2026-10-18' },
  { id: '8', nickname: 'MariaClara_QA', tier: 1, msg: 'Zero bugs, máxima qualidade!', created_at: '2026-10-19' },
];

async function safeFetch<T>(url: string, options?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(url, { ...options, signal: AbortSignal.timeout(5000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export const apiService = {
  // ── Users ────────────────────────────────────────────
  async register(data: RegisterRequestDTO): Promise<UserDTO | null> {
    // Tenta a API real; em fallback retorna DTO simulado
    const result = await safeFetch<UserDTO>(`${BASE_URL}/api/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (result) return result;
    // Modo local
    return {
      id_usuario: `usr_${Math.random().toString(36).substring(2, 11)}`,
      nickname: data.nickname,
      email: data.email,
      status: 'Ativo',
    };
  },

  async getUser(id: string): Promise<UserDTO | null> {
    return safeFetch<UserDTO>(`${BASE_URL}/api/users/${id}`);
  },

  // ── Auth Web3 ────────────────────────────────────────
  async loginWeb3(data: LoginWeb3DTO): Promise<{ token: string } | null> {
    return safeFetch<{ token: string }>(`${BASE_URL}/api/auth/login-web3`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  // ── Supporters ───────────────────────────────────────
  async getSupporters(pageIndex = 1, pageSize = 8): Promise<PagedResult<SupporterDTO>> {
    const result = await safeFetch<PagedResult<SupporterDTO>>(
      `${BASE_URL}/api/supporters?pageIndex=${pageIndex}&pageSize=${pageSize}`
    );
    if (result) return result;
    // Fallback offline com paginação simulada
    const start = (pageIndex - 1) * pageSize;
    return {
      data: FALLBACK_SUPPORTERS.slice(start, start + pageSize),
      total: FALLBACK_SUPPORTERS.length,
      pageIndex,
      pageSize,
    };
  },

  async postSupporter(data: SupporterPostDTO): Promise<SupporterDTO | null> {
    const result = await safeFetch<SupporterDTO>(`${BASE_URL}/api/supporters`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (result) return result;
    // Fallback local
    return { ...data, id: `local_${Date.now()}`, created_at: new Date().toISOString() };
  },
};
