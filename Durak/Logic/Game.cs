﻿using System.Text.Json.Serialization;

namespace Durak.Logic;

public enum CardSuite
{
    Clubs,
    Diamonds,
    Hearts,
    Spades
}

public class CardRanks
{
    public static readonly Dictionary<string, int> Ranks = new()
    {
            { "2",  2 },
            { "3",  3 },
            { "4",  4 },
            { "5",  5 },
            { "6",  6 },
            { "7",  7 },
            { "8",  8 },
            { "9",  9 },
            { "10", 10 },
            { "J",  11 },
            { "Q",  12 },
            { "K",  13 },
            { "A",  14 }
    };
}

public record PlayingCard(string Rank, CardSuite Suite);

public class CardDeck
{
    public Stack<PlayingCard> PlayingCards { get; private set; } = [];

    public CardDeck()
    {
        FillCardDeck();
    }

    private void FillCardDeck()
    {
        foreach (var rank in CardRanks.Ranks.Keys)
        {
            PlayingCards.Push(new PlayingCard(rank, CardSuite.Clubs));
            PlayingCards.Push(new PlayingCard(rank, CardSuite.Spades));
            PlayingCards.Push(new PlayingCard(rank, CardSuite.Diamonds));
            PlayingCards.Push(new PlayingCard(rank, CardSuite.Hearts));
        }
    }

    public void ShuffleCardDeck()
    {
        var array = PlayingCards.ToArray();
        Random.Shared.Shuffle(array);
        PlayingCards = new Stack<PlayingCard>(array);
    }

    public int Count => PlayingCards.Count;
    public bool IsEmpty => Count == 0;

    public PlayingCard GetTop() => PlayingCards.Pop();
    public PlayingCard PeekLast() => PlayingCards.Last();
}

public class Game
{
    public int InitCardsCount { get; } = 6;
    public List<string> Players { get; }
    public Dictionary<string, List<PlayingCard>> PlayerCards { get; }

    public CardDeck CardDeck { get; private set; } = null!;
    public PlayingCard DeckTrumpCard { get; private set; } = null!;
    public List<(PlayingCard, PlayingCard?)> Table { get; } = [];
    public int LastConsequencePass { get; private set; } = 0;
    public List<PlayingCard> OtboiCards { get; } = [];

    public GameStates? GameState { get; private set; } = null!;

    public string PlayerWhoHodit { get; private set; } = null!;
    public string PlayerWhoPodkiduvaet { get; private set; } = null!;
    public string PlayerWhoOtbivaetsya => GetNextPlayer(PlayerWhoHodit);
    public string PlayerWhoProigral { get; private set; } = null!;
    //public List<string> OtherPlayers => Players.Except(new string[] { PlayerWhoHodit, PlayerWhoOtbivaetsya }).ToList();

    public int TurnNumber { get; private set; } = 0;
    public bool PlayerWhoOtbivaetsyaZabiraet { get; private set; }
    public List<(string Player, GameActions Action)> Logs { get; private set; } = [];


    public Game(IEnumerable<string> players)
    {
        Players = players.ToList();
        PlayerCards = players.ToDictionary(x => x, x => new List<PlayingCard>());
    }

    public void StartGame()
    {
        CardDeck = new CardDeck();
        CardDeck.ShuffleCardDeck();
        for (var i = 0; i < InitCardsCount; i++)
        {
            foreach (var player in Players)
            {
                PlayerCards[player].Add(CardDeck.GetTop());
            }
        }

        DeckTrumpCard = CardDeck.PeekLast();

        int minRank = int.MaxValue;
        string? minRankPlayer = null;
        foreach (var player in Players)
        {
            var playerCards = PlayerCards[player];
            var trumpCards = playerCards.Where(x => x.Suite == DeckTrumpCard.Suite).ToList();
            if (trumpCards.Count != 0)
            {
                var minCardRank = trumpCards.Min(x => CardRanks.Ranks[x.Rank]);
                if (minCardRank < minRank)
                {
                    minRank = minCardRank;
                    minRankPlayer = player;
                }
            }
        }

        GameState = GameStates.PlayerHodit;
        PlayerWhoHodit = minRankPlayer ?? Players[0];
        TurnNumber = 1;
    }

    public string GetNextPlayer(string player)
    {
        var index = Players.IndexOf(player);
        return index < Players.Count - 1 ? Players[index + 1] : Players[0];
    }

