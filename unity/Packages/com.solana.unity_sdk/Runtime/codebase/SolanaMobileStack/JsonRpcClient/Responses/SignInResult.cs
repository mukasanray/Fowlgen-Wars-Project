using Newtonsoft.Json;
using UnityEngine.Scripting;

// ReSharper disable once CheckNamespace

/// <summary>
/// Sign-In-With-Solana result. Returned natively in the <c>authorize</c> response
/// (<c>sign_in_result</c>) when the wallet supports SIWS, or assembled by the SDK
/// from a <c>sign_messages</c> fallback when it doesn't. <see cref="SignedMessage"/>
/// and <see cref="Signature"/> are base64-encoded; <see cref="SignatureType"/>
/// defaults to "ed25519" when the wallet omits it.
/// </summary>
[Preserve]
public class SignInResult
{
    [JsonProperty("address")]
    public string Address { get; set; }

    [JsonProperty("signed_message")]
    public string SignedMessage { get; set; }

    [JsonProperty("signature")]
    public string Signature { get; set; }

    [JsonProperty("signature_type")]
    public string SignatureType { get; set; }
}
