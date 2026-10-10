using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Onix.Fowlgenwars.Sistema.Infra.Data.Migrations
{
    /// <inheritdoc />
    public partial class CreateSistema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ExceptionLog",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ErrorDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Message = table.Column<string>(type: "text", nullable: false),
                    StackTrace = table.Column<string>(type: "text", nullable: false),
                    ParentId = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ExceptionLog", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ExceptionLog_ExceptionLog_ParentId",
                        column: x => x.ParentId,
                        principalTable: "ExceptionLog",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_ExceptionLog_ParentId",
                table: "ExceptionLog",
                column: "ParentId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ExceptionLog");
        }
    }
}
