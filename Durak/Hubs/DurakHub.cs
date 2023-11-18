using Durak.Logic;
using Microsoft.AspNetCore.SignalR;

namespace Durak.Hubs;

public class DurakHub : Hub
{
    static readonly Dictionary<string, Game> games = [];

    public async Task SendMessage(string user, string message)
    {
        await this.Groups.AddToGroupAsync("conId", "gameId");
        await Clients.All.SendAsync("ReceiveMessage", user, message);
    }

    public async Task JoinGame(string gameId, string userName)
    {
        await this.Groups.AddToGroupAsync(Context.ConnectionId, gameId);

        var a = Clients.Client(Context.ConnectionId);
        var b = Clients.Caller;
        var c = a == b;

        await Clients.Caller.SendAsync("Joined");
    }

    public async Task StartGame(string userName)
    {
        var gameId = Guid.NewGuid().ToString("N");
        var game = new Game();
        games[gameId] = game;

        await JoinGame(gameId, userName);
    }
}