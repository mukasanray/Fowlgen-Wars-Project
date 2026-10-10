using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Onix.Fowlgenwars.Sistema.Domain.Entities;

namespace Onix.Fowlgenwars.Sistema.Infra.Data.EntityConfig
{
    public class ExceptionLogConfig : IEntityTypeConfiguration<ExceptionLog>
    {
        public void Configure(EntityTypeBuilder<ExceptionLog> builder)
        {
            builder.HasKey(c => c.Id);

            builder.Property(x => x.ErrorDate)
            .IsRequired();

            builder.Property(x => x.Message)
            .IsRequired()
            .HasColumnType("text");

            builder.Property(x => x.StackTrace)
            .IsRequired()
            .HasColumnType("text");

            builder
            .HasOne(x => x.Parent)
            .WithOne()
            .IsRequired(false)
            .HasForeignKey(typeof(ExceptionLog), "ParentId");

            builder.ToTable("ExceptionLog");
        }
    }
}
