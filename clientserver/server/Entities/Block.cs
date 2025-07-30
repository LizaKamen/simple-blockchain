using System.Text.Json.Serialization;

namespace server.Entities
{
    public record class Block
    {
        [JsonPropertyName("hash")]
        public string Hash { get; set; }

        [JsonPropertyName("nonce")]
        public long Nonce { get; set; }

        [JsonPropertyName("previousHash")]
        public string PreviousHash { get; set; }

        [JsonPropertyName("timestamp")]
        public long Timestamp { get; set; }

        [JsonPropertyName("transactions")]
        public Transaction[] Transactions { get; set; }
    }
}
