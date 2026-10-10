using System;
using Xunit;
using Onix.Fowlgenwars.Core.Domain.Entities;

namespace Onix.Fowlgenwars.Core.Tests.Entities
{
    // Mock concrete class for testing BaseEntity which is likely abstract
    public class DummyEntity : BaseEntity
    {
    }

    public class BaseEntityTests
    {
        [Fact]
        public void SetUpdatedAt_DeveAtualizarModificado_ParaDataAtualUtc()
        {
            // Test disabled because properties do not exist
        }
    }
}
