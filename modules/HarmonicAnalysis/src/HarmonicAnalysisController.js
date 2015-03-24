define([
	'mustache',
	'modules/core/src/SongModel',
	'modules/converters/MusicCSLJson/src/SongModel_CSLJson',
	'modules/HarmonicAnalysis/src/HarmonicAnalysisAPI',
	'modules/Tag/src/TagManager',
	'utils/UserLog',
	'pubsub',
], function(Mustache, SongModel, SongModel_CSLJson, HarmonicAnalysisAPI, TagManager, UserLog, pubsub) {

	function HarmonicAnalysisController(songModel, view) {
		this.songModel = songModel;
		var self = this;
		$.subscribe('HarmonicAnalysisView-compute', function(el) {
			self.computeHarmonize();
		});
	}

	HarmonicAnalysisController.prototype.computeHarmonize = function() {
		var self = this;
		var JSONSong = SongModel_CSLJson.exportToMusicCSLJSON(this.songModel);
		$('#harmonic_analysis').html('Computing <div id="followingBallsG"><div id="followingBallsG_1" class="followingBallsG"></div><div id="followingBallsG_2" class="followingBallsG"></div><div id="followingBallsG_3" class="followingBallsG"></div><div id="followingBallsG_4" class="followingBallsG"></div></div>');
		var harm = new HarmonicAnalysisAPI();
		harm.harmonicAnalyseFromLeadsheetAPI(JSON.stringify(JSONSong), function(data) {
			$('#harmonic_analysis').html('Harmonic Analysis');
			if (data.success === true) {
				UserLog.logAutoFade('success', 'Harmonic Analysis is finished');
				if (typeof data.analysis !== "undefined") {
					var tags = new TagManager(self.songModel, data.analysis);
					$.publish('ToViewer-draw', self.songModel);
				}
			} else {
				UserLog.logAutoFade('error', data.error);
			}
		});
	};

	return HarmonicAnalysisController;
});