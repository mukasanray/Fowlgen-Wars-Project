using System;
using Newtonsoft.Json.Linq;
using UnityEngine.Scripting;

// ReSharper disable once CheckNamespace
namespace Solana.Unity.SDK
{
    /// <summary>
    /// A JSON-RPC error returned by the wallet endpoint, carrying the numeric
    /// <see cref="Code"/> so callers can branch on protocol errors rather than
    /// string-matching messages. For example
    /// <see cref="MwaErrorCodes.MethodNotFound"/> (-32601) means the wallet does
    /// not implement the requested method (e.g. <c>sign_and_send_transactions</c>).
    /// </summary>
    [Preserve]
    public class MwaRpcException : Exception
    {
        /// <summary>The JSON-RPC / MWA error code (see <see cref="MwaErrorCodes"/>).</summary>
        public long Code { get; }

        /// <summary>Optional structured error payload (e.g. -4's partial `signatures`).</summary>
        public JToken Data { get; }

        public MwaRpcException(long code, string message, JToken data = null) : base(message)
        {
            Code = code;
            Data = data;
        }
    }

    /// <summary>
    /// Thrown when an MWA operation is started while another is already in flight. Only one
    /// wallet interaction can run at a time (it launches the wallet UI), so concurrent calls
    /// fail fast rather than racing two associations.
    /// </summary>
    [Preserve]
    public class OperationInFlightException : InvalidOperationException
    {
        public OperationInFlightException(string operation)
            : base($"[MWA] An MWA operation is already in progress; '{operation}' cannot start.") { }
    }

    /// <summary>
    /// MWA JSON-RPC error codes, verified against the 2.0 spec. The standard
    /// JSON-RPC codes are negative five-digit values; the protocol-specific ones
    /// are small negatives.
    /// </summary>
    public static class MwaErrorCodes
    {
        // Standard JSON-RPC.
        public const long InvalidParams = -32602;
        public const long MethodNotFound = -32601;

        // MWA protocol-specific.
        public const long AuthorizationFailed = -1;
        public const long InvalidPayloads = -2;
        public const long NotSigned = -3;
        public const long NotSubmitted = -4;
        public const long NotCloned = -5; // clone_authorization declined by the wallet
        public const long TooManyPayloads = -6;
        public const long ChainNotSupported = -7;
    }
}
