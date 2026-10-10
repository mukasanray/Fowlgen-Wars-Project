using System.ComponentModel.DataAnnotations;

namespace  Onix.FowlgenWars.Acesso.Application.ViewModels
{
    public class UsuarioCreateViewModel
    {
        [Required]
        public string Nickname { get; set; } = string.Empty;
        
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        public string WalletAddress { get; set; } = string.Empty;
    }
}
