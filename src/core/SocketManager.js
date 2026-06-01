import * as THREE from 'three';
import { SERVER_SCALE } from '../utils/Constants.js';

export class SocketManager {
    constructor() {
        this.game = null;
        this.socket = null;
        this.myPlayerId = null;
        this.currentRoomId = null;

        // Heartbeat — giữ kết nối sống bằng cách ping định kỳ
        this._pingInterval = null;
        this._PING_INTERVAL_MS = 10000; // 10 giây / lần

        // Auto-reconnect
        this._reconnectAttempts = 0;
        this._MAX_RECONNECT = 5;
        this._reconnectTimer = null;
        this._manualClose = false; // true khi người dùng chủ động đóng
    }

    connect() {
        return new Promise((resolve, reject) => {
            try {
                this._manualClose = false;
                const WSS_URL = "wss://pblgame.huyn.site/ws";
                this.socket = new WebSocket(WSS_URL);

                this.socket.addEventListener("open", () => {
                    console.log("WebSocket connected.");
                    this._reconnectAttempts = 0; // Reset bộ đếm khi kết nối thành công
                    this._startHeartbeat();
                    const ui = document.getElementById("socket-ui");
                    if (ui) { ui.innerText = "Trạng thái: Đã kết nối BE 🟢"; ui.style.color = "#00ff00"; }
                    
                    const dbConn = document.getElementById("db-conn");
                    if (dbConn) dbConn.innerText = "WS Conn: Open";

                    resolve();
                });

                this.socket.addEventListener("message", (event) => {
                    const data = JSON.parse(event.data);
                    console.log("📥 Recv WS Message:", data);
                    
                    const msgType = data.Type || data.type;
                    const dataId = data.DataId || data.dataId;

                    const dbMsg = document.getElementById("db-msg");
                    if (dbMsg) {
                        dbMsg.innerText = "Last Msg: " + (dataId || msgType || "Unknown");
                    }

                    if (msgType === "Welcome") {
                        this.myPlayerId = data.PlayerId || data.playerId;
                        console.log("Welcome! Your PlayerID:", this.myPlayerId);
                        // Gửi ping ngay sau khi có PlayerId
                        this.send({ EventId: "Ping", PlayerId: this.myPlayerId });
                    }

                    // DataId dạng "RoomSwitch01", "RoomSwitch07"... → startsWith check
                    if (typeof dataId === 'string' && dataId.startsWith('RoomSwitch')) {
                        this.handleRoomSwitch(data);
                    } else if (dataId === "LiveData") {
                        this.handleLiveData(data);
                    }
                });

                this.socket.addEventListener("close", (event) => {
                    console.log(`WebSocket disconnected. Code: ${event.code}, Reason: ${event.reason}`);
                    this._stopHeartbeat();

                    const dbConn = document.getElementById("db-conn");
                    if (dbConn) dbConn.innerText = "WS Conn: Closed";

                    const ui = document.getElementById("socket-ui");
                    if (this._manualClose) {
                        if (ui) { ui.innerText = "Trạng thái: Đã ngắt kết nối 🔴"; ui.style.color = "red"; }
                        return;
                    }

                    // Thử reconnect với exponential backoff
                    if (this._reconnectAttempts < this._MAX_RECONNECT) {
                        this._reconnectAttempts++;
                        const delay = Math.min(1000 * Math.pow(2, this._reconnectAttempts), 30000);
                        console.log(`Reconnecting in ${delay / 1000}s... (attempt ${this._reconnectAttempts}/${this._MAX_RECONNECT})`);
                        if (ui) {
                            ui.innerText = `Trạng thái: Mất kết nối, thử lại sau ${delay / 1000}s... 🟡`;
                            ui.style.color = "orange";
                        }
                        this._reconnectTimer = setTimeout(() => {
                            this.connect().catch(e => console.warn('Reconnect failed:', e));
                        }, delay);
                    } else {
                        console.error('Max reconnect attempts reached. Giving up.');
                        if (ui) { ui.innerText = "Trạng thái: Mất kết nối 🔴 (Hết lần thử)"; ui.style.color = "red"; }
                    }
                });

                this.socket.addEventListener("error", (error) => {
                    console.error("WebSocket error:", error);
                    const ui = document.getElementById("socket-ui");
                    if (ui) { ui.innerText = "Trạng thái: Lỗi kết nối 🔴"; ui.style.color = "red"; }
                    
                    const dbConn = document.getElementById("db-conn");
                    if (dbConn) dbConn.innerText = "WS Conn: Error";

                    reject(error);
                });
            } catch (err) {
                reject(err);
            }
        });
    }

    // Bắt đầu gửi ping định kỳ để giữ kết nối sống
    _startHeartbeat() {
        this._stopHeartbeat(); // Tránh duplicate interval
        this._pingInterval = setInterval(() => {
            if (this.socket && this.socket.readyState === WebSocket.OPEN) {
                this.send({ EventId: "Ping", PlayerId: this.myPlayerId });
                console.debug('[Heartbeat] Ping sent');
            }
        }, this._PING_INTERVAL_MS);
    }

