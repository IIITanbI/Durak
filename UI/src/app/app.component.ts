import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import * as signalR from "@microsoft/signalr";
import { DndDropEvent } from 'ngx-drag-drop';
import { DndModule } from 'ngx-drag-drop';

import { polyfill } from 'mobile-drag-drop';
// optional import of scroll behaviour
import { scrollBehaviourDragImageTranslateOverride } from "mobile-drag-drop/scroll-behaviour";

polyfill({
  // use this to make use of the scroll behaviour
  dragImageTranslateOverride: scrollBehaviourDragImageTranslateOverride
});

// workaround to make scroll prevent work in iOS Safari > 10
try {
  window.addEventListener("touchmove", function () { }, { passive: false });
}
catch (e) { }

interface Card {
  rank: string;
  suite: 'Clubs' | 'Diamonds' | 'Hearts' | 'Spades';
}

interface CardTuple {
  item1: Card;
  item2?: Card;
}

interface GameState {
  cardDeckCount: number;
  deckTrumpCard: Card;
  playerCards: Card[];
  table: CardTuple[];
  otherPlayersCards: { [key: string]: number };
  players: string[];
  playerWhoHodit: string;
  playerWhoOtbivaetsya: string;
  playerWhoPodkiduvaet: string;
  action: any;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, DndModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'DurakUI';

  username = new Date().getTime().toString();
  connection = new signalR.HubConnectionBuilder()
    .withUrl("/durakHub")
    .build();

  gameState: GameState = null!;
  gameId: string = null!;
  draggable = {
    // note that data is handled with JSON.stringify/JSON.parse
    // only set simple data or POJO's as methods will be lost
    data: "myDragData",
    effectAllowed: "all",
    disable: false,
    handle: false
  };

