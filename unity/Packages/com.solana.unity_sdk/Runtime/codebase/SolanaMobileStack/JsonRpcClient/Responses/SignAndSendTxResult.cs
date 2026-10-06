using UnityEngine.Scripting;

// ReSharper disable once CheckNamespace

/// <summary>
/// Outcome of <c>SignAndSendTransactions</c>. Unlike the other MWA methods (which throw),
/// sign-and-send has several non-exceptional outcomes — the user declining, a partial
/// submit, invalid payloads — each carrying its own data, so it returns a typed result.
/// Pattern-match on the case:
/// <code>
/// switch (await adapter.SignAndSendTransactions(txs))
/// {
///     case SignAndSendTxResult.Success s:        /* s.Signatures */        break;
///     case SignAndSendTxResult.UserDeclined:     /* user rejected */       break;
///     case SignAndSendTxResult.NotSubmitted ns:  /* ns.PartialSignatures */ break;
///     case SignAndSendTxResult.NotSupported:     /* wallet can't sign+send */ break;
///     case SignAndSendTxResult.Failed f:         /* f.Code, f.Message */    break;
/// }
/// </code>
/// </summary>
[Preserve]
public abstract class SignAndSendTxResult
{
    /// <summary>All transactions signed and submitted. One raw signature per transaction.</summary>
    [Preserve]
    public sealed class Success : SignAndSendTxResult
    {
        public byte[][] Signatures;
    }

    /// <summary>The user declined to sign (RPC -3 ERROR_NOT_SIGNED).</summary>
    [Preserve]
    public sealed class UserDeclined : SignAndSendTxResult { }

    /// <summary>
    /// Signed but submission failed for some/all transactions (RPC -4 ERROR_NOT_SUBMITTED).
    /// <see cref="PartialSignatures"/> has one entry per transaction: the signature bytes if
    /// it landed, or <c>null</c> if it did not.
    /// </summary>
    [Preserve]
    public sealed class NotSubmitted : SignAndSendTxResult
    {
        public byte[][] PartialSignatures;
    }

    /// <summary>
    /// One or more payloads were rejected (RPC -2 ERROR_INVALID_PAYLOADS). <see cref="Valid"/>
    /// flags which payloads the wallet considered valid, by index.
    /// </summary>
    [Preserve]
    public sealed class InvalidPayloads : SignAndSendTxResult
    {
        public bool[] Valid;
    }

    /// <summary>The batch exceeds the wallet's per-request limit (RPC -6 ERROR_TOO_MANY_PAYLOADS).</summary>
    [Preserve]
    public sealed class TooManyPayloads : SignAndSendTxResult { }

    /// <summary>The wallet does not implement sign_and_send_transactions (RPC -32601).</summary>
    [Preserve]
    public sealed class NotSupported : SignAndSendTxResult { }

    /// <summary>The session was not authorized for signing (RPC -1 ERROR_AUTHORIZATION_FAILED).</summary>
    [Preserve]
    public sealed class Unauthorized : SignAndSendTxResult { }

    /// <summary>Any other failure — a transport error or an unmapped RPC code.</summary>
    [Preserve]
    public sealed class Failed : SignAndSendTxResult
    {
        public long Code;
        public string Message;
    }
}
