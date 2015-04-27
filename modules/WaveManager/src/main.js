define([
		"modules/WaveManager/src/WaveManager",
		"modules/WaveManager/src/WaveManagerController",
		"modules/WaveManager/src/WaveManagerView",
	],
	function(WaveManager, WaveManagerController, WaveManagerView) {
		return {
			"WaveManager": WaveManager,
			"WaveManagerController": WaveManagerController,
			"WaveManagerView": WaveManagerView
		};
	}
);