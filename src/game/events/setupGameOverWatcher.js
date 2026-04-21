export function setupGameOverWatcher(player) {
	const gameOverEl = document.getElementById('game-over');
	const restartBtn = document.getElementById('btn-restart');
	let gameOverShown = false;
	const startTime = Date.now();

	function showGameOver() {
		if (gameOverShown) return;
		gameOverShown = true;
		if (gameOverEl) {
			const survivalTime = Math.floor((Date.now() - startTime) / 1000);
			const kills = player.kills || 0;

			const timeEl = document.getElementById('ui-survival-time');
			const killsEl = document.getElementById('ui-total-kills');

			if (timeEl) timeEl.innerText = survivalTime;
			if (killsEl) killsEl.innerText = kills;

			gameOverEl.classList.remove('hidden');
			gameOverEl.setAttribute('aria-hidden', 'false');
		}
	}

	function restartGame() {
		window.location.reload();
	}

	if (restartBtn) restartBtn.addEventListener('click', restartGame);

	window.addEventListener('keydown', (e) => {
		if (!gameOverShown) return;
		if (e.code === 'KeyR' || e.code === 'Enter' || e.code === 'Space') {
			restartGame();
		}
	});

	function gameOverWatcher() {
		if (player.isDead) showGameOver();
		requestAnimationFrame(gameOverWatcher);
	}

	requestAnimationFrame(gameOverWatcher);
}
