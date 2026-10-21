// ─────────────────────────────────────────────────────────
// DTOs oficiais — Fowlgen Wars API (.NET 9)
// ─────────────────────────────────────────────────────────

export interface UserDTO {
  id_usuario: string;   // Guid
  nickname: string;
  email: string;
  wallet_address?: string;
  status: 'Ativo' | 'Inativo' | 'Bloqueado';
}

export interface RegisterRequestDTO {
  email: string;
  nickname: string;
  password: string;
}

export interface LoginWeb3DTO {
  walletAddress: string;
  signature: string;
  msg: string;
}

export interface SupporterDTO {
  id?: string;
  nickname: string;
  wallet?: string;
  tier: 1 | 2 | 3;
  tx?: string;
  msg?: string;
  created_at?: string;
}

export interface SupporterPostDTO {
  nickname: string;
  wallet?: string;
  tier: 1 | 2 | 3;
  tx?: string;
  msg?: string;
}

export interface PagedResult<T> {
  data: T[];
  total: number;
  pageIndex: number;
  pageSize: number;
}
