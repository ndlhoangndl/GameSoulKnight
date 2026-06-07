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

		// Wire resume and restart action buttons on the pause screen
		this.resumeBtn = document.getElementById('btn-resume-game');
		this.restartBtn = document.getElementById('btn-restart-game');

		if (this.resumeBtn) {
			this._onResumeClick = () => {
				this.gameLoop.resume();
				this._sync();
			};
			this.resumeBtn.addEventListener('click', this._onResumeClick);
		}

		if (this.restartBtn) {
			this._onRestartClick = () => {
				window.location.reload();
			};
			this.restartBtn.addEventListener('click', this._onRestartClick);
		}

		this._sync();
	}

	_sync() {
		if (!this.btn || !this.gameLoop) return;
		const pauseScreen = document.getElementById('pause-screen');

		// paused => show play icon style, running => show pause lines
		if (this.gameLoop.paused) {
			this.btn.classList.add('is-paused');
			this.btn.setAttribute('aria-pressed', 'true');
			this.btn.setAttribute('title', 'Resume');
			if (pauseScreen) {
				pauseScreen.classList.remove('hidden');
				pauseScreen.setAttribute('aria-hidden', 'false');
			}
		} else {
			this.btn.classList.remove('is-paused');
			this.btn.setAttribute('aria-pressed', 'false');
			this.btn.setAttribute('title', 'Pause');
			if (pauseScreen) {
				pauseScreen.classList.add('hidden');
				pauseScreen.setAttribute('aria-hidden', 'true');
			}
		}
	}

	dispose() {
		if (this.btn && this._onClick) this.btn.removeEventListener('click', this._onClick);
		if (this.resumeBtn && this._onResumeClick) this.resumeBtn.removeEventListener('click', this._onResumeClick);
		if (this.restartBtn && this._onRestartClick) this.restartBtn.removeEventListener('click', this._onRestartClick);
	}
}