  constructor(private route: Router) {
    const promise = this.connection
      .start()
      .then(() => console.log('Connection started', this.connection.connectionId))
      .catch((err) => document.write(err));

    this.connection.on("GameState", (state) => {
      console.log("GAME STATE", state);
      this.gameState = state;
    });

    var res = {
      "playerCards": [
        {
          "rank": "2",
          "suite": "Hearts"
        },
        {
          "rank": "3",
          "suite": "Spades"
        },
        {
          "rank": "Q",
          "suite": "Hearts"
        },
        {
          "rank": "K",
          "suite": "Clubs"
        },
        {
          "rank": "3",
          "suite": "Diamonds"
        },
        {
          "rank": "Q",
          "suite": "Spades"
        }
      ],
      "cardDeckCount": 34,
      "table": [
        {
          "item1": {
            "rank": "2",
            "suite": "Spades"
          },
          "item2": {
            "rank": "2",
            "suite": "Hearts"
          }
        },
        {
          "item1": {
            "rank": "2",
            "suite": "Hearts"
          },
          "item2": {
            "rank": "4",
            "suite": "Diamonds"
          }
        },
        {
          "item1": {
            "rank": "3",
            "suite": "Clubs"
          },
          "item2": {
            "rank": "A",
            "suite": "Clubs"
          }
        },
        {
          "item1": {
            "rank": "4",
            "suite": "Spades"
          },
          "item2": {
            "rank": "2",
            "suite": "Diamonds"
          }
        },
        {
          "item1": {
            "rank": "5",
            "suite": "Diamonds"
          },
          "item2": null
        },
        {
          "item1": {
            "rank": "6",
            "suite": "Spades"
          },
          "item2": {
            "rank": "J",
            "suite": "Diamonds"
          }
        }
      ],
      "game": {
        "initCardsCount": 6,
        "players": [
          "1700960045833",
          "1700960053118",
          "1700960054533"
        ],
        "playerCards": {
          "1700960045833": [
            {
              "rank": "2",
              "suite": "Hearts"
            },
            {
              "rank": "3",
              "suite": "Spades"
            },
            {
              "rank": "Q",
              "suite": "Hearts"
            },
            {
              "rank": "K",
              "suite": "Clubs"
            },
            {
              "rank": "3",
              "suite": "Diamonds"
            },
            {
              "rank": "Q",
              "suite": "Spades"
            }
          ],
          "1700960053118": [
            {
              "rank": "6",
              "suite": "Hearts"
            },
            {
              "rank": "J",
              "suite": "Clubs"
            },
            {
              "rank": "4",
              "suite": "Hearts"
            },
            {
              "rank": "8",
              "suite": "Clubs"
            },
            {
              "rank": "10",
              "suite": "Hearts"
            },
            {
              "rank": "J",
              "suite": "Diamonds"
            }
          ],
          "1700960054533": [
            {
              "rank": "9",
              "suite": "Diamonds"
            },
            {
              "rank": "4",
              "suite": "Clubs"
            },
            {
              "rank": "3",
              "suite": "Hearts"
            },
            {
              "rank": "10",
              "suite": "Spades"
            },
            {
              "rank": "Q",
              "suite": "Clubs"
            },
            {
              "rank": "9",
              "suite": "Hearts"
            }
          ]
        },
        "cardDeck": {
          "playingCards": [
            {
              "rank": "7",
              "suite": "Diamonds"
            },
            {
              "rank": "7",
              "suite": "Spades"
            },
            {
              "rank": "8",
              "suite": "Diamonds"
            },
            {
              "rank": "9",
              "suite": "Spades"
            },
            {
              "rank": "A",
              "suite": "Clubs"
            },
            {
              "rank": "A",
              "suite": "Hearts"
            },
            {
              "rank": "5",
              "suite": "Diamonds"
            },
            {
              "rank": "10",
              "suite": "Clubs"
            },
            {
              "rank": "7",
              "suite": "Hearts"
            },
            {
              "rank": "J",
              "suite": "Hearts"
            },
            {
              "rank": "Q",
              "suite": "Diamonds"
            },
            {
              "rank": "7",
              "suite": "Clubs"
            },
            {
              "rank": "2",
              "suite": "Clubs"
            },
            {
              "rank": "6",
              "suite": "Diamonds"
            },
            {
              "rank": "5",
              "suite": "Spades"
            },
            {
              "rank": "8",
              "suite": "Spades"
            },
            {
              "rank": "10",
              "suite": "Diamonds"
            },
            {
              "rank": "3",
              "suite": "Clubs"
            },
            {
              "rank": "K",
              "suite": "Hearts"
            },
            {
              "rank": "2",
              "suite": "Diamonds"
            },
            {
              "rank": "J",
              "suite": "Spades"
            },
            {
              "rank": "8",
              "suite": "Hearts"
            },
            {
              "rank": "9",
              "suite": "Clubs"
            },
            {
              "rank": "6",
              "suite": "Spades"
            },
            {
              "rank": "K",
              "suite": "Spades"
            },
            {
              "rank": "6",
              "suite": "Clubs"
            },
            {
              "rank": "K",
              "suite": "Diamonds"
            },
            {
              "rank": "5",
              "suite": "Clubs"
            },
            {
              "rank": "A",
              "suite": "Diamonds"
            },
            {
              "rank": "A",
              "suite": "Spades"
            },
            {
              "rank": "4",
              "suite": "Diamonds"
            },
            {
              "rank": "5",
              "suite": "Hearts"
            },
            {
              "rank": "4",
              "suite": "Spades"
            },
            {
              "rank": "2",
              "suite": "Spades"
            }
          ],
          "count": 34,
          "isEmpty": false,
          "trumpCard": {
            "rank": "2",
            "suite": "Spades"
          }
        },
        "deckTrumpCard": {
          "rank": "2",
          "suite": "Spades"
        },
        "table": [
          {
            "item1": {
              "rank": "2",
              "suite": "Spades"
            },
            "item2": {
              "rank": "2",
              "suite": "Hearts"
            }
          },
          {
            "item1": {
              "rank": "2",
              "suite": "Hearts"
            },
            "item2": {
              "rank": "4",
              "suite": "Diamonds"
            }
          },
          {
            "item1": {
              "rank": "3",
              "suite": "Clubs"
            },
            "item2": {
              "rank": "A",
              "suite": "Clubs"
            }
          },
          {
            "item1": {
              "rank": "4",
              "suite": "Spades"
            },
            "item2": {
              "rank": "2",
              "suite": "Diamonds"
            }
          },
          {
            "item1": {
              "rank": "5",
              "suite": "Diamonds"
            },
            "item2": null
          },
          {
            "item1": {
              "rank": "6",
              "suite": "Spades"
            },
            "item2": {
              "rank": "J",
              "suite": "Diamonds"
            }
          }
        ],
        "stateBeforePass": [],
        "otboiCards": [],
        "gameState": "PlayerHodit",
        "playerWhoHodit": "1700960045833",
        "playerWhoPodkiduvaet": null,
        "playerWhoOtbivaetsya": "1700960053118",
        "otherPlayers": [
          "1700960054533"
        ],
        "turnNumber": 1,
        "gameStatePlayers": [
          "1700960045833"
        ],
        "playerWhoOtbivaetsyaZabiraet": false
      },
      "deckTrumpCard": {
        "rank": "2",
        "suite": "Spades"
      },
      "otherPlayersCards": {
        "1700960045833": 10,
        "1700960053118": 8,
        "1700960054533": 3
      },
      "players": [
        "1700960045833",
        "1700960053118",
        "1700960054533"
      ]
    }

    this.gameState = JSON.parse(JSON.stringify(res));
    console.log(this.gameState);

    let gameIdUrl = window.location.href.split('/')[3];
    if (gameIdUrl) {
      this.gameId = gameIdUrl;
      console.log("GameId", this.gameId);
      promise.then(this.join.bind(this));
    }
  }

