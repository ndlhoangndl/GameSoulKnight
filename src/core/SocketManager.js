import * as THREE from 'three';

export class SocketManager {
    constructor(game) {
        this.game = game;
        this.socket = null;
        this.myPlayerId = null;
        this.currentRoomId = null; // Khóa tránh vẽ lặp
    }

    connect() {
        return new Promise((resolve, reject) => {
            try {
                const WSS_URL = "wss://pblgame.huyn.site/ws";
                this.socket = new WebSocket(WSS_URL);

                this.socket.addEventListener("open", () => {
                    console.log("WebSocket connected.");
                    this.send({ EventId: "Ping" });
                    const ui = document.getElementById("socket-ui");
                    if(ui) { ui.innerText = "Trạng thái: Đã kết nối BE 🟢"; ui.style.color = "#00ff00"; }
                    resolve();
                });

                this.socket.addEventListener("message", (event) => {
                    const data = JSON.parse(event.data);
                    const msgType = data.Type || data.type;

                    if (msgType === "Welcome") {
                        this.myPlayerId = data.PlayerId || data.playerId;
                        console.log("Welcome! Your PlayerID:", this.myPlayerId);
                    }

                    const dataId = data.DataId || data.dataId;
                    if (dataId === "RoomSwitch") {
                        this.handleRoomSwitch(data);
                    } else if (dataId === "LiveData") {
                        this.handleLiveData(data);
                    }
                });

                this.socket.addEventListener("close", () => {
                    console.log("WebSocket disconnected.");
                    const ui = document.getElementById("socket-ui");
                    if(ui) { ui.innerText = "Trạng thái: Mất kết nối 🔴"; ui.style.color = "red"; }
                });

                this.socket.addEventListener("error", (error) => {
                    console.error("WebSocket error:", error);
                    const ui = document.getElementById("socket-ui");
                    if(ui) { ui.innerText = "Trạng thái: Lỗi kết nối 🔴"; ui.style.color = "red"; }
                    reject(error);
                });
            } catch (err) {
                reject(err);
            }
        });
    }

    handleRoomSwitch(data) {
        // Chỉ chạy render đúng 1 lần duy nhất khi ID phòng thực sự thay đổi
        if (this.currentRoomId === data.RoomId) return;
        this.currentRoomId = data.RoomId;

        const biome = data.Biome || data.biome;
        console.log(`🗺️ Switching to Room: ${data.RoomId} (Biome: ${biome})`);

        if (data.RoomId !== undefined) {
            document.querySelectorAll('.map-node').forEach(node => node.classList.remove('active'));
            const activeNode = document.querySelector(`.node-${data.RoomId}`);
            if (activeNode) activeNode.classList.add('active');

            const mapGuide = document.querySelector('.map-guide');
            if (mapGuide) {
                mapGuide.innerText = `Bạn đang ở Map ${data.RoomId}. Nhấn tab/M để đóng.`;
            }
        }

        // Ưu tiên sử dụng mapRenderer đã sửa đổi để vẽ texture
        if (this.game.mapRenderer) {
            this.game.mapRenderer.render(data.Tiles, data.Width, data.Height);
        }
    }

    handleLiveData(data) {
        if (!this.game) return;

        // Tỷ lệ đồng bộ thống nhất: 64 pixel BE = 2 đơn vị không gian FE (tức là chia 32)
        const scale = 32;

        // 1. Cập nhật thông số và vị trí mượt cho Player chính
        if (this.game.player) {
            this.game.player.updateStats({
                hp: data.CurrentPlayerHp,
                damage: data.PlayerDamage,
                speed: (data.Speed || 24) * 3
            });

            if (data.PlayerX !== undefined && data.PlayerY !== undefined) {
                this.game.player.targetPosition = new THREE.Vector3(data.PlayerX / scale, 0.5, data.PlayerY / scale);

                if (this.game.player.mesh.position.x === 0 && this.game.player.mesh.position.z === 0) {
                    this.game.player.mesh.position.copy(this.game.player.targetPosition);
                }
            }
        }

        if (this.game.player && this.game.player.sync) {
            this.game.player.sync(data.PlayerX, data.PlayerY, data.CurrentPlayerHp);
        }

        // 2. Đồng bộ quái vật và đạn mượt mà qua hệ số tỷ lệ scale thống nhất
        if (this.game.enemyManager) {
            this.game.enemyManager.syncWithServer(data.Spawns || [], scale);
        }
        if (this.game.entityManager) {
            this.game.entityManager.sync(data.Spawns || [], scale);
        }
        if (this.game.bulletManager) {
            this.game.bulletManager.syncWithServer(data.Bullets || [], scale);
        }
    }

    send(data) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(data));
        }
    }

    sendMove(x, y, dt = 1/60) {
        this.send({ type: "move", EventId: "Move", x: x, y: y, dt: dt, DirectionX: x, DirectionY: y, Dt: dt, PlayerId: this.myPlayerId });
    }

    sendShoot() {
        this.send({ type: "shoot", EventId: "Shoot", PlayerId: this.myPlayerId });
    }
}