    public void DoAction(string player, GameActions action, PlayingCard? card = null, PlayingCard? cardTo = null)
    {
        if (GameState == GameStates.PlayerHodit)
        {
            if (action == GameActions.Hodit && player == PlayerWhoHodit)
            {
                ArgumentNullException.ThrowIfNull(card);
                AssertValidPlayerCard(player, card);

                PlayerCards[player].Remove(card);
                Table.Add((card, null));
                Logs.Add((player, action));
                GameState = GameStates.PlayerPodkiduvaetOrPass_OtbivaetsyaOrZabiraet;
                PlayerWhoPodkiduvaet = PlayerWhoHodit;

                return;
            }
            else
            {
                throw new ArgumentException($"Action '{action}' is not permitted for player '{player}'");
            }
        }

        if (GameState == GameStates.PlayerPodkiduvaetOrPass_OtbivaetsyaOrZabiraet)
        {
            switch (action)
            {
                case GameActions.Podkiduvaet:
                    if (player != PlayerWhoPodkiduvaet)
                    {
                        throw new ArgumentException($"Action '{action}' is not permitted for player '{player}'");
                    }

                    ArgumentNullException.ThrowIfNull(card);

                    AssertValidPlayerCard(player, card);
                    AssertValidCardForPodkinut(card);

                    if (!CanPodkinutMore())
                    {
                        throw new ArgumentException("Can not add more cards");
                    }

                    Logs.Add((player, action));
                    Table.Add((card, null));
                    PlayerCards[player].Remove(card);
                    //LastConsequencePass = 0;

                    if (!CanPodkinutMore())
                    {
                        if (PlayerWhoOtbivaetsyaZabiraet)
                        {
                            Zabiraet();
                        }
                    }

                    return;
                case GameActions.Pass:
                    if (player != PlayerWhoPodkiduvaet || LastConsequencePass == Players.Count - 1)
                    {
                        throw new ArgumentException($"Action '{action}' is not permitted for player '{player}'");
                    }


                    LastConsequencePass++;
                    Logs.Add((player, action));

                    PlayerWhoPodkiduvaet = GetNextPlayer(PlayerWhoPodkiduvaet);
                    if (PlayerWhoPodkiduvaet == PlayerWhoOtbivaetsya)
                    {
                        PlayerWhoPodkiduvaet = GetNextPlayer(PlayerWhoPodkiduvaet);
                    }

                    if (LastConsequencePass == Players.Count - 1)
                    {
                        if (PlayerWhoOtbivaetsyaZabiraet)
                        {
                            Zabiraet();
                        }
                        else
                        {
                            if (!Table.Any(x => x.Item2 == null))
                            {
                                Otboi();
                            }
                        }
                    }

                    return;
                case GameActions.Otbivaetsya:
                    {
                        if (player != PlayerWhoOtbivaetsya)
                        {
                            throw new ArgumentException($"Action '{action}' is not permitted for player '{player}'");
                        }

                        ArgumentNullException.ThrowIfNull(card);
                        ArgumentNullException.ThrowIfNull(cardTo);

                        if (PlayerWhoOtbivaetsyaZabiraet)
                        {
                            throw new ArgumentException($"Player '{player}' already choose zabiraet");
                        }

                        AssertValidPlayerCard(player, card);
                        AssertValidCardForOtbit(card, cardTo);

                        var index = Table.FindIndex(x => x.Item1 == cardTo);
                        if (index == -1)
                        {
                            throw new ArgumentException($"There is no '{cardTo}' on the table");
                        }

                        if (Table[index].Item2 != null)
                        {
                            throw new ArgumentException($"Card '{Table[index].Item2}' is already beated");
                        }

                        Logs.Add((player, action));
                        Table[index] = (cardTo, card);
                        PlayerCards[player].Remove(card);
                        LastConsequencePass = 0;

                        if (!CanPodkinutMore() && !Table.Any(x => x.Item2 == null))
                        {
                            Otboi();
                        }

                        return;
                    }
                case GameActions.Zabiraet:
                    if (player != PlayerWhoOtbivaetsya)
                    {
                        throw new ArgumentException($"Action '{action}' is not permitted for player '{player}'");
                    }

                    if (PlayerWhoOtbivaetsyaZabiraet)
                    {
                        throw new ArgumentException($"Player '{player}' already choose zabiraet");
                    }

                    PlayerWhoOtbivaetsyaZabiraet = true;
                    Logs.Add((player, action));
                    if (!CanPodkinutMore() || LastConsequencePass == Players.Count - 1)
                    {
                        Zabiraet();
                    }
                    return;
            }
        }



        throw new ArgumentException($"Action '{action}' is not permitted for player '{player}'");
    }

