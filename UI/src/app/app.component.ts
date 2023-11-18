import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import * as signalR from "@microsoft/signalr";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'DurakUI';

  divMessages: HTMLDivElement = document.querySelector("#divMessages")!;
  tbMessage: HTMLInputElement = document.querySelector("#tbMessage")!;
  btnSend: HTMLButtonElement = document.querySelector("#btnSend")!;
  username = new Date().getTime().toString();
  connection = new signalR.HubConnectionBuilder()
    .withUrl("https://localhost:7055/durakHub", {
    })
    .build();

  constructor() {
    this.connection
      .start()
      .then(() => console.log('Connection started'))
      .catch((err) => document.write(err));

    this.connection.on("Joined", () => {
      console.log("JOINDED");
    });
  }

  func() {
    this.connection.on("messageReceived", (username: string, message: string) => {
      const m = document.createElement("div");

      m.innerHTML = `<div class="message-author">${username}</div><div>${message}</div>`;

      this.divMessages.appendChild(m);
      this.divMessages.scrollTop = this.divMessages.scrollHeight;
    });



    this.tbMessage.addEventListener("keyup", (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        this.send();
      }
    });

    this.btnSend.addEventListener("click", this.send);
  }

  async send() {
    await this.connection.invoke("StartGame", this.username).catch((err) => document.write(err));
    console.log("OK");
  }
}
