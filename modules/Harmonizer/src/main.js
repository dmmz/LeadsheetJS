define([
		"modules/Harmonizer/src/HarmonizerAPI",
		"modules/Harmonizer/src/HarmonizerController",
		"modules/Harmonizer/src/HarmonizerView",
	],
	function(HarmonizerAPI, HarmonizerController, HarmonizerView) {
		return {
			"HarmonizerAPI": HarmonizerAPI,
			"HarmonizerController": HarmonizerController,
			"HarmonizerView": HarmonizerView
		};
	}
);