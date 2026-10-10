using System;

namespace  Onix.FowlgenWars.Acesso.Application.ViewModels
{
    public class UsuarioViewModel
    {
        public Guid Id { get; set; }
        public string Email { get; set; } = string.Empty;
        public string Nickname { get; set; } = string.Empty;
        public string WalletAddress { get; set; } = string.Empty;
        public int Status { get; set; }
    }
}
