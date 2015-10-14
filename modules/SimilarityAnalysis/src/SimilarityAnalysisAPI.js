define([
	'utils/AjaxUtils',
], function(AjaxUtils) {

	function SimilarityAnalysisAPI() {}

	SimilarityAnalysisAPI.prototype.getNotesClustering = function(id, threshold, numMeasure, structure, strict, callback) {
		$.ajax({
			url: 'http://palindromes.flow-machines.com/color/id/' + id + '/threshold/' + threshold + '/size/' + numMeasure + '/structure/' + structure + '/strict/' + strict,
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
	SimilarityAnalysisAPI.prototype.getThresholdClustering = function(id, callback) {
		$.ajax({
			url: 'http://palindromes.flow-machines.com/color/id/' + id + '/target/0.45/size/1',
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