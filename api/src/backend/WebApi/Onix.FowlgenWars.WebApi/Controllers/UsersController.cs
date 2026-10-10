using  Onix.FowlgenWars.Acesso.Application.Interfaces;
using  Onix.Fowlgenwars.Acesso.Application.ViewModels.Registrar;
using Onix.Framework.WebApi.Controllers;
using Onix.Framework.Notifications.Interfaces;
using Onix.Framework.Domain.Interfaces;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace  Onix.FowlgenWars.WebApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : BaseController
    {
        private readonly IUsuarioAppService _appService;

        public UsersController(
            IUsuarioAppService appService, 
            INotificationContext notificationContext, 
            IExceptionProcessor exceptionProcessor) 
            : base(notificationContext, exceptionProcessor)
        {
            _appService = appService;
        }

        // Endpoint para o site do Junior
        [HttpPost]
        public async Task<IActionResult> RegisterUser([FromBody] RegistrarUsuarioViewModel viewModel)
        {
            return await TryExecuteAsync(_appService.CadastrarAsync(viewModel));
        }

        // Endpoint para o FishNet Server (MatchRewardManager)
        [HttpGet("{id}/wallet")]
        public async Task<IActionResult> GetUserWallet(Guid id)
        {
            // The FishNet server expects a payload containing the wallet
            return await TryExecuteAsync(_appService.GetUserWalletAsync(id));
        }

        // Endpoint de Login Web3 para o Frontend
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] Onix.FowlgenWars.Acesso.Application.ViewModels.LoginWalletViewModel viewModel)
        {
            return await TryExecuteAsync(_appService.LoginWalletAsync(viewModel));
        }
    }
}
