using System;
using System.Collections.Generic;
using Newtonsoft.Json;
using UnityEngine.Scripting;

// ReSharper disable once CheckNamespace

/// <summary>
/// Result of <c>sign_and_send_transactions</c>: the base64-encoded transaction
/// signatures for the payloads the wallet signed AND submitted to the network.
/// </summary>
[Preserve]
public class SignAndSendResult
{
    [JsonProperty("signatures")]
    [RequiredMember]
    public List<string> Signatures { get; set; }

    /// <summary>The signatures decoded to raw bytes, or null when none were returned.</summary>
    [RequiredMember]
    public List<byte[]> SignatureBytes
    {
        get
        {
            if (Signatures is not { Count: > 0 })
                return null;

            var bytes = new List<byte[]>(Signatures.Count);
            for (var i = 0; i < Signatures.Count; i++)
            {
                var sig = Signatures[i];
                if (string.IsNullOrEmpty(sig))
                    throw new JsonSerializationException(
                        $"sign_and_send signature at index {i} was null or empty.");
                try
                {
                    bytes.Add(Convert.FromBase64String(sig));
                }
                catch (FormatException e)
                {
                    throw new JsonSerializationException(
                        $"sign_and_send signature at index {i} ('{sig}') was not valid base64.", e);
                }
            }
            return bytes;
        }
    }
}

/// <summary>
/// Optional network-submission options for <c>sign_and_send_transactions</c>
/// (the nested <c>options</c> object). Every field is nullable and omitted from
/// the request when null, so the wallet applies its own defaults.
/// </summary>
[Preserve]
public class SignAndSendTransactionsOptions
{
    /// <summary>Minimum slot the wallet's RPC must have reached before submitting.</summary>
    public ulong? MinContextSlot;

    /// <summary>Preflight/confirmation commitment: "processed" | "confirmed" | "finalized".</summary>
    public string Commitment;

    /// <summary>Skip the preflight transaction check.</summary>
    public bool? SkipPreflight;

    /// <summary>Max number of times the wallet's RPC should retry submission.</summary>
    public int? MaxRetries;

    /// <summary>Wait for the prior transaction to reach <see cref="Commitment"/> before sending the next.</summary>
    public bool? WaitForCommitmentToSendNextTransaction;
}
