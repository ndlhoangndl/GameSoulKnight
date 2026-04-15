// src/UI/LoadingScreen.js
// Màn hình loading HTML/CSS, dùng khi mới vào game.

export class LoadingScreen {
	constructor({
		rootId = 'loading-screen',
		progressId = 'loading-progress',
		labelId = 'loading-label',
		startAt = 0
	} = {}) {
		this.root = document.getElementById(rootId);
		this.progressEl = document.getElementById(progressId);
		this.labelEl = document.getElementById(labelId);
		this.value = startAt;
		this.setProgress(startAt);
	}

	show() {
		if (!this.root) return;
		this.root.classList.add('active');
		this.root.setAttribute('aria-hidden', 'false');
	}

	hide() {
		if (!this.root) return;
		this.root.classList.remove('active');
		this.root.setAttribute('aria-hidden', 'true');
	}

	setProgress(percent) {
		this.value = Math.max(0, Math.min(100, percent));
		if (this.progressEl) this.progressEl.style.width = `${this.value}%`;
		if (this.labelEl) this.labelEl.textContent = `Game will start... ${Math.floor(this.value)}%`;
	}

	/**
	 * Giả lập loading về mặt UI. Dùng được ngay cả khi chưa có asset loader.
	 * Khi bạn có loader thật (THREE.LoadingManager) thì chỉ cần gọi setProgress theo onProgress.
	 */
	async fakeLoad({ durationMs = 1200, minFps = 30 } = {}) {
		this.show();
		const start = performance.now();
		const frameMs = 1000 / minFps;

		return new Promise((resolve) => {
			const tick = (t) => {
				const elapsed = t - start;
				const p = Math.min(1, elapsed / durationMs);
				// Ease-out nhẹ cho đẹp
				const eased = 1 - Math.pow(1 - p, 3);
				this.setProgress(eased * 100);

				if (p >= 1) {
					this.setProgress(100);
					// giữ 100% một chút cho mượt
					setTimeout(() => resolve(), 250);
					return;
				}

				setTimeout(() => requestAnimationFrame(tick), frameMs);
			};
			requestAnimationFrame(tick);
		});
	}
}