  async start() {
    let gameId = await this.connection.invoke<string>("CreateGame", this.username).catch((err) => console.error(err));
    console.log(`Started game: ${gameId}`);
    window.location.href = window.location.origin + '/' + gameId;
  }

  async join() {
    let result = await this.connection.invoke<string>("JoinGame", this.gameId, this.username).catch((err) => console.error(err));
    console.log(`Joined ok: ${result}`);
  }

  pass() {
    this.gameAction('Pass');
  }

  zabiraet() {
    this.gameAction('Zabiraet');
  }

  canZabrat(): boolean {
    return this.username === this.gameState.playerWhoOtbivaetsya
      && this.gameState.table.length > 0
      && this.gameState.table.some(x => x.item2 === null);
  }

  async gameAction(action: any, card?: Card, cardTo?: Card) {
    let result = await this.connection.invoke<string>("GameAction", this.gameId, this.username, action, card, cardTo).catch((err) => console.error(err));
    console.log(`Action ok: ${result}`);
  }

  onDragStart(event: DragEvent) {
    console.log("drag started", JSON.stringify(event, null, 2));
  }

  onDragEnd(event: DragEvent) {
    console.log("drag ended", JSON.stringify(event, null, 2));
  }

  onDraggableCopied(event: DragEvent) {
    console.log("draggable copied", JSON.stringify(event, null, 2));
  }

  onDraggableLinked(event: DragEvent) {
    console.log("draggable linked", JSON.stringify(event, null, 2));
  }

  onDraggableMoved(event: DragEvent) {
    console.log("draggable moved", JSON.stringify(event, null, 2));
  }

  onDragCanceled(event: DragEvent) {
    console.log("drag cancelled", JSON.stringify(event, null, 2));
  }

  onDragover(event: DragEvent) {
    console.log("dragover", JSON.stringify(event, null, 2));
  }

  onDrop(event: DndDropEvent, cardTo?: Card) {
    console.log("dropped", JSON.stringify(event, null, 2));
    const card: Card = event.data;

    console.log("CArd", card, "to", cardTo)
    let action: string = null!;
    if (!cardTo) {
      if (this.username == this.gameState.playerWhoHodit) {
        action = 'Hodit';
      }
      if (this.username == this.gameState.playerWhoPodkiduvaet) {
        action = 'Podkiduvaet';
      }
    }
    else {
      if (this.username == this.gameState.playerWhoOtbivaetsya) {
        action = 'Otbivaetsya';
      }
    }
    this.gameAction(action, card, cardTo);
  }


  getImageName(card: Card) {
    let rankName: string = null!;
    switch (card.rank.toLowerCase()) {
      case 'j':
        rankName = 'jack';
        break;
      case 'q':
        rankName = 'queen';
        break;
      case 'k':
        rankName = 'king';
        break;
      case 'a':
        rankName = 'ace';
        break;
      default:
        rankName = card.rank;
        break;
    }

    const add = rankName == 'queen' || rankName == 'king' || rankName == 'jack';
    const imageName = `/assets/cards/${rankName}_of_${card.suite.toLowerCase()}${add ? '2' : ''}.png`;
    return imageName;
  }
}
