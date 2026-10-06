using System;
using System.Collections.Generic;
using Newtonsoft.Json;
using UnityEngine.Scripting;

// ReSharper disable once CheckNamespace

[Preserve]
public class AuthorizationResult {

    public class AuthorizationResultAccounts
    {
        // base64-encoded public key for this account.
        [JsonProperty("address")]
        [RequiredMember]
        public string Address { get; set; }

        [JsonProperty("display_address")]
        [RequiredMember]
        public string DisplayAddress { get; set; }

        [JsonProperty("display_address_format")]
        [RequiredMember]
        public string DisplayAddressFormat { get; set; }

        [JsonProperty("label")]
        [RequiredMember]
        public string Label { get; set; }

        [JsonProperty("icon")]
        [RequiredMember]
        public string Icon { get; set; }

        [JsonProperty("chains")]
        [RequiredMember]
        public List<string> Chains { get; set; }

        [JsonProperty("features")]
        [RequiredMember]
        public List<string> Features { get; set; }
    }

    [JsonProperty("auth_token")]
    [RequiredMember]
    public string AuthToken { get; set; }
    
    [JsonProperty("wallet_uri_base")]
    [RequiredMember]
    public Uri WalletUriBase { get; set; }

    [JsonProperty("wallet_icon")]
    [RequiredMember]
    public string WalletIcon { get; set; }

    [JsonProperty("accounts")]
    [RequiredMember]
    public List<AuthorizationResultAccounts> Accounts { get; set; }

    [JsonProperty("sign_in_result")]
    [RequiredMember]
    public SignInResult SignInResult { get; set; }
    
    [RequiredMember]
    public byte[] PublicKey => Accounts is { Count: > 0 } ? Convert.FromBase64String(Accounts[0].Address) : null;

    [RequiredMember]
    public string AccountLabel => Accounts is { Count: > 0 } ? Accounts[0].Label : string.Empty;
}