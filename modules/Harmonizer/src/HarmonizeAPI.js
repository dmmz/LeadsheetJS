define([
	'utils/AjaxUtils',
], function(AjaxUtils) {

	function HarmonizeAPI() {}

	HarmonizeAPI.prototype.harmonizeAPI = function(idSong, style, callback) {
		var request = {
			'id': idSong,
			'setName': style,
		};
		AjaxUtils.servletRequest('flow', 'harmonize', request, callback);
	};

	return HarmonizeAPI;
});