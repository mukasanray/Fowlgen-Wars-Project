using FluentValidation;
using Microsoft.Extensions.Localization;
using Onix.Framework.Notifications.Interfaces;
using Onix.Fowlgenwars.Core.Domain.Validators;
using System.Threading.Tasks;
using System;
using Onix.FowlgenWars.Acesso.Domain.Entities;
using Onix.FowlgenWars.Acesso.Domain.Interfaces;
using Onix.Fowlgenwars.Core.Resources;
namespace Onix.Fowlgenwars.Acesso.Domain.Validators
{
    public class UsuarioValidator : BaseValidator<Usuario>, IUsuarioValidator
    {
        private readonly IUsuarioRepository _usuarioRepository;
        private readonly IStringLocalizer<TextResource> _stringLocalizer;

        public UsuarioValidator(
            INotificationContext notificationContext,
            IUsuarioRepository usuarioRepository,
            IStringLocalizer<TextResource> stringLocalizer)
            : base(notificationContext)
        {
            _usuarioRepository = usuarioRepository;
            _stringLocalizer = stringLocalizer;


            RuleFor(x => x.Id)
                .NotEqual(Guid.Empty);

            RuleFor(x => x.Nickname)
                .NotEmpty()
                .MinimumLength(2)
                .MaximumLength(128)
                .WithMessage(_stringLocalizer?.GetString("ErroUsuarioNomeTamanho"));

            RuleFor(x => x.Email)
                .NotEmpty()
                .EmailAddress()
                .MaximumLength(256)
                .WithMessage(_stringLocalizer?.GetString("ErroEmailInvalido"));
        }
        
        public async Task<bool> IsValid(Usuario usuario)
        {
            if (usuario == null) return false;

            var validationResults = Validate(usuario);
            ProcessValidationResults(validationResults);
            return !NotificationContext.HasErrors;
        }
    }
}
