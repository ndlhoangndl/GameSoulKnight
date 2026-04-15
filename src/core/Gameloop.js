import { GAME_CONSTANTS } from '../utils/Constants.js'

export class GameLoop {

  constructor(update, render) {
    this.running = false;
    this.paused = false;
    this.lastTime = performance.now();
    this.rafId = 0;

    this.updateFn = update;
    this.renderFn = render;
  }

  // Hàm loop xử lý mỗi khung hình
  loop = (currentTime) => {
    if (!this.running) return;
  // Khi pause: vẫn giữ nhịp RAF nhưng không update logic.
  if (this.paused) {
    this.lastTime = currentTime;
    this.rafId = requestAnimationFrame(this.loop);
    return;
  }

    // Tính delta time
    let dt = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;

    // để tránh giật lag quá mức
    if (dt > GAME_CONSTANTS.loop.maxDtSeconds) {
      dt = GAME_CONSTANTS.loop.maxDtSeconds;
    }

    // Chạy logic và vẽ lại màn hình
    this.updateFn(dt, currentTime);
    this.renderFn();

    this.rafId = requestAnimationFrame(this.loop);
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now();
    this.rafId = requestAnimationFrame(this.loop);
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this.rafId);
  }

  pause() {
    this.paused = true;
  }

  resume() {
    this.paused = false;
    this.lastTime = performance.now();
  }

  togglePause() {
    if (!this.running) return;
    if (this.paused) this.resume();
    else this.pause();
  }
}