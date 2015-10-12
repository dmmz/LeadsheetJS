define([
	'utils/AjaxUtils',
], function(AjaxUtils) {

	function HarmonicAnalysisAPI() {}

	HarmonicAnalysisAPI.prototype.harmonicAnalyseFromIdSongAPI = function(idSong, nbNotes, callback) {
		var request = {
			'id': idSong,
			'nbNotes': nbNotes,
		};
		AjaxUtils.servletRequest('jsonsong', 'harmony', request, callback);
	};

	HarmonicAnalysisAPI.prototype.harmonicAnalyseFromLeadsheetAPI = function(leadsheet, nbNotes, callback) {
		var request = {
			'leadsheet': leadsheet,
			'nbNotes': nbNotes,
		};
		AjaxUtils.servletRequest('jsonsong', 'harmony', request, callback);
	};

	return HarmonicAnalysisAPI;
});