define([
	'utils/AjaxUtils',
], function(AjaxUtils) {

	function HarmonicAnalysisAPI() {}

	HarmonicAnalysisAPI.prototype.harmonicAnalyseFromIdSongAPI = function(idSong, callback) {
		var request = {
			'id': idSong,
		};
		AjaxUtils.servletRequest('jsonsong', 'harmony', request, callback);
	};

	HarmonicAnalysisAPI.prototype.harmonicAnalyseFromLeadsheetAPI = function(leadsheet, callback) {
		var request = {
			'leadsheet': leadsheet,
		};
		AjaxUtils.servletRequest('jsonsong', 'harmony', request, callback);
	};

	return HarmonicAnalysisAPI;
});