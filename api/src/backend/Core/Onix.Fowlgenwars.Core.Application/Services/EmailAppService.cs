using Onix.Fowlgenwars.Core.Application.Interfaces;
using Onix.Fowlgenwars.Core.Application.ViewModels;
using System;
using System.Threading.Tasks;

namespace Onix.Fowlgenwars.Core.Application.Services
{
    public class EmailAppService : IEmailAppService
    {
        public Task<bool> EnviarEmailAsync(EmailViewModel emailViewModel)
        {
            // TODO: Implementar integração com serviço de email (SendGrid, SMTP, etc.)
            // Por enquanto, apenas simula o envio
            Console.WriteLine($"Enviando email para {emailViewModel.Destinatario} com assunto: {emailViewModel.Assunto}");
            
            return Task.FromResult(true);
        }

        public Task<bool> EnviarEmailConfirmacaoAsync(EmailConfirmacaoViewModel emailConfirmacaoViewModel)
        {
            var emailViewModel = new EmailViewModel
            {
                Destinatario = emailConfirmacaoViewModel.Destinatario,
                Assunto = "Confirme seu cadastro - Fowlgenwars",
                Corpo = GerarCorpoEmailConfirmacao(emailConfirmacaoViewModel.NomeUsuario, emailConfirmacaoViewModel.TokenConfirmacao)
            };
            
            return EnviarEmailAsync(emailViewModel);
        }

        public Task<bool> EnviarEmailRedefinicaoSenhaAsync(EmailRedefinicaoSenhaViewModel emailRedefinicaoSenhaViewModel)
        {
            var emailViewModel = new EmailViewModel
            {
                Destinatario = emailRedefinicaoSenhaViewModel.Destinatario,
                Assunto = "Redefinição de senha - Fowlgenwars",
                Corpo = GerarCorpoEmailRedefinicaoSenha(emailRedefinicaoSenhaViewModel.NomeUsuario, emailRedefinicaoSenhaViewModel.TokenRedefinicao)
            };
            
            return EnviarEmailAsync(emailViewModel);
        }

        private static string GerarCorpoEmailConfirmacao(string nomeUsuario, string tokenConfirmacao)
        {
            return $@"
                <html>
                <body>
                    <h2>Bem-vindo ao Fowlgenwars, {nomeUsuario}!</h2>
                    <p>Para confirmar seu cadastro, clique no link abaixo:</p>
                    <p><a href='https://Fowlgenwars.com/confirmar-email?token={tokenConfirmacao}'>Confirmar Email</a></p>
                    <p>Se você não solicitou este cadastro, ignore este email.</p>
                    <br/>
                    <p>Atenciosamente,<br/>Equipe Fowlgenwars</p>
                </body>
                </html>
            ";
        }

        private static string GerarCorpoEmailRedefinicaoSenha(string nomeUsuario, string tokenRedefinicao)
        {
            return $@"
                <html>
                <body>
                    <h2>Olá, {nomeUsuario}!</h2>
                    <p>Recebemos uma solicitação para redefinir sua senha.</p>
                    <p>Para redefinir sua senha, clique no link abaixo:</p>
                    <p><a href='https://Fowlgenwars.com/redefinir-senha?token={tokenRedefinicao}'>Redefinir Senha</a></p>
                    <p>Se você não solicitou a redefinição de senha, ignore este email.</p>
                    <br/>
                    <p>Atenciosamente,<br/>Equipe Fowlgenwars</p>
                </body>
                </html>
            ";
        }
    }
}
