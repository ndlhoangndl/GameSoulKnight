// src/UI/PauseButton.js

export class PauseButton {
	constructor({ buttonId = 'btn-pause', gameLoop } = {}) {
		this.btn = document.getElementById(buttonId);
		this.gameLoop = gameLoop;

		if (!this.btn || !this.gameLoop) return;

		this._onClick = () => {
			this.gameLoop.togglePause();
			this._sync();
		};
		this.btn.addEventListener('click', this._onClick);
		this._sync();
	}

	_sync() {
		if (!this.btn || !this.gameLoop) return;
		// paused => show play icon style, running => show pause lines
		if (this.gameLoop.paused) {
			this.btn.classList.add('is-paused');
			this.btn.setAttribute('aria-pressed', 'true');
			this.btn.setAttribute('title', 'Resume');
		} else {
			this.btn.classList.remove('is-paused');
			this.btn.setAttribute('aria-pressed', 'false');
			this.btn.setAttribute('title', 'Pause');
		}
	}

	dispose() {
		if (this.btn && this._onClick) this.btn.removeEventListener('click', this._onClick);
	}
}

