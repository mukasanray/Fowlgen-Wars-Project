using Onix.Fowlgenwars.Core.Domain.Entities;
using Onix.FowlgenWars.Acesso.Domain.Enums; // Adjust based on your BaseEntity namespace
using System;

namespace  Onix.FowlgenWars.Acesso.Domain.Entities
{
    public class Usuario : AggregateRootEntity
    {
        public Guid Id { get; private set; }
        public string Email { get; private set; }
        public string Nickname { get; private set; }
        public string WalletAddress { get; private set; }
        public EStatusUsuario Status { get; private set; }
        public DateTime CreatedAt { get; private set; }
        public DateTime? Modificado { get; private set; }
        
        protected Usuario() { }

        public void AlterarStatus(EStatusUsuario status)
        {
            Status = status;
            Modificado = DateTime.UtcNow;
        }

        public void AlterarDados(Usuario usuarioAlterarDados)
        {
            Nickname = usuarioAlterarDados.Nickname;
            Email = usuarioAlterarDados.Email;
            WalletAddress = usuarioAlterarDados.WalletAddress;
            Status = usuarioAlterarDados.Status;

            Modificado = DateTime.UtcNow;
        }

        public static class Factory
        {
            public static Usuario Create(Usuario prototype)
            {
                return new Usuario
                {
                    Email = prototype.Email,
                    Nickname = prototype.Nickname,
                    WalletAddress = prototype.WalletAddress,
                    Status = EStatusUsuario.Ativo
                };
            }
        }
    }
}
