using System;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using UnityEngine.Scripting;

// ReSharper disable once CheckNamespace

[Preserve]
public class CapabilitiesResult
{
    // MWA 2.0 feature identifiers (verbatim from the spec).
    // Mandatory — always available, deliberately NOT advertised in Features:
    public const string FeatureSignMessages = "solana:signMessages";
    public const string FeatureSignAndSendTransaction = "solana:signAndSendTransaction";
    
    // Optional — present in Features[] only when the wallet supports them:
    public const string FeatureSignInWithSolana = "solana:signInWithSolana";
    public const string FeatureCloneAuthorization = "solana:cloneAuthorization";
    
    // Deprecated in 2.0, but some wallets still advertise it:
    public const string FeatureSignTransactions = "solana:signTransactions";

    /// <summary>
    /// MWA 2.0: identifiers of the OPTIONAL features this wallet supports.
    /// Mandatory features (<see cref="FeatureSignMessages"/>,
    /// <see cref="FeatureSignAndSendTransaction"/>) are NOT listed here per spec —
    /// assume them present. Null/absent on pre-2.0 wallets.
    /// </summary>
    [JsonProperty("features")]
    public string[] Features { get; set; }

    [JsonProperty("max_transactions_per_request")]
    public int? MaxTransactionsPerRequest { get; set; }

    [JsonProperty("max_messages_per_request")]
    public int? MaxMessagesPerRequest { get; set; }

    /// <summary>
    /// Solana transaction formats supported by the wallet. The wire value is a
    /// MIXED array of strings and numbers (e.g. <c>"legacy"</c> and <c>0</c>), so
    /// each element is normalized to its string form on read.
    /// </summary>
    [JsonProperty("supported_transaction_versions")]
    [JsonConverter(typeof(MixedStringArrayConverter))]
    public string[] SupportedTransactionVersions { get; set; }

    /// <summary>
    /// Deprecated 1.x boolean. Removed from the 2.0 spec (replaced by the
    /// <see cref="Features"/> list) but still deserialized as a fallback for 1.x
    /// wallets that send it. Prefer the <see cref="SupportsCloneAuthorization"/>
    /// predicate over reading this directly.
    /// </summary>
    [JsonProperty("supports_clone_authorization")]
    public bool? SupportsCloneAuthorizationLegacy { get; set; }

    /// <summary>
    /// True when the wallet supports <c>clone_authorization</c> — via the 2.0
    /// feature identifier or the 1.x legacy boolean.
    /// </summary>
    [JsonIgnore]
    public bool SupportsCloneAuthorization =>
        HasFeature(FeatureCloneAuthorization) || (SupportsCloneAuthorizationLegacy ?? false);

    /// <summary>True when the wallet advertises native Sign-In With Solana.</summary>
    [JsonIgnore]
    public bool SupportsSignInWithSolana => HasFeature(FeatureSignInWithSolana);

    /// <summary>
    /// Whether <paramref name="featureId"/> appears in <see cref="Features"/>.
    /// Use the <c>Feature*</c> constants for the known identifiers.
    /// </summary>
    public bool HasFeature(string featureId) =>
        Features != null && Array.IndexOf(Features, featureId) >= 0;
}

/// <summary>
/// Reads a JSON array whose elements may be strings OR numbers into a
/// <c>string[]</c>, normalizing every element to its string form. MWA's
/// <c>supported_transaction_versions</c> mixes <c>"legacy"</c> with numeric
/// versions like <c>0</c>, which a plain <c>string[]</c> binding would not
/// reliably accept across Newtonsoft versions.
/// </summary>
[Preserve]
internal sealed class MixedStringArrayConverter : JsonConverter
{
    public override bool CanConvert(Type objectType) => objectType == typeof(string[]);

    public override object ReadJson(JsonReader reader, Type objectType, object existingValue,
        JsonSerializer serializer)
    {
        if (reader.TokenType == JsonToken.Null)
            return null;

        var array = JArray.Load(reader);
        var result = new string[array.Count];
        for (var i = 0; i < array.Count; i++)
        {
            var token = array[i];
            switch (token.Type)
            {
                case JTokenType.Null:
                    result[i] = null;
                    break;
                case JTokenType.String:
                case JTokenType.Integer:
                case JTokenType.Float:
                    result[i] = token.ToString();
                    break;
                default:
                    throw new JsonSerializationException(
                        $"Expected a string or number element but got {token.Type} at index {i}.");
            }
        }
        return result;
    }

    public override void WriteJson(JsonWriter writer, object value, JsonSerializer serializer)
    {
        if (value == null)
        {
            writer.WriteNull();
            return;
        }
        writer.WriteStartArray();
        foreach (var item in (string[])value)
            writer.WriteValue(item);
        writer.WriteEndArray();
    }
}
