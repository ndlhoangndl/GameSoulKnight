import * as THREE from 'three';
import { SERVER_SCALE } from '../utils/Constants.js';

export class SocketManager {
    constructor() {
        this.game = null;
        this.socket = null;
        this.myPlayerId = null;
        this.currentRoomId = null;
    }

    connect() {
        return new Promise((resolve, reject) => {
            try {
                const WSS_URL = "wss://pblgame.huyn.site/ws";
                this.socket = new WebSocket(WSS_URL);

                this.socket.addEventListener("open", () => {
                    console.log("WebSocket connected.");
                    const ui = document.getElementById("socket-ui");
                    if (ui) { ui.innerText = "Trạng thái: Đã kết nối BE 🟢"; ui.style.color = "#00ff00"; }
                    resolve();
                });

                this.socket.addEventListener("message", (event) => {
                    const data = JSON.parse(event.data);
                    const msgType = data.Type || data.type;

                    if (msgType === "Welcome") {
                        this.myPlayerId = data.PlayerId || data.playerId;
                        console.log("Welcome! Your PlayerID:", this.myPlayerId);
                        // Gửi ping ngay sau khi có PlayerId
                        this.send({ EventId: "ping", PlayerId: this.myPlayerId });
                    }
                    // ...

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
                    if (ui) { ui.innerText = "Trạng thái: Mất kết nối 🔴"; ui.style.color = "red"; }
                });

                this.socket.addEventListener("error", (error) => {
                    console.error("WebSocket error:", error);
                    const ui = document.getElementById("socket-ui");
                    if (ui) { ui.innerText = "Trạng thái: Lỗi kết nối 🔴"; ui.style.color = "red"; }
                    reject(error);
                });
            } catch (err) {
                reject(err);
            }
        });
    }

    handleRoomSwitch(data) {
        if (this.currentRoomId === data.RoomId) return;
        this.currentRoomId = data.RoomId;

        const biome = data.Biome || data.biome;
        console.log(`🗺️ Switching to Room: ${data.RoomId} (Biome: ${biome})`);

        if (data.RoomId !== undefined) {
            document.querySelectorAll('.map-node').forEach(node => node.classList.remove('active'));
            const activeNode = document.querySelector(`.node-${data.RoomId}`);
            if (activeNode) activeNode.classList.add('active');

            const mapGuide = document.querySelector('.map-guide');
            if (mapGuide) mapGuide.innerText = `Bạn đang ở Map ${data.RoomId}. Nhấn tab/M để đóng.`;
        }

        if (this.game?.mapRenderer) {
            const tiles = data.Tiles || [];
            const width = data.Width ?? 0;
            const height = data.Height ?? 0;
            const tileSizeRaw = data.TileSize ?? data.tileSize;
            const tileSize = tileSizeRaw ? tileSizeRaw / SERVER_SCALE : undefined;

            const doorCount = tiles.filter(t => t === 2).length;
            const wallCount = tiles.filter(t => t === 0).length;
            console.log('Room tiles', { width, height, tileSize, wallCount, doorCount });

            this.game.mapRenderer.render(tiles, width, height, tileSize);
        }
    }

    handleLiveData(data) {
        if (!this.game) return;

        // 1. Sync player — dùng sync() duy nhất, bỏ updateStats trùng lặp
        if (this.game.player) {
            if (data.PlayerX !== undefined && data.PlayerY !== undefined) {
                this.game.player.targetPosition = new THREE.Vector3(
                    data.PlayerX / SERVER_SCALE,
                    0.5,
                    data.PlayerY / SERVER_SCALE
                );

                // Snap về vị trí ngay lần đầu thay vì lerp từ (0,0,0)
                if (this.game.player.mesh.position.x === 0 && this.game.player.mesh.position.z === 0) {
                    this.game.player.mesh.position.copy(this.game.player.targetPosition);
                }
            }

            this.game.player.sync(data.PlayerX, data.PlayerY, data.CurrentPlayerHp);
        }

        // 2. Sync enemies và bullets — không truyền scale nữa
        if (this.game.enemyManager) {
            this.game.enemyManager.syncWithServer(data.Spawns || []);
        }
        if (this.game.entityManager) {
            this.game.entityManager.sync(data.Spawns || [], SERVER_SCALE);
        }
        if (this.game.bulletManager) {
            this.game.bulletManager.syncWithServer(data.Bullets || []);
        }
    }
    send(data) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(data));
        }
    }

    sendMove(x, y) {
        this.send({
            EventId: "Move",
            PlayerId: this.myPlayerId,
            DirectionX: x,
            DirectionY: y,
            Dt: 1
        });
    }
    sendShoot() {
        this.send({ type: "shoot", EventId: "Shoot", PlayerId: this.myPlayerId });
    }
}