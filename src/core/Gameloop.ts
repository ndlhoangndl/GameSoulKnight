import { GAME_CONSTANTS } from '../utils/Constants'

export type UpdateFn = (dt: number, now: number) => void
export type RenderFn = () => void

export class GameLoop {
  private running = false
  private lastTime = performance.now()
  private rafId = 0

  private updateFn: UpdateFn
  private renderFn: RenderFn

  constructor(update: UpdateFn, render: RenderFn) {
    this.updateFn = update
    this.renderFn = render
  }

  private loop = (currentTime: number) => {
    if (!this.running) return

    let dt = (currentTime - this.lastTime) / 1000
    this.lastTime = currentTime

    if (dt > GAME_CONSTANTS.loop.maxDtSeconds) dt = GAME_CONSTANTS.loop.maxDtSeconds

    this.updateFn(dt, currentTime)
    this.renderFn()

    this.rafId = requestAnimationFrame(this.loop)
  }

  start() {
    if (this.running) return
    this.running = true
    this.lastTime = performance.now()
    this.rafId = requestAnimationFrame(this.loop)
  }

  stop() {
    this.running = false
    cancelAnimationFrame(this.rafId)
  }

}
