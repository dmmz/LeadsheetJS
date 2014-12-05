define([
	'modules/core/src/SongModel',
	'utils/AjaxUtils',
	'utils/UserLog',
	'pubsub'
], function(SongModel, AjaxUtils, UserLog, pubsub) {

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