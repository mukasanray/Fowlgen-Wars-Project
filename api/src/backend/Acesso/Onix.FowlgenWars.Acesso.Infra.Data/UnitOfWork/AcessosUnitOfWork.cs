using Onix.FowlgenWars.Acesso.Domain.Interfaces;
using Onix.FowlgenWars.Acesso.Infra.Data.Context;
using Onix.Framework.Infra.Data.EFCore;

namespace Onix.FowlgenWars.Acesso.Infra.Data.UnitOfWork
{
    public class AcessosUnitOfWork(AcessosDbContext context) : EFCoreUnitOfWork(context), IAcessosUnitOfWork
    {
        
    }
}
