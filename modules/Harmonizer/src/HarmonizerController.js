define([
	'mustache',
	'modules/core/src/SongModel',
	'modules/converters/MusicCSLJson/src/SongModel_CSLJson',
	'modules/Harmonizer/src/HarmonizeAPI',
	'utils/UserLog',
	'pubsub',
], function(Mustache, SongModel, SongModel_CSLJson, HarmonizeAPI, UserLog, pubsub) {

	function HarmonizerController(songModel, view) {
		this.model = songModel;
		this.view = view;
		var self = this;
		$.subscribe('HarmonizerView-compute', function(el, style) {
			self.computeHarmonize(style);
		});
	}

	HarmonizerController.prototype.computeHarmonize = function(style) {
		var self = this;
		if (!style) {
			style = "Take6";
		}
		//var idSong = "517cc0c058e3388155000001";
		var JSONSong = SongModel_CSLJson.exportToMusicCSLJSON(this.model);
		$('#harmonize').html('Computing <div id="followingBallsG"><div id="followingBallsG_1" class="followingBallsG"></div><div id="followingBallsG_2" class="followingBallsG"></div><div id="followingBallsG_3" class="followingBallsG"></div><div id="followingBallsG_4" class="followingBallsG"></div></div>');
		var harm = new HarmonizeAPI();
		harm.harmonizeFromLeadsheetAPI(JSON.stringify(JSONSong), style, function(data) {
			$('#harmonize').html('Harmonize');
			if (data.success === true) {
				UserLog.logAutoFade('success', 'Harmonization is finished');
				SongModel_CSLJson.importFromMusicCSLJSON(data.sequence, this.model);
			} else {
				UserLog.logAutoFade('error', 'Harmonization is finished');
			}
		});
	};

	return HarmonizerController;
});