export class SocketManager {
    constructor() {
        this.socket = null;
        this.myPlayerId = null;
        this.onStateUpdate = null;
        this.onWelcome = null;
    }

    connect() {
        return new Promise((resolve, reject) => {
            try {
                this.socket = new WebSocket("wss://pblgame.huyn.site/ws");

                this.socket.addEventListener("open", () => {
                    console.log("WebSocket connected.");
                    this.send({ type: "ping" });
                });

                this.socket.addEventListener("message", (event) => {
                    const message = JSON.parse(event.data);

                    if (message.type === "welcome") {
                        this.myPlayerId = message.playerId;
                        resolve(this);
                        if (this.onWelcome) this.onWelcome(message);
                    }
                    if (message.type === "state") {
                        if (this.onStateUpdate) this.onStateUpdate(message.snapshot);
                    }
                });

                this.socket.addEventListener("close", () => {
                    console.log("WebSocket disconnected.");
                });

                this.socket.addEventListener("error", (error) => {
                    console.error("WebSocket error:", error);
                    reject(error);
                });
            } catch (err) {
                reject(err);
            }
        });
    }

    send(data) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(data));
        }
    }

    sendMove(x, y, dt = 1/60) {
        this.send({ type: "move", x, y, dt });
    }

    sendLook(x, y) {
        this.send({ type: "look", x, y });
    }

    sendShoot() {
        this.send({ type: "shoot" });
    }
}

