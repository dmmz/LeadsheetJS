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
		this.initSubscribe();
		this.tagManager = new TagManager(this.songModel, []);
		this.tagManager.setActive(false);
	}

	HarmonicAnalysisController.prototype.initSubscribe = function() {
		var self = this;
		$.subscribe('HarmonicAnalysisView-compute', function(el) {
			self.computeHarmonicAnalysis();
		});
		$.subscribe('HarmonicAnalysisView-remove', function(el) {
			self.removeHarmonicAnalysis();
		});
	};

	HarmonicAnalysisController.prototype.computeHarmonicAnalysis = function() {
		var self = this;
		var JSONSong = SongModel_CSLJson.exportToMusicCSLJSON(this.songModel);
		$('#harmonic_analysis').html('Computing <div id="followingBallsG"><div id="followingBallsG_1" class="followingBallsG"></div><div id="followingBallsG_2" class="followingBallsG"></div><div id="followingBallsG_3" class="followingBallsG"></div><div id="followingBallsG_4" class="followingBallsG"></div></div>');
		var harm = new HarmonicAnalysisAPI();
		harm.harmonicAnalyseFromLeadsheetAPI(JSON.stringify(JSONSong), function(data) {
			$('#harmonic_analysis').html('Harmonic Analysis');
			if (data.success === true) {
				UserLog.logAutoFade('success', 'Harmonic Analysis is finished');
				if (typeof data.analysis !== "undefined") {
					self.tagManager.setActive(true);
					self.tagManager.setTags(data.analysis);
					$.publish('ToViewer-draw', self.songModel);
				}
			} else {
				UserLog.logAutoFade('error', data.error);
			}
		});
	};

	HarmonicAnalysisController.prototype.removeHarmonicAnalysis = function() {
		this.tagManager.setActive(false);
	};


	return HarmonicAnalysisController;
});