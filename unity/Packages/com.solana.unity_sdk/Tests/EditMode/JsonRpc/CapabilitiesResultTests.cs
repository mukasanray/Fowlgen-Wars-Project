using NUnit.Framework;
using Newtonsoft.Json;

// ReSharper disable once CheckNamespace
namespace Solana.Unity.SDK.Tests.EditMode.JsonRpc
{
    /// <summary>
    /// Edit mode tests for <see cref="CapabilitiesResult"/> wire format.
    /// The MWA spec dictates the snake_case JSON property names, and these
    /// tests pin them so a rename on the C# side cannot silently break the
    /// deserializer. Every numeric and version field is also nullable so
    /// absence is represented as null, never a default value.
    /// </summary>
    [Category("Lifecycle")]
    public class CapabilitiesResultTests
    {
        
        // Snake_case property names
        [Test]
        public void Deserialize_MaxTransactionsPerRequest_FromSnakeCaseJson()
        {
            // Arrange
            const string json = "{\"max_transactions_per_request\":10}";

            // Act
            var result = JsonConvert.DeserializeObject<CapabilitiesResult>(json);

            // Assert
            Assert.IsNotNull(result);
            Assert.AreEqual(10, result.MaxTransactionsPerRequest,
                "max_transactions_per_request must deserialize to MaxTransactionsPerRequest");
        }

        [Test]
        public void Deserialize_MaxMessagesPerRequest_FromSnakeCaseJson()
        {
            // Arrange
            const string json = "{\"max_messages_per_request\":5}";

            // Act
            var result = JsonConvert.DeserializeObject<CapabilitiesResult>(json);

            // Assert
            Assert.AreEqual(5, result.MaxMessagesPerRequest,
                "max_messages_per_request must deserialize to MaxMessagesPerRequest");
        }

        [Test]
        public void Deserialize_SupportedTransactionVersions_AsStringArray()
        {
            // Arrange
            const string json = "{\"supported_transaction_versions\":[\"legacy\",\"0\"]}";

            // Act
            var result = JsonConvert.DeserializeObject<CapabilitiesResult>(json);

            // Assert
            Assert.IsNotNull(result.SupportedTransactionVersions,
                "SupportedTransactionVersions must not be null when JSON array is present");
            Assert.AreEqual(2, result.SupportedTransactionVersions.Length);
            Assert.AreEqual("legacy", result.SupportedTransactionVersions[0]);
            Assert.AreEqual("0", result.SupportedTransactionVersions[1]);
        }

        [Test]
        public void Deserialize_SupportedTransactionVersions_MixedStringAndNumber()
        {
            // The MWA spec allows a MIXED array: "legacy" (string) and 0 (number).
            // The converter must normalize the numeric element to its string form.
            const string json = "{\"supported_transaction_versions\":[\"legacy\",0]}";

            var result = JsonConvert.DeserializeObject<CapabilitiesResult>(json);

            Assert.IsNotNull(result.SupportedTransactionVersions);
            Assert.AreEqual(2, result.SupportedTransactionVersions.Length);
            Assert.AreEqual("legacy", result.SupportedTransactionVersions[0]);
            Assert.AreEqual("0", result.SupportedTransactionVersions[1],
                "numeric version 0 must normalize to the string \"0\"");
        }

        // features[] (2.0) and the feature-detection predicates
        [Test]
        public void Deserialize_Features_FromJsonArray()
        {
            const string json = "{\"features\":[\"solana:cloneAuthorization\",\"solana:signInWithSolana\"]}";

            var result = JsonConvert.DeserializeObject<CapabilitiesResult>(json);

            Assert.IsNotNull(result.Features);
            Assert.AreEqual(2, result.Features.Length);
            Assert.IsTrue(result.HasFeature(CapabilitiesResult.FeatureCloneAuthorization));
            Assert.IsTrue(result.HasFeature(CapabilitiesResult.FeatureSignInWithSolana));
            Assert.IsTrue(result.SupportsCloneAuthorization,
                "cloneAuthorization in features[] must drive the predicate true");
            Assert.IsTrue(result.SupportsSignInWithSolana,
                "signInWithSolana in features[] must drive the predicate true");
        }

        [Test]
        public void SupportsCloneAuthorization_FromFeatures_WithoutLegacyBool()
        {
            // 2.0 wallets advertise via features[] and omit the legacy bool entirely.
            const string json = "{\"features\":[\"solana:cloneAuthorization\"]}";

            var result = JsonConvert.DeserializeObject<CapabilitiesResult>(json);

            Assert.IsNull(result.SupportsCloneAuthorizationLegacy,
                "2.0 wallets do not send supports_clone_authorization");
            Assert.IsTrue(result.SupportsCloneAuthorization);
        }

        [Test]
        public void SupportsCloneAuthorization_FromLegacyBool_WithoutFeatures()
        {
            // 1.x fallback: no features[], but the deprecated bool is present.
            const string json = "{\"supports_clone_authorization\":true}";

            var result = JsonConvert.DeserializeObject<CapabilitiesResult>(json);

            Assert.IsNull(result.Features);
            Assert.IsTrue(result.SupportsCloneAuthorizationLegacy.HasValue);
            Assert.IsTrue(result.SupportsCloneAuthorizationLegacy.Value);
            Assert.IsTrue(result.SupportsCloneAuthorization,
                "legacy bool must still drive the predicate for 1.x wallets");
        }

