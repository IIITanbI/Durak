import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
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
  playerWhoProigral: string;
  action: string;
  gameState: 'PlayerHodit' | 'PlayerPodkiduvaetOrPass_OtbivaetsyaOrZabiraet' | 'GameEnd';
  lastConsequencePass: number;
  playerWhoOtbivaetsyaZabiraet: boolean;
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


  username: string = null!;
  connection = new signalR.HubConnectionBuilder()
    .withUrl("/durakHub")
    .build();

  dialogRef: MatDialogRef<DialogContentExampleDialog, any> = null!;
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

  constructor(private route: Router, public dialog: MatDialog) {

    this.username = window.localStorage.getItem("name") as string;

    this.connection.on("GameState", (state) => {
      console.log("GAME STATE", state);
      this.gameState = state;

      if (this.gameState.gameState === 'GameEnd') {
        this.dialogRef = this.dialog.open(DialogContentExampleDialog, { data: { proigral: this.gameState.playerWhoProigral }, });
        this.dialogRef.afterClosed().subscribe(result => {
          console.log(`Dialog result: ${result}`);
          if (result == true) {
            this.connection.send("RestartGame", this.gameId).catch((err) => console.error(err));
          }
        });
      }
      else {
        if (this.dialogRef) {
          this.dialogRef.close();
        }
      }
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
    }

    const connectionPromise = this.connection
      .start()
      .then(() => {
        if (this.username) {
          connectionPromise.then(this.join.bind(this));
        }
        console.log('Connection started', this.connection.connectionId);
      })
      .catch((err) => document.write(err));
  }

  setName(username: string) {
    window.localStorage.setItem("name", username);
    this.username = username;

    if (this.gameId) {
      this.join();
    }
  }


  async start() {
    const gameId = await this.connection.invoke<string>("CreateGame", this.username).catch((err) => console.error(err));
    console.log(`Started game: ${gameId}`);
    window.location.href = window.location.origin + '/' + gameId;
  }

  async join() {
    const result = await this.connection.invoke<string>("JoinGame", this.gameId, this.username).catch((err) => console.error(err));
    console.log(`Joined ok: ${result}`);
  }

  pass() {
    this.gameAction('Pass');
  }

  zabiraet() {
    this.gameAction('Zabiraet');
  }

  canPass(): boolean {
    return this.username === this.gameState.playerWhoPodkiduvaet
      && this.gameState.lastConsequencePass < this.gameState.players.length - 1;
  }

  canZabrat(): boolean {
    return this.username === this.gameState.playerWhoOtbivaetsya
      && this.gameState.table.some(x => x.item2 === null)
      && this.gameState.playerWhoOtbivaetsyaZabiraet === false;
  }

  async gameAction(action: any, card?: Card, cardTo?: Card) {
    let result = await this.connection.invoke<string>("GameAction", this.gameId, this.username, action, card, cardTo).catch((err) => console.error(err));
    console.log(`Action ok: ${result}`);
  }


  orderedPlayers() {
    const index = this.gameState.players.indexOf(this.username);
    if (index !== -1) {
      const result = this.gameState.players.slice(index + 1).concat(this.gameState.players.slice(0, index));
      return result;
    }

    return this.gameState.players;
  }

  onDragStart(event: DragEvent) {
    //console.log("drag started", JSON.stringify(event, null, 2));
  }

  onDragEnd(event: DragEvent) {
    //console.log("drag ended", JSON.stringify(event, null, 2));
  }

  onDraggableCopied(event: DragEvent) {
    //console.log("draggable copied", JSON.stringify(event, null, 2));
  }

  onDraggableLinked(event: DragEvent) {
    //console.log("draggable linked", JSON.stringify(event, null, 2));
  }

  onDraggableMoved(event: DragEvent) {
    //console.log("draggable moved", JSON.stringify(event, null, 2));
  }

  onDragCanceled(event: DragEvent) {
    //console.log("drag cancelled", JSON.stringify(event, null, 2));
  }

  onDragover(event: DragEvent) {
    //console.log("dragover", JSON.stringify(event, null, 2));
  }

  onDrop(event: DndDropEvent, cardTo?: Card) {
    //console.log("dropped", JSON.stringify(event, null, 2));
    const card: Card = event.data;
    console.log("Dropped Card", card, "to", cardTo)

    if (this.username === this.gameState.playerWhoPodkiduvaet) {
      if (this.gameState.table.flatMap(x => [x.item1, x.item2]).some(x => x?.rank === card.rank)) {
        this.gameAction('Podkiduvaet', card);
      }
      else {

      }
    }
    else if (this.username === this.gameState.playerWhoHodit) {
      this.gameAction('Hodit', card);
    }
    else if (this.username === this.gameState.playerWhoOtbivaetsya) {
      if (cardTo) {
        this.gameAction('Otbivaetsya', card, cardTo);
      }
    }
  }


  getImageName(card: Card): string {
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

  calcLeft(i: number, length: number) {
    var startDegrees = 180;
    var endDegrees = 360;

    var radius = 150;
    var cx = 1203;
    var cy = 703;
    var startRadians = startDegrees * Math.PI / 180,
      endRadians = endDegrees * Math.PI / 180,
      stepRadians = (endRadians - startRadians) / (length - 1);

    var startRadians = startDegrees * Math.PI / 180;
    var a = i * stepRadians + startRadians,
      x = Math.cos(a) * radius + cx;
    //y = Math.sin(a)*radiusY + cy;
    return x;
  }


  calcTop(i: number, length: number) {
    var startDegrees = 180;
    var endDegrees = 360;

    var radius = 50;
    var radiusY = radius;
    var cx = 1203;
    var cy = 0;
    var startRadians = startDegrees * Math.PI / 180,
      endRadians = endDegrees * Math.PI / 180,
      stepRadians = (endRadians - startRadians) / (length - 1);

    var startRadians = startDegrees * Math.PI / 180;
    var a = i * stepRadians + startRadians,
      y = Math.sin(a) * radiusY + cy;
    return y;
  }
}


@Component({
  selector: 'dialog-content-example-dialog',
  templateUrl: 'dialog-content-example-dialog.html',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, CommonModule],
})
export class DialogContentExampleDialog {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { proigral: string }) { }
}
