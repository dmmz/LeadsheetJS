define([
	'jquery',
	'mustache',
	'modules/core/src/SongModel',
	'utils/UserLog',
	'pubsub',
	'text!modules/SimilarityAnalysis/src/SimilarityAnalysisTemplate.html'
], function($, Mustache, SongModel, UserLog, pubsub, SimilarityAnalysisTemplate) {

	function SimilarityAnalysisView(parentHTML) {
		this.el = undefined;
		this.render();
	}

	SimilarityAnalysisView.prototype.render = function() {
		this.el = Mustache.render(SimilarityAnalysisTemplate);
	};

	SimilarityAnalysisView.prototype.initController = function() {
		var self = this;
		$('#similarity_analysis').click(function() {
			var threshold = $('#similarity_threshold_select').val();
			$.publish('SimilarityAnalysisView-compute', threshold);
			$('#remove_similarity_analysis').show();
			return false;
		});
		$('#remove_similarity_analysis').click(function() {
			$.publish('SimilarityAnalysisView-remove');
			$('#remove_similarity_analysis').hide();
			return false;
		});
	};

	return SimilarityAnalysisView;
});