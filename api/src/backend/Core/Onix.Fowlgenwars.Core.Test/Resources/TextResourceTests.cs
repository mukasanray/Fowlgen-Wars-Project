using System.Globalization;
using Microsoft.Extensions.Localization;
using Onix.Fowlgenwars.Core.Resources;
using Xunit;

namespace Onix.Fowlgenwars.Core.Tests.Resources
{
    public class ResourcesTests
    {
        private readonly IStringLocalizer<TextResource> _localizer;

        public ResourcesTests(IStringLocalizer<TextResource> localizer)
        {
            _localizer = localizer;
        }

        [Fact]
        public void Deve_retornar_string_Nome_pt_BR()
        {
            CultureInfo.CurrentUICulture = CultureInfo.CreateSpecificCulture("pt-BR");
            var nomePt = _localizer["Nome"];
            Assert.Equal("Nome", nomePt);
        }


        [Fact]
        public void Deve_retornar_string_Nome_en_US()
        {
            CultureInfo.CurrentUICulture = CultureInfo.CreateSpecificCulture("en-US");
            var nomeEn = _localizer["Nome"];
            Assert.Equal("Nome", nomeEn);
        }

        [Fact]
        public void Deve_retornar_string_Nome_es()
        {
            CultureInfo.CurrentUICulture = CultureInfo.CreateSpecificCulture("es");
            var nomeEs = _localizer["Nome"];
            Assert.Equal("Nome", nomeEs);
        }
    }
}