define([
	'utils/AjaxUtils',
], function(AjaxUtils) {

	function HarmonizerAPI() {}

	HarmonizerAPI.prototype.markovHarmonizeFromIdSongAPI = function(idSong, style, callback) {
		var request = {
			'id': idSong,
			'setName': style,
		};
		AjaxUtils.servletRequest('flow', 'harmonize', request, callback);
	};

	HarmonizerAPI.prototype.markovHarmonizeFromLeadsheetAPI = function(leadsheet, style, callback) {
		var request = {
			'leadsheet': leadsheet,
			'setName': style,
		};
		AjaxUtils.servletRequest('flow', 'harmonize', request, callback);
	};

	HarmonizerAPI.prototype.maxEntropyHarmonizeFromLeadsheetAPI = function(leadsheet, callback) {
		var request = {
			'leadsheet': leadsheet,
		};
		AjaxUtils.servletRequest('flow', 'harmonize', request, callback);
	};

	return HarmonizerAPI;
});