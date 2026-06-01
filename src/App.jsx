import { useEffect } from 'react';

export function App() {
    useEffect(() => {
        // Boot Three.js game after React mounts required UI nodes.
        import('./Main/main.js');
    }, []);

    return (
        <>
            <div id="player-ui">
                <div className="bar-label">HP</div>
                <div className="bar-container">
                    <div id="hp-fill"></div>
                </div>

                <div className="bar-label">MP</div>
                <div className="bar-container">
                    <div id="mana-fill"></div>
                </div>

                <div className="hud-item kill-count-container">
                    <div className="bar-label" id="kill-count-ui">Kills: 0 / 20 (Map 1)</div>
                </div>
                <div className="hud-item timer-container">
                    <div className="bar-label" id="time-ui">Time: 0s</div>
                </div>
                <div className="hud-item storm-container">
                    <div className="bar-label" id="storm-ui" style={{ color: 'red', display: 'none' }}>Bao Quai: 20s</div>
                </div>
                <div className="hud-item socket-check">
                    <div className="bar-label" id="socket-ui" style={{ color: 'yellow' }}>Trang thai Server: Connecting...</div>
                </div>
            </div>

            <div id="debug-panel" style={{
                position: 'fixed',
                bottom: '24px',
                left: '24px',
                background: 'rgba(17, 24, 39, 0.75)',
                backdropFilter: 'blur(16px) saturate(180%)',
                color: '#10b981', /* Emerald neon green */
                padding: '16px',
                fontFamily: '"Share Tech Mono", monospace',
                fontSize: '12px',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05) inset',
                zIndex: 9999,
                pointerEvents: 'none',
                lineHeight: '1.6',
                width: '240px',
                boxSizing: 'border-box'
            }}>
                <div style={{ fontWeight: '800', color: '#fbbf24', marginBottom: '8px', letterSpacing: '0.08em', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '4px' }}>=== FE SYSTEM MONITOR ===</div>
                <div id="db-conn">WS Conn: Connecting...</div>
                <div id="db-room">Room ID: None</div>
                <div id="db-map">Map Status: Not Rendered</div>
                <div id="db-msg">Last Msg: None</div>
            </div>

            <button id="btn-pause" className="pause-btn" type="button" aria-label="Pause" aria-pressed="false" title="Pause">
                <span className="pause-icon" aria-hidden="true"></span>
            </button>

            <div id="loading-screen" className="loading-screen" aria-hidden="true">
                <div className="loading-topbar">
                    <div className="brand">CloudMoon</div>
                </div>

                <div className="loading-center">
                    <div className="moon"></div>
                    <div className="cloud cloud-left"></div>
                    <div className="cloud cloud-right"></div>
                </div>

                <div className="loading-footer">
                    <div className="loading-track">
                        <div id="loading-progress" className="loading-progress"></div>
                        <div id="loading-label" className="loading-label">Game will start... 0%</div>
                    </div>
                </div>
            </div>

            <div id="world-map-ui" className="overlay hidden" aria-hidden="true">
                <div className="world-map-card">
                    <h2>So do di chuyen (World Map)</h2>
                    <div className="map-container">
                        <svg className="map-edges">
                            <line x1="160" y1="110" x2="160" y2="30"></line>
                            <line x1="160" y1="110" x2="60" y2="110"></line>
                            <line x1="160" y1="110" x2="260" y2="110"></line>
                            <line x1="160" y1="110" x2="160" y2="190"></line>
                        </svg>

                        <div className="map-node node-4">4</div>
                        <div className="map-node node-2">2</div>
                        <div className="map-node node-1 active">1</div>
                        <div className="map-node node-3">3</div>
                        <div className="map-node node-5">5</div>
                    </div>
                    <p className="map-guide">Ban dang o Map 1. Nhan tab/M de dong.</p>
                </div>
            </div>

            <div id="game-over" className="overlay hidden" aria-hidden="true">
                <div className="overlay-card">
                    <h1>Game Over</h1>
                    <p>Ban da het mau.</p>
                    <button id="btn-restart" type="button">Choi lai</button>
                </div>
            </div>
        </>
    );
}

