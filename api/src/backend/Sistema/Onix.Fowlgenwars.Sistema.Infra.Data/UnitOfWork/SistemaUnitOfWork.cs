using Onix.Fowlgenwars.Sistema.Domain.Interfaces;
using Onix.Fowlgenwars.Sistema.Infra.Data.Context;
using Onix.Framework.Infra.Data.EFCore;

namespace Onix.Fowlgenwars.Sistema.Infra.Data.UnitOfWork
{
    public class SistemaUnitOfWork(SistemaDbContext context) : EFCoreUnitOfWork(context), ISistemaUnitOfWork
    {
        
    }
}
