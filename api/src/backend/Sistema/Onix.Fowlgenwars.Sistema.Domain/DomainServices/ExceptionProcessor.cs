using System;
using System.Threading.Tasks;
using Onix.Framework.Domain.Interfaces;
using Onix.Fowlgenwars.Sistema.Domain.Entities;
using Onix.Fowlgenwars.Sistema.Domain.Interfaces;

namespace Onix.Fowlgenwars.Sistema.Domain.DomainServices
{
    public class ExceptionProcessor : IExceptionProcessor
    {
        private readonly ISistemaUnitOfWork _sistemaUnitOfWork;
        private readonly IExceptionLogRepository _exceptionLogRepository;

        public ExceptionProcessor(
            ISistemaUnitOfWork sitemaUnitOfWork,
            IExceptionLogRepository exceptionLogRepository)
        {
            _sistemaUnitOfWork = sitemaUnitOfWork;
            _exceptionLogRepository = exceptionLogRepository;
        }

        public void Salvar(Exception exception)
        {
            var errorDate = DateTime.Now;
            var id = Guid.NewGuid();
            var exceptionEntity = CreateExceptionLog(id, errorDate, exception);
            if (exception.InnerException != null)
            {
                var innerExceptionId = Guid.NewGuid();
                var innerException = CreateExceptionLog(innerExceptionId, errorDate, exception.InnerException, exceptionEntity);
                _exceptionLogRepository.Add(innerException);
            }
            else
            {
                _exceptionLogRepository.Add(exceptionEntity);
            }
            _sistemaUnitOfWork.Commit();
        }

        public async Task SalvarAsync(Exception exception)
        {
            var errorDate = DateTime.Now;
            var id = Guid.NewGuid();
            var exceptionEntity = CreateExceptionLog(id, errorDate, exception);
            if (exception.InnerException != null)
            {
                var innerExceptionId = Guid.NewGuid();
                var innerException = CreateExceptionLog(innerExceptionId, errorDate, exception.InnerException, exceptionEntity);
                await _exceptionLogRepository.AddAsync(innerException);
            }
            else
            {
                await _exceptionLogRepository.AddAsync(exceptionEntity);
            }
            await _sistemaUnitOfWork.CommitAsync();
        }

        private ExceptionLog CreateExceptionLog(Guid id, DateTime errorDate, Exception exception, ExceptionLog parent = null)
        {
            if (exception == null)
            {
                return null;
            }

            // Ensure StackTrace is not null for persistence; when exceptions are not thrown, StackTrace can be null.
            var stackTrace = exception.StackTrace ?? exception.ToString();
            return new ExceptionLog(id, errorDate, exception.Message, stackTrace, parent);

        }
    }
}