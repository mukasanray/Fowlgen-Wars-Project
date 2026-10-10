using Microsoft.EntityFrameworkCore.Migrations;
using System;
using System.Collections.Generic;

namespace Onix.FowlgenWars.Acesso.Infra.Data.Migrations.Data
{
    internal static class CreateAcessoData
    {
        internal static void Migrate(MigrationBuilder migrationBuilder)
        {
            // Perfil
            var colunasTabelaPerfil = GetColunasTabelaPerfil();
            foreach (var item in PerfilData)
            {
                migrationBuilder.InsertData("Perfil", colunasTabelaPerfil, item);
            }

            // Permissao
            var colunasTabelaPermissao = GetColunasTabelaPermissao();
            foreach (var item in PermissaoData)
            {
                migrationBuilder.InsertData("Permissao", colunasTabelaPermissao, item);
            }

            // PerfilPermissao
            var colunasTabelaPerfilPermissao = GetColunasTabelaPerfilPermissao();
            foreach (var item in PerfilPermissaoData)
            {
                migrationBuilder.InsertData("PerfilPermissao", colunasTabelaPerfilPermissao, item);
            }

            // Usuario
            var colunasTabelaUsuario = GetColunasTabelaUsuario();
            foreach (var item in UsuarioData)
            {
                migrationBuilder.InsertData("Usuario", colunasTabelaUsuario, item);
            }
        }

        #region Perfil
        private static string[] GetColunasTabelaPerfil()
        {
            return new[] { "Id", "Nome", "Status" };
        }

        private static List<object[]> PerfilData => new()
        {
            new object[] { 1, "Admin", 1 },
            new object[] { 2, "Cliente", 1 },
        };
        #endregion Perfil

        #region Permissao
        private static string[] GetColunasTabelaPermissao()
        {
            return new[] { "Id", "Nome", "Status" };
        }

        private static List<object[]> PermissaoData => new()
        {
            new object[] { 1,  "CadastrarPerfil", 1 },
            new object[] { 2,  "AlterarPerfil", 1 },
            new object[] { 3,  "PesquisarPerfil", 1 },
            new object[] { 4,  "AlterarStatusPerfil", 1 },
            new object[] { 5,  "PaginarPerfil", 1 },
            new object[] { 6,  "CadastrarPerfilPermissao", 1 },
            new object[] { 7,  "RemoverPerfilPermissao", 1 },
            new object[] { 8,  "PesquisarPerfilPermissao", 1 },
            new object[] { 9,  "CadastrarPermissao", 1 },
            new object[] { 10, "AlterarPermissao", 1 },
            new object[] { 11, "PesquisarPermissao", 1 },
            new object[] { 12, "AlterarStatusPermissao", 1 },
            new object[] { 13, "PaginarPermissao", 1 },
            new object[] { 14, "ObterPerfilUsuario", 1 },
            new object[] { 15, "AlterarPerfilUsuario", 1 },
            new object[] { 16, "CadastrarUsuario", 1 },
            new object[] { 17, "AlterarUsuario", 1 },
            new object[] { 18, "PesquisarUsuario", 1 },
            new object[] { 19, "AlterarStatusUsuario", 1 },
            new object[] { 20, "PaginarUsuario", 1 },
        };
        #endregion Permissao

        #region PerfilPermissao
        private static string[] GetColunasTabelaPerfilPermissao()
        {
            return new[] { "PerfilId", "PermissaoId" };
        }

        private static List<object[]> PerfilPermissaoData => new()
        {
            new object[] { 1, 1 }, new object[] { 1, 2 }, new object[] { 1, 3 }, new object[] { 1, 4 }, new object[] { 1, 5 },
            new object[] { 1, 6 }, new object[] { 1, 7 }, new object[] { 1, 8 }, new object[] { 1, 9 }, new object[] { 1, 10 },
            new object[] { 1, 11 }, new object[] { 1, 12 }, new object[] { 1, 13 }, new object[] { 1, 14 }, new object[] { 1, 15 },
            new object[] { 1, 16 }, new object[] { 1, 17 }, new object[] { 1, 18 }, new object[] { 1, 19 }, new object[] { 1, 20 }
        };
        #endregion PerfilPermissao

        #region Usuario
        private static string[] GetColunasTabelaUsuario()
        {
            // Ajustado para refletir a Entidade atual (Nickname e WalletAddress omitido pois permite null default)
            return new[] { "Id", "PerfilId", "Nickname", "Email", "Status", "CreatedAt" };
        }

        public static readonly Guid AdminUserId = new("d4c45e5b-4364-4cd9-9f7b-c68a3ae3a7e8");
        private static List<object[]> UsuarioData => new()
        {
            new object[] 
            { 
                AdminUserId, 
                1, 
                "Admin", 
                "admin@test.com",
                1, 
                new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            }
        };
        #endregion Usuario
    }
}
