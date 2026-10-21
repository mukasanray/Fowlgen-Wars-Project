export interface UserDTO {
    id_usuario: string;
    nickname_jogo: string;
    email: string;
    wallet_address?: string;
}

export interface RegisterRequestDTO {
    nickname_jogo: string;
    email: string;
    password?: string;
    wallet_address?: string;
}