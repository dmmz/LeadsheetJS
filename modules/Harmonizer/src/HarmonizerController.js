define([
	'mustache',
	'modules/core/src/SongModel',
	'modules/converters/MusicCSLJson/src/SongModel_CSLJson',
	'modules/Harmonizer/src/HarmonizeAPI',
	'utils/UserLog',
	'pubsub',
], function(Mustache, SongModel, SongModel_CSLJson, HarmonizeAPI, UserLog, pubsub) {

	function HarmonizerController(songModel, view) {
		this.songModel = songModel;
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
		var JSONSong = SongModel_CSLJson.exportToMusicCSLJSON(this.songModel);
		$('#harmonize').html('Computing <div id="followingBallsG"><div id="followingBallsG_1" class="followingBallsG"></div><div id="followingBallsG_2" class="followingBallsG"></div><div id="followingBallsG_3" class="followingBallsG"></div><div id="followingBallsG_4" class="followingBallsG"></div></div>');
		var harm = new HarmonizeAPI();
		harm.harmonizeFromLeadsheetAPI(JSON.stringify(JSONSong), style, function(data) {
			$('#harmonize').html('Harmonize');
			if (data.success === true) {
				UserLog.logAutoFade('success', 'Harmonization is finished');
				SongModel_CSLJson.importFromMusicCSLJSON(data.sequence, self.songModel);
				$.publish('ToViewer-draw', self.songModel);
			} else {
				UserLog.logAutoFade('error', data.error);
			}
		});
	};

	return HarmonizerController;
});