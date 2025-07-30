using System.Text.Json.Serialization;

namespace server.Entities
{
    public record struct Transaction
    {
        [JsonPropertyName("sender")]
        public string Sender { get; set; }

        [JsonPropertyName("recipient")]
        public string Recipient { get; set; }

        [JsonPropertyName("amount")]
        public string Amount { get; set; }
    }
}
