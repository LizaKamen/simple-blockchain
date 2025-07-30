using System.Text.Json.Serialization;

namespace server.Entities
{
    public record class Message
    {
        [JsonPropertyName("type")]
        public string Type { get; set; }

        [JsonPropertyName("correlationId")]
        public Guid CorrelationId { get; set; }

        [JsonPropertyName("payload")]
        public dynamic Payload { get; set; }
    }
}
