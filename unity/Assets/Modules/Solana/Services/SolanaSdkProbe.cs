using System;
using System.Reflection;

namespace FowlgenWars.Solana
{
    /// <summary>
    /// Detects whether a Solana Unity SDK assembly is loaded.
    /// Does not assume a specific vendor package name.
    /// </summary>
    public static class SolanaSdkProbe
    {
        public static bool IsSdkAssemblyLoaded(out string detail)
        {
            foreach (var assembly in UnityEngine.Assemblies.CurrentAssemblies.GetLoadedAssemblies())
            {
                string name = assembly.GetName().Name;
                if (string.IsNullOrEmpty(name))
                    continue;

                if (name.StartsWith("Solana.Unity", StringComparison.OrdinalIgnoreCase)
                    || name.Equals("Solana", StringComparison.OrdinalIgnoreCase)
                    || name.IndexOf("SolanaUnity", StringComparison.OrdinalIgnoreCase) >= 0)
                {
                    detail = name;
                    return true;
                }
            }

            string[] knownTypes =
            {
                "Solana.Unity.Rpc.SolanaRpcClient, Solana.Unity.Rpc",
                "Solana.Unity.SDK.Solana, Assembly-CSharp",
                "Solana.Unity.Wallet.Account, Solana.Unity.Wallet"
            };

            foreach (string typeName in knownTypes)
            {
                Type type = Type.GetType(typeName, false);
                if (type != null)
                {
                    detail = type.FullName;
                    return true;
                }
            }

            detail = "not in loaded assemblies";
            return false;
        }
    }
}