    public bool CanPodkinutMore()
    {
        return Table.Count(x => x.Item2 == null) < PlayerCards[PlayerWhoOtbivaetsya].Count && Table.Count < InitCardsCount;
    }

    public bool ValidCardForPodkinut(PlayingCard card) => GetTableCards().Any(x => x.Rank == card.Rank);

    public bool ValidCardForOtbit(PlayingCard card, PlayingCard cardTo) =>
        (card.Suite == cardTo.Suite && CardRanks.Ranks[card.Rank] > CardRanks.Ranks[cardTo.Rank])
        || (card.Suite == DeckTrumpCard.Suite && cardTo.Suite != DeckTrumpCard.Suite);

    public bool IsPlayerValidCard(string player, PlayingCard card) => PlayerCards[player].Contains(card);


    public void AssertValidPlayerCard(string player, PlayingCard card)
    {
        if (!IsPlayerValidCard(player, card))
        {
            throw new ArgumentException($"Invalid player '{player}' card '{card}'");
        }
    }
    public void AssertValidCardForPodkinut(PlayingCard card)
    {
        if (!ValidCardForPodkinut(card))
        {
            throw new ArgumentException($"Can not podkinut card '{card}'");
        }
    }
    public void AssertValidCardForOtbit(PlayingCard card, PlayingCard cardTo)
    {
        if (!ValidCardForOtbit(card, cardTo))
        {
            throw new ArgumentException($"Can not otbit card '{cardTo}' with card '{card}'");
        }
    }


    public List<PlayingCard> GetTableCards() => Table.SelectMany(x => new[] { x.Item1, x.Item2! }).Where(x => x != null).ToList();

    public void Zabiraet()
    {
        PlayerCards[PlayerWhoOtbivaetsya].AddRange(GetTableCards());
        Table.Clear();
        NaborCart();

        TurnNumber++;
        GameState = GameStates.PlayerHodit;
        PlayerWhoHodit = GetNextPlayer(PlayerWhoOtbivaetsya);
        PlayerWhoPodkiduvaet = null!;
        PlayerWhoOtbivaetsyaZabiraet = false;
        LastConsequencePass = 0;
        Logs.Clear();

        var cnt = PlayerCards.Where(x => x.Value.Count > 0).ToList();
        if (cnt.Count <= 1)
        {
            if (cnt.Count == 1)
            {
                PlayerWhoProigral = cnt.First().Key;
            }

            GameState = GameStates.GameEnd;
        }
    }

    public void Otboi()
    {
        OtboiCards.AddRange(GetTableCards());
        Table.Clear();

        NaborCart();

        TurnNumber++;
        GameState = GameStates.PlayerHodit;
        PlayerWhoHodit = PlayerWhoOtbivaetsya;
        PlayerWhoPodkiduvaet = null!;
        PlayerWhoOtbivaetsyaZabiraet = false;
        LastConsequencePass = 0;
        Logs.Clear();

        var cnt = PlayerCards.Where(x => x.Value.Count > 0).ToList();
        if (cnt.Count <= 1)
        {
            if (cnt.Count == 1)
            {
                PlayerWhoProigral = cnt.First().Key;
            }

            GameState = GameStates.GameEnd;
        }
    }

    public void NaborCart()
    {
        var curPlayer = PlayerWhoHodit;
        do
        {
            var cards = PlayerCards[curPlayer];
            for (var i = cards.Count; i < InitCardsCount; i++)
            {
                if (CardDeck.IsEmpty)
                {
                    break;
                }

                cards.Add(CardDeck.GetTop());
            }

            curPlayer = GetNextPlayer(curPlayer);
        }
        while (curPlayer != PlayerWhoHodit);

    }
}

public enum GameActions
{
    Pass,
    Hodit,
    Podkiduvaet,
    Otbivaetsya,
    Zabiraet,
}

public enum GameStates
{
    PlayerHodit,
    PlayerPodkiduvaetOrPass_OtbivaetsyaOrZabiraet,
    GameEnd,
}

