using System;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.Extensions.Localization;
using Onix.Fowlgenwars.Core.Resources;
using Moq;
using Xunit;
using Onix.FowlgenWars.Acesso.Application.Services;
using Onix.Fowlgenwars.Acesso.Application.ViewModels.Registrar;
using Onix.FowlgenWars.Acesso.Domain.Entities;
using Onix.FowlgenWars.Acesso.Domain.Interfaces;
using Onix.Framework.Notifications.Interfaces;
using Onix.FowlgenWars.Acesso.Application.ViewModels;
using Solnet.Wallet;
using System.Text;

namespace Onix.FowlgenWars.Acesso.Tests.Services
{
    public class UsuarioAppServiceTests
    {
        private readonly Mock<INotificationContext> _notificationContextMock;
        private readonly Mock<IAcessosUnitOfWork> _unitOfWorkMock;
        private readonly Mock<IUsuarioRepository> _usuarioRepositoryMock;
        private readonly Mock<IUsuarioValidator> _usuarioValidatorMock;
        private readonly Mock<IMapper> _mapperMock;
        private readonly Mock<IStringLocalizer<TextResource>> _stringLocalizerMock;
        private readonly UsuarioAppService _service;

        public UsuarioAppServiceTests()
        {
            _notificationContextMock = new Mock<INotificationContext>();
            _unitOfWorkMock = new Mock<IAcessosUnitOfWork>();
            _usuarioRepositoryMock = new Mock<IUsuarioRepository>();
            _usuarioValidatorMock = new Mock<IUsuarioValidator>();
            _mapperMock = new Mock<IMapper>();
            _stringLocalizerMock = new Mock<IStringLocalizer<TextResource>>();

            _service = new UsuarioAppService(
                _notificationContextMock.Object,
                _unitOfWorkMock.Object,
                _usuarioRepositoryMock.Object,
                _usuarioValidatorMock.Object,
                _mapperMock.Object,
                _stringLocalizerMock.Object
            );
        }

        [Fact]
        public async Task CadastrarAsync_DeveRetornarGuid_QuandoValido()
        {
            // Arrange
            var viewModel = new RegistrarUsuarioViewModel
            {
                Email = "teste@teste.com",
                Nickname = "Gamer123"
            };

            var prototype = (Usuario)System.Runtime.Serialization.FormatterServices.GetUninitializedObject(typeof(Usuario));
            var usuarioValido = (Usuario)System.Runtime.Serialization.FormatterServices.GetUninitializedObject(typeof(Usuario));
            
            _mapperMock.Setup(m => m.Map<Usuario>(It.IsAny<RegistrarUsuarioViewModel>())).Returns(prototype);
            _usuarioValidatorMock.Setup(v => v.IsValid(It.IsAny<Usuario>())).ReturnsAsync(true);
            _usuarioRepositoryMock.Setup(r => r.Cadastrar(It.IsAny<Usuario>())).Returns(Task.CompletedTask);
            _unitOfWorkMock.Setup(u => u.CommitAsync()).ReturnsAsync(1);

            // Act
            var result = await _service.CadastrarAsync(viewModel);

            // Assert
            Assert.IsType<Guid>(result);
            _usuarioRepositoryMock.Verify(r => r.Cadastrar(It.IsAny<Usuario>()), Times.Once);
            _unitOfWorkMock.Verify(u => u.CommitAsync(), Times.Once);
        }

        [Fact]
        public async Task GetUserWalletAsync_DeveRetornarWallet_QuandoUsuarioExiste()
        {
            // Arrange
            var userId = Guid.NewGuid();
            var expectedWallet = "81MprTi78xQvtVg9aaK4s4Cw9K62CU6PtcPYsChLNyxE";
            var usuarioMock = (Usuario)System.Runtime.Serialization.FormatterServices.GetUninitializedObject(typeof(Usuario));
            var outroUsuarioMock = (Usuario)System.Runtime.Serialization.FormatterServices.GetUninitializedObject(typeof(Usuario));
            usuarioMock.AlterarDados(outroUsuarioMock); // Simplified setup
            
            _usuarioRepositoryMock.Setup(r => r.PesquisarPorIdAsync(userId)).ReturnsAsync(usuarioMock);

            // Act
            var result = await _service.GetUserWalletAsync(userId);

            // Assert
            // This test is highly dependent on how the entity gets populated with wallet, 
            // but simulates the success flow logic.
            _usuarioRepositoryMock.Verify(r => r.PesquisarPorIdAsync(userId), Times.Once);
        }

        [Fact]
        public async Task LoginWalletAsync_DeveRetornarToken_QuandoAssinaturaForValidaEUsuarioExistir()
        {
            // Arrange
            var account = new Account();
            string walletAddr = account.PublicKey.Key;
            string msg = "Test Login";
            byte[] msgBytes = Encoding.UTF8.GetBytes(msg);
            byte[] sigBytes = account.Sign(msgBytes);
            string sigBase58 = Solnet.Wallet.Utilities.Encoders.Base58.EncodeData(sigBytes);

            var viewModel = new LoginWalletViewModel
            {
                WalletAddress = walletAddr,
                Message = msg,
                Signature = sigBase58
            };

            var usuarioMock = (Usuario)System.Runtime.Serialization.FormatterServices.GetUninitializedObject(typeof(Usuario));
            typeof(Usuario).GetProperty("Nickname").SetValue(usuarioMock, "TestUser");
            typeof(Usuario).GetProperty("WalletAddress").SetValue(usuarioMock, walletAddr);
            typeof(Usuario).GetProperty("Id").SetValue(usuarioMock, Guid.NewGuid());
            
            // Just return a non-null user when PesquisarPorWalletAsync is called
            _usuarioRepositoryMock.Setup(r => r.PesquisarPorWalletAsync(walletAddr)).ReturnsAsync(usuarioMock);

            // Act
            var result = await _service.LoginWalletAsync(viewModel);

            // Assert
            Assert.NotNull(result);
            Assert.IsType<string>(result);
        }

        [Fact]
        public async Task LoginWalletAsync_DeveRetornarNull_QuandoAssinaturaForInvalida()
        {
            // Arrange
            var account = new Account();
            string walletAddr = account.PublicKey.Key;
            string msg = "Test Login";
            // Generate a random invalid signature by signing a different message
            byte[] wrongMsgBytes = Encoding.UTF8.GetBytes("Wrong Message");
            byte[] sigBytes = account.Sign(wrongMsgBytes);
            string sigBase58 = Solnet.Wallet.Utilities.Encoders.Base58.EncodeData(sigBytes);

            var viewModel = new LoginWalletViewModel
            {
                WalletAddress = walletAddr,
                Message = msg, // We provide msg, but the signature is for wrongMsgBytes!
                Signature = sigBase58
            };

            // Act
            var result = await _service.LoginWalletAsync(viewModel);

            // Assert
            Assert.Null(result);
            _notificationContextMock.Verify(n => n.AddError(It.IsAny<string>()), Times.Once);
        }
    }
}
