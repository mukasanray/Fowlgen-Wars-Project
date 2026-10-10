using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Onix.FowlgenWars.Acesso.Domain.Entities;
using Onix.FowlgenWars.Acesso.Domain.Enums;

namespace Onix.FowlgenWars.Acesso.Infra.Data.EntityConfig
{
    public class UsuarioConfiguration : IEntityTypeConfiguration<Usuario>
    {
        public void Configure(EntityTypeBuilder<Usuario> builder)
        {
            builder.HasKey(c => c.Id);

            builder.Property(c => c.Nickname)
                .IsRequired()
                .HasMaxLength(200);

            builder.Property(c => c.Email)
                .IsRequired()
                .HasMaxLength(200);
            
            builder.HasIndex(c => c.Email)
                .IsUnique();

            builder.Property(c => c.WalletAddress)
                .HasMaxLength(64);

            builder.Property(x => x.Status)
                .IsRequired()
                .HasDefaultValue(EStatusUsuario.Inativo)
                .HasColumnType("smallint");

            builder.Property(x => x.CreatedAt)
                .IsRequired();

            builder.ToTable("Usuario");
        }
    }
}
