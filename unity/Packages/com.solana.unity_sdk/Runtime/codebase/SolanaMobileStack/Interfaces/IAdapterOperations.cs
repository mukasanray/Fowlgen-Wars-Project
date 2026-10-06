using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using UnityEngine.Scripting;

// ReSharper disable once CheckNamespace

[Preserve]
public interface IAdapterOperations
{
    [Preserve]
    // chain: optional CAIP-2 identifier (e.g. "solana:devnet") for MWA 2.0 wallets.
    // signInPayload: optional Sign-In-With-Solana input fields (SIWS).
    public Task<AuthorizationResult> Authorize(Uri identityUri, Uri iconUri, string identityName, string rpcCluster, string chain = null, SignInPayload signInPayload = null);
    [Preserve]
    // rpcCluster/chain: MWA 2.0 requires the network identifier on reauthorize too.
    // The spec deprecates the standalone reauthorize in favour of authorize carrying an
    // auth_token; when chain is absent the wallet (e.g. Seeker Seed Vault) defaults the
    // re-established session to solana:mainnet, causing a "Network mismatch" at sign time.
    public Task<AuthorizationResult> Reauthorize(Uri identityUri, Uri iconUri, string identityName, string authToken, string rpcCluster = null, string chain = null);
    [Preserve]
    public Task Deauthorize(string authToken);
    [Preserve]
    public Task<CapabilitiesResult> GetCapabilities();
    [Preserve]
    public Task<SignedResult> SignTransactions(IEnumerable<byte[]> transactions);
    [Preserve]
    public Task<SignAndSendResult> SignAndSendTransactions(IEnumerable<byte[]> transactions, SignAndSendTransactionsOptions options = null);
    [Preserve]
    public Task<CloneAuthorizationResult> CloneAuthorization();
    [Preserve]
    public Task<SignedResult> SignMessages(IEnumerable<byte[]> messages, IEnumerable<byte[]> addresses);
}