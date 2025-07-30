namespace server.Consts
{
    public record struct MessageTypes
    {
        public const string GetLongestChainRequest = "GET_LONGEST_CHAIN_REQUEST";
        public const string GetLongestChainResponse = "GET_LONGEST_CHAIN_RESPONSE";
        public const string NewBlockRequest = "NEW_BLOCK_REQUEST";
        public const string NewBlockAnnouncement = "NEW_BLOCK_ANNOUNCEMENT";
    }
}
