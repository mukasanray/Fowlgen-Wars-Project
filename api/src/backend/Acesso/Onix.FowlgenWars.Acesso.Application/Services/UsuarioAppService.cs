using AutoMapper;
using Microsoft.Extensions.Localization;
using Onix.Fowlgenwars.Core.Resources;
using Onix.Fowlgenwars.Acesso.Application.ViewModels.Registrar;
using Onix.FowlgenWars.Acesso.Application.Interfaces;
using Onix.FowlgenWars.Acesso.Application.ViewModels;
using Onix.FowlgenWars.Acesso.Domain.Entities;
using Onix.FowlgenWars.Acesso.Domain.Interfaces;
using Onix.Framework.Notifications.Implementation;
using Onix.Framework.Notifications.Interfaces;
using System;
using System.Threading.Tasks;
using System.Text;
using System.Security.Claims;
using System.Collections.Generic;
using Solnet.Wallet;
using Onix.Framework.Security.JwtConfig;

namespace  Onix.FowlgenWars.Acesso.Application.Services
{
    public class UsuarioAppService : IUsuarioAppService
    {
        private readonly INotificationContext notificationContext;
        private readonly IAcessosUnitOfWork acessosUnitOfWork;
        private readonly IUsuarioRepository usuarioRepository;
        private readonly IUsuarioValidator usuarioValidator;
        private readonly IMapper mapper;
        private readonly IStringLocalizer<TextResource> stringLocalizer;

        public UsuarioAppService(
            INotificationContext notificationContext,
            IAcessosUnitOfWork acessosUnitOfWork,
            IUsuarioRepository usuarioRepository,
            IUsuarioValidator usuarioValidator,
            IMapper mapper,
            IStringLocalizer<TextResource> stringLocalizer
        )
            {
            this.notificationContext = notificationContext;
            this.acessosUnitOfWork = acessosUnitOfWork;
            this.usuarioRepository = usuarioRepository;
            this.usuarioValidator = usuarioValidator;
            this.mapper = mapper;
            this.stringLocalizer = stringLocalizer;
        }

        public async Task<Guid> CadastrarAsync(RegistrarUsuarioViewModel model)
        {
            var prototype = mapper.Map<Usuario>(model);
            if (prototype == null)
            {
                var usuarioString = stringLocalizer.GetString("Usuario");
                notificationContext.AddError(stringLocalizer.GetString("ErroEntidadeInvalida", usuarioString));
                return default;
            }

            var usuario = Usuario.Factory.Create(prototype);
            if (await usuarioValidator.IsValid(usuario))
            {
                await usuarioRepository.Cadastrar(usuario);
                await acessosUnitOfWork.CommitAsync();
                notificationContext.AddSuccess(stringLocalizer.GetString("SucessoCriarUsuario"));

                return usuario.Id;
            }
            return default;
        }

        public async Task<string> GetUserWalletAsync(Guid id)
        {
            var usuario = await usuarioRepository.PesquisarPorIdAsync(id);
            if (usuario == null)
            {
                var usuarioString = stringLocalizer.GetString("Usuario");
                notificationContext.AddError(stringLocalizer.GetString("ObjetoNaoEncontrado", usuarioString));
                return null;
            }
            return usuario.WalletAddress;
        }

        public async Task<string> LoginWalletAsync(LoginWalletViewModel model)
        {
            try
            {
                var pubKey = new PublicKey(model.WalletAddress);
                byte[] messageBytes = Encoding.UTF8.GetBytes(model.Message);
                byte[] signatureBytes = Solnet.Wallet.Utilities.Encoders.Base58.DecodeData(model.Signature);

                bool isValid = pubKey.Verify(messageBytes, signatureBytes);
                if (!isValid)
                {
                    notificationContext.AddError("Assinatura inválida para a carteira fornecida.");
                    return null;
                }
            }
            catch (Exception ex)
            {
                notificationContext.AddError("Erro ao validar assinatura: " + ex.Message);
                return null;
            }

            var usuario = await usuarioRepository.PesquisarPorWalletAsync(model.WalletAddress);
            if (usuario == null)
            {
                notificationContext.AddError("Usuário não encontrado com esta carteira.");
                return null;
            }

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, usuario.Id.ToString()),
                new Claim(ClaimTypes.Name, usuario.Nickname),
                new Claim("WalletAddress", usuario.WalletAddress)
            };

            return JwtConfig.GerarAccessToken(claims);
        }
    }
}
