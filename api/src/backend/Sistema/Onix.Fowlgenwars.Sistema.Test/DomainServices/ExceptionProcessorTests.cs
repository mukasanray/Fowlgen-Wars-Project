using System;
using System.Threading.Tasks;
using Onix.Framework.Domain.Interfaces;
using Onix.Fowlgenwars.Sistema.Domain.Interfaces;
using Xunit;

namespace Onix.Fowlgenwars.Sistema.Tests.DomainServices
{
    public class ExceptionProcessorTests
    {
        private readonly IExceptionLogRepository _exceptionLogRepository;
        private readonly IExceptionProcessor _exceptionProcessor;

        public ExceptionProcessorTests(
            IExceptionLogRepository exceptionLogRepository,
            IExceptionProcessor exceptionProcessor)
        {
            _exceptionLogRepository = exceptionLogRepository;
            _exceptionProcessor = exceptionProcessor;
        }

        [Fact]
        public async Task Deve_salvar_ExceptionLog_com_inner_exception()
        {
            var innerExceptionMessage = $"Test Inner {DateTime.Now.Ticks}";
            var exceptionMessage = $"Exception {DateTime.Now.Ticks}";
            var innerException = new Exception(innerExceptionMessage);
            var exception = new Exception(exceptionMessage, innerException);
            await _exceptionProcessor.SalvarAsync(exception);
            var innerExceptionEntity = await _exceptionLogRepository.ByMessage(innerExceptionMessage);
            var exceptionEntity = await _exceptionLogRepository.ByMessage(exceptionMessage);
            Assert.NotNull(innerExceptionEntity);
            Assert.NotNull(exceptionEntity);
            Assert.Equal(exceptionEntity.Id, innerExceptionEntity.ParentId);
        }

        [Fact]
        public async Task Deve_salvar_ExceptionLog_sem_inner_exception()
        {
            var exceptionMessage = $"Exception {DateTime.Now.Ticks}";
            var exception = new Exception(exceptionMessage);
            await _exceptionProcessor.SalvarAsync(exception);
            var exceptionEntity = await _exceptionLogRepository.ByMessage(exceptionMessage);
            Assert.NotNull(exceptionEntity);
            Assert.Null(exceptionEntity.ParentId);
        }
    }
}