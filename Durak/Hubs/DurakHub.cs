using Durak.Logic;
using Microsoft.AspNetCore.SignalR;
using System.Collections.Concurrent;
using System.Text.Json;

namespace Durak.Hubs;

public class GameOptions
{
    public int PlayerCount => 2;
}

public class DurakHub : Hub
{
    static readonly ConcurrentDictionary<string, object> Locks = [];
    static readonly ConcurrentDictionary<string, Game> Games = [];
    static readonly ConcurrentDictionary<string, GameOptions> GameOptions = [];
    static readonly ConcurrentDictionary<string, List<string>> PlayersLobby = [];
    static readonly ConcurrentDictionary<string, Dictionary<string, string>> GameUsers = [];

    public ILogger<DurakHub> Log { get; }

    public DurakHub(ILogger<DurakHub> log)
    {
        Log = log;
    }
    public async Task<string> JoinGame(string gameId, string userName)
    {
        if (!Games.ContainsKey(gameId))
        {
            throw new Exception("Game does not exist");
        }

        var gameOptions = GameOptions[gameId];
        List<string> players;

        lock (GetLock(gameId))
        {
            players = PlayersLobby[gameId];
            if (players.Count == gameOptions.PlayerCount)
            {
                throw new Exception("Max players");
            }
        }

        await this.Groups.AddToGroupAsync(Context.ConnectionId, gameId);

        lock (GetLock(gameId))
        {
            players.Add(userName);
            GameUsers[gameId][userName] = Context.ConnectionId;
            if (players.Count == gameOptions.PlayerCount)
            {
                var game = StartGame(players, gameId);
            }

            return $"Game '{gameId}' lobby. Users: {string.Join(',', players)}";
        }
    }

    public string RestartGame(string gameId)
    {
        if (!Games.ContainsKey(gameId))
        {
            throw new Exception("Game does not exist");
        }

        if (Games[gameId].GameState != GameStates.GameEnd)
        {
            throw new Exception("Game is in progress");
        }

        StartGame(PlayersLobby[gameId], gameId);
        return $"Game '{gameId}' lobby. Users: {string.Join(',', PlayersLobby[gameId])}";
    }

    private Game StartGame(IEnumerable<string> players, string gameId)
    {
        var game = new Game(players);
        game.StartGame();
        Games[gameId] = game;

        foreach (var p in game.Players)
        {
            var gameState = new
            {
                PlayerCards = game.PlayerCards[p],

                // general
                cardDeckCount = game.CardDeck.Count,
                game.Table,
                Game = game,
                gameState = game.GameState,
                //Action = action,
                game.DeckTrumpCard,
                OtherPlayersCards = game.PlayerCards.ToDictionary(x => x.Key, x => x.Value.Count),
                game.Players,
                game.PlayerWhoHodit,
                game.PlayerWhoOtbivaetsya,
                game.PlayerWhoPodkiduvaet,
                game.PlayerWhoProigral,
                game.LastConsequencePass,
                game.PlayerWhoOtbivaetsyaZabiraet,
            };
            Clients.Client(GameUsers[gameId][p]).SendAsync("GameState", gameState);
        }

        return game;
    }

    public string CreateGame(string userName)
    {
        var gameId = Guid.NewGuid().ToString("N");
        gameId = "02e6cedee2804d6194ed5da076858f70";
        Games[gameId] = null!;
        Locks[gameId] = new object();
        GameOptions[gameId] = new GameOptions();
        PlayersLobby[gameId] = [];
        GameUsers[gameId] = [];
        return gameId;
    }

    public string GameAction(string gameId, string player, GameActions action, PlayingCard? card, PlayingCard? cardTo)
    {
        lock (GetLock(gameId))
        {
            if (!Games.TryGetValue(gameId, out Game? game))
            {
                throw new Exception("Game does not exist");
            }

            Log.LogInformation("Before Action {action} ({card}) to ({cardTo}). Gamestate: {state}", action, card, cardTo, JsonSerializer.Serialize(game));
            try
            {
                game.DoAction(player, action, card, cardTo);
            }
            catch (Exception ex)
            {
                Log.LogInformation("Exception: {ex}", ex);
                Console.WriteLine(ex.ToString());
                throw;
            }

            foreach (var p in game.Players)
            {
                var gameState = new
                {
                    PlayerCards = game.PlayerCards[p],

                    // general
                    cardDeckCount = game.CardDeck.Count,
                    game.Table,
                    Game = game,
                    gameState = game.GameState,
                    Action = action,
                    game.DeckTrumpCard,
                    OtherPlayersCards = game.PlayerCards.ToDictionary(x => x.Key, x => x.Value.Count),
                    game.Players,
                    game.PlayerWhoHodit,
                    game.PlayerWhoOtbivaetsya,
                    game.PlayerWhoPodkiduvaet,
                    game.PlayerWhoProigral,
                    game.LastConsequencePass,
                    game.PlayerWhoOtbivaetsyaZabiraet,
                };
                Clients.Client(GameUsers[gameId][p]).SendAsync("GameState", gameState);
            }

            return "OK";
        }
    }


    private static object GetLock(string gameId) => Locks[gameId];
}