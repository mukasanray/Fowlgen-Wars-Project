using Newtonsoft.Json;
using UnityEngine.Scripting;

// ReSharper disable once CheckNamespace

/// <summary>
/// Sign-In-With-Solana input fields, passed as <c>sign_in_payload</c> on the
/// <c>authorize</c> request. Field names follow the Sign-In-With-Solana spec
/// (camelCase), NOT the MWA snake_case convention. All fields are optional and
/// omitted from the request when null.
/// </summary>
[Preserve]
public class SignInPayload
{
    [JsonProperty("domain", NullValueHandling = NullValueHandling.Ignore)]
    public string Domain { get; set; }

    [JsonProperty("address", NullValueHandling = NullValueHandling.Ignore)]
    public string Address { get; set; }

    [JsonProperty("statement", NullValueHandling = NullValueHandling.Ignore)]
    public string Statement { get; set; }

    [JsonProperty("uri", NullValueHandling = NullValueHandling.Ignore)]
    public string Uri { get; set; }

    [JsonProperty("version", NullValueHandling = NullValueHandling.Ignore)]
    public string Version { get; set; }

    [JsonProperty("chainId", NullValueHandling = NullValueHandling.Ignore)]
    public string ChainId { get; set; }

    [JsonProperty("nonce", NullValueHandling = NullValueHandling.Ignore)]
    public string Nonce { get; set; }

    [JsonProperty("issuedAt", NullValueHandling = NullValueHandling.Ignore)]
    public string IssuedAt { get; set; }

    [JsonProperty("expirationTime", NullValueHandling = NullValueHandling.Ignore)]
    public string ExpirationTime { get; set; }

    [JsonProperty("notBefore", NullValueHandling = NullValueHandling.Ignore)]
    public string NotBefore { get; set; }

    [JsonProperty("requestId", NullValueHandling = NullValueHandling.Ignore)]
    public string RequestId { get; set; }

    [JsonProperty("resources", NullValueHandling = NullValueHandling.Ignore)]
    public string[] Resources { get; set; }
}