        [Test]
        public void SupportsCloneAuthorization_False_WhenNeitherPresent()
        {
            const string json = "{}";

            var result = JsonConvert.DeserializeObject<CapabilitiesResult>(json);

            Assert.IsFalse(result.SupportsCloneAuthorization,
                "predicate must be false when neither features[] nor the legacy bool is present");
            Assert.IsFalse(result.SupportsSignInWithSolana);
        }

        [Test]
        public void SupportsCloneAuthorization_False_WhenLegacyBoolFalse()
        {
            const string json = "{\"supports_clone_authorization\":false}";

            var result = JsonConvert.DeserializeObject<CapabilitiesResult>(json);

            Assert.IsTrue(result.SupportsCloneAuthorizationLegacy.HasValue);
            Assert.IsFalse(result.SupportsCloneAuthorizationLegacy.Value);
            Assert.IsFalse(result.SupportsCloneAuthorization);
        }


        // Absence handling
        [Test]
        public void AllNullableFields_AreNull_WhenAbsentFromJson()
        {
            // Arrange
            // The raw 1.x bool is bool? so absence must stay null, not coerce to
            // false. Features[] must likewise be null (not an empty array).
            const string json = "{}";

            // Act
            var result = JsonConvert.DeserializeObject<CapabilitiesResult>(json);

            // Assert
            Assert.IsNotNull(result, "Empty object must still deserialize to a non-null instance");
            Assert.IsNull(result.MaxTransactionsPerRequest,
                "MaxTransactionsPerRequest must be null when absent");
            Assert.IsNull(result.MaxMessagesPerRequest,
                "MaxMessagesPerRequest must be null when absent");
            Assert.IsNull(result.SupportedTransactionVersions,
                "SupportedTransactionVersions must be null when absent");
            Assert.IsNull(result.Features,
                "Features must be null when absent");
            Assert.IsNull(result.SupportsCloneAuthorizationLegacy,
                "SupportsCloneAuthorizationLegacy is bool? and must be null (not false) when absent");
        }

        [Test]
        public void EmptyJsonObject_Deserializes_WithoutException()
        {
            const string json = "{}";

            Assert.DoesNotThrow(() => JsonConvert.DeserializeObject<CapabilitiesResult>(json),
                "Empty object must not throw during deserialization");
        }

        [Test]
        public void UnknownJsonFields_AreIgnored_NoException()
        {
            // Forward compatibility: the MWA spec may add new fields that the
            // SDK does not yet know about. Deserialization must tolerate them.
            const string json = "{\"max_transactions_per_request\":3," +
                                "\"future_field_not_yet_modeled\":\"unknown\"," +
                                "\"another_unknown\":42}";

            CapabilitiesResult result = null;
            Assert.DoesNotThrow(() => result = JsonConvert.DeserializeObject<CapabilitiesResult>(json),
                "Unknown fields must be silently ignored by the deserializer");
            Assert.IsNotNull(result);
            Assert.AreEqual(3, result.MaxTransactionsPerRequest,
                "Known fields must still deserialize when unknown fields are present");
        }

        
        // Full payload round trip
        [Test]
        public void FullPayload_Deserializes_AllFields()
        {
            // Arrange — a 2.0 payload: features[] instead of the legacy bool.
            const string json = "{" +
                                "\"features\":[\"solana:signInWithSolana\",\"solana:cloneAuthorization\"]," +
                                "\"max_transactions_per_request\":12," +
                                "\"max_messages_per_request\":7," +
                                "\"supported_transaction_versions\":[\"legacy\",0]" +
                                "}";

            // Act
            var result = JsonConvert.DeserializeObject<CapabilitiesResult>(json);

            // Assert
            Assert.IsNotNull(result);
            Assert.AreEqual(2, result.Features.Length);
            Assert.IsTrue(result.SupportsCloneAuthorization);
            Assert.IsTrue(result.SupportsSignInWithSolana);
            Assert.AreEqual(12, result.MaxTransactionsPerRequest);
            Assert.AreEqual(7, result.MaxMessagesPerRequest);
            Assert.IsNotNull(result.SupportedTransactionVersions);
            Assert.AreEqual(2, result.SupportedTransactionVersions.Length);
            Assert.AreEqual("0", result.SupportedTransactionVersions[1]);
        }

        
        // Response<CapabilitiesResult> wrapper - wire-level success/failure
        [Test]
        public void InsideResponseWrapper_WasSuccessful_TrueWhenErrorNull()
        {
            // CapabilitiesResult itself has no error flag, but the generic
            // Response<T> envelope does. Pin that Response<CapabilitiesResult>
            // composes correctly so callers can keep using WasSuccessful.
            var response = new Response<CapabilitiesResult>
            {
                JsonRpc = "2.0",
                Id = 1,
                Result = new CapabilitiesResult { MaxTransactionsPerRequest = 4 },
                Error = null
            };

            Assert.IsTrue(response.WasSuccessful,
                "Response<CapabilitiesResult>.WasSuccessful must be true when Error is null");
            Assert.IsFalse(response.Failed);
            Assert.IsNotNull(response.Result);
            Assert.AreEqual(4, response.Result.MaxTransactionsPerRequest);
        }

        [Test]
        public void InsideResponseWrapper_Failed_TrueWhenErrorPresent()
        {
            var response = new Response<CapabilitiesResult>
            {
                JsonRpc = "2.0",
                Id = 1,
                Result = null,
                Error = new Response<CapabilitiesResult>.ResponseError
                {
                    Code = -32601,
                    Message = "Method not found"
                }
            };

            Assert.IsTrue(response.Failed,
                "Response<CapabilitiesResult>.Failed must be true when Error is set");
            Assert.IsFalse(response.WasSuccessful);
        }
    }
}
