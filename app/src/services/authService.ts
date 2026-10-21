import { RegisterRequestDTO, UserDTO } from '../types/auth';

export const authService = {
    async registerUser(data: RegisterRequestDTO): Promise<UserDTO> {
        return new Promise((resolve) => {
            // Delay de 1.5s para simular a API e o loading da UI
            setTimeout(() => {
                resolve({
                    id_usuario: `usr_${Math.random().toString(36).substring(2, 11)}`,
                    nickname_jogo: data.nickname_jogo,
                    email: data.email,
                    wallet_address: data.wallet_address || '',
                });
            }, 1500);
        });
    },
};