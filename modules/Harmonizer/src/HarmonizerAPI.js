define([
	'utils/AjaxUtils',
], function(AjaxUtils) {

	function HarmonizerAPI() {}

	HarmonizerAPI.prototype.harmonizeFromIdSongAPI = function(idSong, style, callback) {
		var request = {
			'id': idSong,
			'setName': style,
		};
		AjaxUtils.servletRequest('flow', 'harmonize', request, callback);
	};

	HarmonizerAPI.prototype.harmonizeFromLeadsheetAPI = function(leadsheet, style, callback) {
		var request = {
			'leadsheet': leadsheet,
			'setName': style,
		};
		AjaxUtils.servletRequest('flow', 'harmonize', request, callback);
	};

	return HarmonizerAPI;
});