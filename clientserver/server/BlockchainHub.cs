using Microsoft.AspNetCore.SignalR;

namespace server;

public class BlockchainHub : Hub 
{
    public async Task RequestNewBlock(string user, string message)
    {
        await Clients.All.SendAsync("RequestNewBlock", user, message);
    }

    public async Task AnnounceNewBlock(string user, string message)
    {
        await Clients.All.SendAsync("AnnounceNewBlock", user, message);
    }
}