using Newtonsoft.Json;
using UnityEngine.Scripting;

// ReSharper disable once CheckNamespace

/// <summary>
/// Result of <c>clone_authorization</c>: a new <c>auth_token</c> that grants the
/// same authorization, intended to be transferred to another instance of the dapp.
/// </summary>
[Preserve]
public class CloneAuthorizationResult
{
    [JsonProperty("auth_token")]
    [RequiredMember]
    public string AuthToken { get; set; }
}
