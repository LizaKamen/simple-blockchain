using Microsoft.AspNetCore.SignalR;
using server.Entities;
using server.Consts;
using System.Collections.Concurrent;
using System.Text.Json;

namespace server;
public class BlockchainHub : Hub
{
    private static readonly ConcurrentDictionary<Guid, string> _receivedMessagesAwaitingResponse = new();
    private static readonly ConcurrentDictionary<Guid, Dictionary<string, Message>> _sentMessagesAwaitingReply = new();
    private static readonly ConcurrentDictionary<string, string> _clientConnections = new();

    public async Task SendMessage(string msg)
    {
        var message = JsonSerializer.Deserialize<Message>(msg);
        switch (message.Type)
        {
            case MessageTypes.GetLongestChainRequest:
                await HandleGetLongestChainRequest(message);
                break;
            case MessageTypes.GetLongestChainResponse:
                await HandleGetLongestChainResponse(message);
                break;
            case MessageTypes.NewBlockRequest:
                await HandleAddTransactionsRequest(message);
                break;
            case MessageTypes.NewBlockAnnouncement:
                await HandleNewBlockAnnouncement(message);
                break;
            default:
                Console.WriteLine($"Received message of unknown type: \"{message.Type}\"");
                break;
        }
    }

    private async Task HandleGetLongestChainRequest(Message message)
    {
        if (ClientIsNotAlone)
        {
            _receivedMessagesAwaitingResponse[message.CorrelationId] = Context.ConnectionId;
            _sentMessagesAwaitingReply[message.CorrelationId] = new Dictionary<string, Message>();
            await Clients.Others.SendAsync("HandleMessage", message);
        }
        else
        {
            await Clients.Caller.SendAsync("HandleMessage", new Message
            {
                Type = MessageTypes.GetLongestChainResponse,
                CorrelationId = message.CorrelationId,
                Payload = Array.Empty<Block>()
            });
        }
    }

    private async Task HandleGetLongestChainResponse(Message message)
    {
        if (_receivedMessagesAwaitingResponse.TryGetValue(message.CorrelationId, out var requestorConnectionId))
        {
            var replies = _sentMessagesAwaitingReply[message.CorrelationId];
            replies[Context.ConnectionId] = message;

            if (EveryoneReplied(message))
            {
                var longestChain = replies.Values.Aggregate(SelectTheLongestChain);
                await Clients.Client(requestorConnectionId).SendAsync("HandleMessage", longestChain);
                
                _receivedMessagesAwaitingResponse.TryRemove(message.CorrelationId, out _);
                _sentMessagesAwaitingReply.TryRemove(message.CorrelationId, out _);
            }
        }
    }

    private async Task HandleAddTransactionsRequest(Message message)
    {
        await Clients.Others.SendAsync("HandleMessage", message);
    }

    private async Task HandleNewBlockAnnouncement(Message message)
    {
        await Clients.Others.SendAsync("HandleMessage", message);
    }

    private bool EveryoneReplied(Message message)
    {
        if (!_sentMessagesAwaitingReply.TryGetValue(message.CorrelationId, out var replies))
            return false;

        var otherClientIds = _clientConnections.Keys
            .Where(id => id != Context.ConnectionId && 
                   id != _receivedMessagesAwaitingResponse[message.CorrelationId])
            .ToList();

        return replies.Count >= otherClientIds.Count;
    }

    private bool ClientIsNotAlone => _clientConnections.Count > 1;

    private Message SelectTheLongestChain(Message currentlyLongest, Message current)
    {
        return current.Payload.ToString().Length > currentlyLongest.Payload.ToString().Length ? current : currentlyLongest;
    }

    public override async Task OnConnectedAsync()
    {
        _clientConnections[Context.ConnectionId] = Context.ConnectionId;
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception exception)
    {
        _clientConnections.TryRemove(Context.ConnectionId, out _);
        await base.OnDisconnectedAsync(exception);
    }
}