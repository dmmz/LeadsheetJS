define([
	'utils/AjaxUtils',
], function(AjaxUtils) {

	function SimilarityAnalysisAPI() {}

	SimilarityAnalysisAPI.prototype.getNotesClustering = function(leadsheet, threshold, numMeasure, structure, strict, callback) {
		$.ajax({
			url: 'http://palindromes.flow-machines.com/color/threshold/' + threshold + '/size/' + numMeasure + '/structure/' + structure + '/strict/' + strict,
			dataType: 'JSON',
			type: 'POST',
			data: {
				leadsheet: leadsheet
			},
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