    _stopHeartbeat() {
        if (this._pingInterval) {
            clearInterval(this._pingInterval);
            this._pingInterval = null;
        }
    }

    // Ngắt kết nối chủ động (không tự reconnect)
    disconnect() {
        this._manualClose = true;
        this._stopHeartbeat();
        if (this._reconnectTimer) {
            clearTimeout(this._reconnectTimer);
            this._reconnectTimer = null;
        }
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
    }

    handleRoomSwitch(data) {
        const dataId = data.DataId || data.dataId || '';
        // Lấy roomId từ RoomId hoặc parse từ dataId (RoomSwitch07 -> 7)
        let roomId = data.RoomId !== undefined ? data.RoomId : data.roomId;
        if (roomId === undefined) {
            roomId = parseInt(dataId.replace('RoomSwitch', ''), 10);
        }

        if (this.currentRoomId === roomId && !isNaN(roomId)) return;
        this.currentRoomId = roomId;

        console.log(`🗺️ Switching to Room: ${roomId} (LevelId: ${data.LevelId || data.levelId})`);

        const dbRoom = document.getElementById("db-room");
        if (dbRoom) dbRoom.innerText = "Room ID: " + roomId;

        // Cập nhật World Map UI
        document.querySelectorAll('.map-node').forEach(node => node.classList.remove('active'));
        const activeNode = document.querySelector(`.node-${roomId}`);
        if (activeNode) activeNode.classList.add('active');

        const mapGuide = document.querySelector('.map-guide');
        if (mapGuide) mapGuide.innerText = `Bạn đang ở Map ${roomId}. Nhấn tab/M để đóng.`;

        // Render map từ Tiles BE gửi về
        if (this.game?.mapRenderer) {
            const tiles = data.Tiles || data.tiles || [];
            const width = data.Width !== undefined ? data.Width : (data.width ?? 0);
            const height = data.Height !== undefined ? data.Height : (data.height ?? 0);
            const rawTileSize = data.TileSize !== undefined ? data.TileSize : data.tileSize;
            // TileSize từ BE (pixel) → chia SERVER_SCALE để ra world units FE
            const tileSize = rawTileSize ? rawTileSize / SERVER_SCALE : undefined;

            const dbMap = document.getElementById("db-map");
            if (dbMap) dbMap.innerText = `Map Status: Rendered (${tiles.length} tiles, ${width}x${height})`;

            const doorCount = tiles.filter(t => t === 2).length;
            const wallCount = tiles.filter(t => t === 0).length;
            console.log('Room tiles', { roomId, levelId: data.LevelId || data.levelId, width, height, tileSize, wallCount, doorCount });

            this.game.mapRenderer.render(tiles, width, height, tileSize);
        }
    }

    handleLiveData(data) {
        if (!this.game) return;

        const playerX = data.PlayerX !== undefined ? data.PlayerX : data.playerX;
        const playerY = data.PlayerY !== undefined ? data.PlayerY : data.playerY;
        const currentPlayerHp = data.CurrentPlayerHp !== undefined ? data.CurrentPlayerHp : data.currentPlayerHp;
        const spawns = data.Spawns || data.spawns || [];
        const bullets = data.Bullets || data.bullets || [];

        // 1. Sync player
        if (this.game.player) {
            if (playerX !== undefined && playerY !== undefined) {
                this.game.player.targetPosition = new THREE.Vector3(
                    playerX / SERVER_SCALE,
                    0.25,
                    playerY / SERVER_SCALE
                );

                // Snap về vị trí ngay lần đầu thay vì lerp từ (0,0,0)
                if (this.game.player.mesh.position.x === 0 && this.game.player.mesh.position.z === 0) {
                    this.game.player.mesh.position.copy(this.game.player.targetPosition);
                }
            }

            this.game.player.sync(playerX, playerY, currentPlayerHp);
        }

        // 2. Sync enemies và bullets
        if (this.game.enemyManager) {
            this.game.enemyManager.syncWithServer(spawns);
        }
        if (this.game.entityManager) {
            this.game.entityManager.sync(spawns, SERVER_SCALE);
        }
        if (this.game.bulletManager) {
            this.game.bulletManager.syncWithServer(bullets);
        }
    }

    send(data) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            console.log("📤 Sent WS Message:", data);
            this.socket.send(JSON.stringify(data));

            const dbMsg = document.getElementById("db-msg");
            if (dbMsg && data.EventId) {
                dbMsg.innerText = "Last Sent: " + data.EventId;
            }
        }
    }

    sendMove(x, y, dt = 1/60) {
        this.send({
            EventId: "Move",
            PlayerId: this.myPlayerId,
            DirectionX: x,
            DirectionY: y,
            Dt: dt
        });
    }

    // x, y là tọa độ server (world coords * SERVER_SCALE)
    sendShoot(x, y) {
        this.send({
            EventId: "Shoot",
            PlayerId: this.myPlayerId,
            X: Math.round(x),
            Y: Math.round(y)
        });
    }
}