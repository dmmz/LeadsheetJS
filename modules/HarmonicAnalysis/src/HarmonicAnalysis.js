define([
		"modules/HarmonicAnalysis/src/HarmonicAnalysisAPI",
		"modules/HarmonicAnalysis/src/HarmonicAnalysisController",
		"modules/HarmonicAnalysis/src/HarmonicAnalysisView"
	],function(HarmonicAnalysisAPI, HarmonicAnalysisController, HarmonicAnalysisView){
	
	function HarmonicAnalysis(songModel){
		this.view = new HarmonicAnalysisView();
		new HarmonicAnalysisController(songModel, this.view);
	}
	return HarmonicAnalysis;
});