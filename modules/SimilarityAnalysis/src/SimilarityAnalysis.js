define([
	"jquery",
	"pubsub",
	"modules/SimilarityAnalysis/src/SimilarityAnalysisAPI",
	"modules/SimilarityAnalysis/src/SimilarityAnalysisController",
	"modules/SimilarityAnalysis/src/SimilarityAnalysisView"
], function($, pubsub, SimilarityAnalysisAPI, SimilarityAnalysisController, SimilarityAnalysisView) {

	function SimilarityAnalysis(songModel, noteSpaceMng) {
		this.view = new SimilarityAnalysisView();
		new SimilarityAnalysisController(songModel, noteSpaceMng);
	}
	return SimilarityAnalysis;
});