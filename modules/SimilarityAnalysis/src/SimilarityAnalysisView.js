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
		$('#similarity_threshold_select').on('input', function() {
			var threshold = $('#similarity_threshold_select').val();
			$('#similarity_threshold_viewer').val(threshold);
		});
		$('#similarity_threshold_select').on('change', function() {
			self.computeAnalysis();
			return false;
		});
		$('#similarity_compress_select').on('input', function() {
			var structure = $('#similarity_compress_select').val();
			$('#similarity_compress_viewer').val(structure);
		});
		$('#similarity_compress_select').on('change', function() {
			self.computeAnalysis();
			return false;
		});

		$('#similarity_analysis').click(function() {
			self.computeAnalysis();
			return false;
		});
		$('#remove_similarity_analysis').click(function() {
			$.publish('SimilarityAnalysisView-remove');
			$('#remove_similarity_analysis').hide();
			return false;
		});
	};

	SimilarityAnalysisView.prototype.setThreshold = function(threshold) {
		$('#similarity_threshold_viewer').val(threshold);
		$('#similarity_threshold_select').val(threshold);
	};

	SimilarityAnalysisView.prototype.computeAnalysis = function() {
		var threshold = $('#similarity_threshold_select').val();
		var structure = $('#similarity_compress_select').val();
		$('#similarity_threshold_viewer').val(threshold);
		$.publish('SimilarityAnalysisView-compute', [threshold, structure]);
		$('#remove_similarity_analysis').show();
	};

	return SimilarityAnalysisView;
});