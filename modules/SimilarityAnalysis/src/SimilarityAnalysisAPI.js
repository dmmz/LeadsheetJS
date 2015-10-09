define([
	'utils/AjaxUtils',
], function(AjaxUtils) {

	function SimilarityAnalysisAPI() {}

	SimilarityAnalysisAPI.prototype.getNotesClustering = function(id, threshold, numMeasure, callback) {
		$.ajax({
			url: 'http://palindromes.flow-machines.com/color/id/' + id + '/threshold/' + threshold + '/size/' + numMeasure,
			dataType: 'JSON',
			type: 'GET',
			success: function(data) {
				if (typeof callback !== "undefined") {
					if (typeof data !== "undefined") {
						callback(data);
					} else {
						callback('error ' + data);
					}
				}
			}
		});
	};

	return SimilarityAnalysisAPI;
});