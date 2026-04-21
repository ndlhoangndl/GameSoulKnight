export function setupStormLogic(player, ground, spawnSystem) {
	let originalSpawnInterval = 1.5;
	let originalMaxEnemies = 20;
	let originalBoss2Rate = 0.05;
	let originalGroundColor = 0x555555;

	function startStorm() {
		if (player.isStormActive) return;

		player.isStormActive = true;
		player.stormTimeRemaining = 20; // 20 giây

		// Lưu trạng thái hiện tại
		originalSpawnInterval = spawnSystem.spawnIntervalSeconds;
		originalMaxEnemies = spawnSystem.maxEnemies;
		originalBoss2Rate = spawnSystem.boss2Rate;
		originalGroundColor = ground.material.color.getHex();

		// --- Storm Visuals ---
		ground.material.color.setHex(0xff5533);

		// --- Storm Difficulty ---
		spawnSystem.spawnIntervalSeconds = 0.5;
		spawnSystem.maxEnemies = 60;
		spawnSystem.boss2Rate = 0.25;

		const stormUI = document.getElementById('storm-ui');
		if (stormUI) {
			stormUI.style.display = 'block';
			stormUI.innerText = `Bão Quái: 20s`;
		}

		player.updateKillUI();
	}

	window.addEventListener('endStorm', () => {
		if (!player.isStormActive) return;

		player.isStormActive = false;
		player.nextStormKills = player.kills + 40; // Giết thêm 40 quái để qua bão tiếp

		// Khôi phục trạng thái
		ground.material.color.setHex(originalGroundColor);
		spawnSystem.spawnIntervalSeconds = originalSpawnInterval;
		spawnSystem.maxEnemies = originalMaxEnemies;
		spawnSystem.boss2Rate = originalBoss2Rate;

		player.updateKillUI();
	});

	window.addEventListener('enemyKilled', () => {
		if (player.isDead) return;
		
		player.addKill();

		// Kích hoạt bão quái
		if (!player.isStormActive && player.kills >= player.nextStormKills) {
			startStorm();
		}
	});
}

