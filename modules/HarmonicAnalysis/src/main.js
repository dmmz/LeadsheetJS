define([
		"modules/HarmonicAnalysis/src/HarmonicAnalysisAPI",
		"modules/HarmonicAnalysis/src/HarmonicAnalysisController",
		"modules/HarmonicAnalysis/src/HarmonicAnalysisView",
	],
	function(HarmonicAnalysisAPI, HarmonicAnalysisController, HarmonicAnalysisView) {
		return {
			"HarmonicAnalysisAPI": HarmonicAnalysisAPI,
			"HarmonicAnalysisController": HarmonicAnalysisController,
			"HarmonicAnalysisView": HarmonicAnalysisView
		};
	}
);