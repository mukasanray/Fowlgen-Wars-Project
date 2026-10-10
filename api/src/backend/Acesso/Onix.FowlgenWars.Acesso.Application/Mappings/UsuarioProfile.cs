using AutoMapper;
using Onix.FowlgenWars.Acesso.Application.ViewModels;
using Onix.FowlgenWars.Acesso.Domain.Entities;

namespace Onix.FowlgenWars.Acesso.Application.Mappings
{
    public class UsuarioProfile : Profile
    {
        public UsuarioProfile()
        {
            CreateMap<Usuario, UsuarioViewModel>().ReverseMap();
            CreateMap<UsuarioCreateViewModel, Usuario>();
        }
    }
}
