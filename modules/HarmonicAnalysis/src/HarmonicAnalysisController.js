define([
	'mustache',
	'modules/core/src/SongModel',
	'modules/converters/MusicCSLJson/src/SongModel_CSLJson',
	'modules/HarmonicAnalysis/src/HarmonicAnalysisAPI',
	'modules/Tag/src/TagManager',
	'utils/UserLog',
	'jquery',
	'pubsub',
], function(Mustache, SongModel, SongModel_CSLJson, HarmonicAnalysisAPI, TagManager, UserLog, $, pubsub) {

	function HarmonicAnalysisController(songModel, noteSpaceMng) {
		this.songModel = songModel;
		this.initSubscribe();
		this.tagManager = new TagManager(this.songModel, noteSpaceMng, [], undefined, false, false);
	}

	HarmonicAnalysisController.prototype.initSubscribe = function() {
		var self = this;
		$.subscribe('HarmonicAnalysisView-compute', function(el) {
			self.computeHarmonicAnalysis();
		});
		$.subscribe('HarmonicAnalysisView-remove', function(el) {
			self.removeHarmonicAnalysis();
			$.publish('ToViewer-draw', self.songModel);
		});
		// call each time we open a new song
		$.subscribe('ToLayers-removeLayer', function(el) {
			self.removeHarmonicAnalysis();
			$.publish('ToViewer-draw', self.songModel);
		});
	};

	HarmonicAnalysisController.prototype.computeHarmonicAnalysis = function() {
		var self = this;
		var JSONSong = SongModel_CSLJson.exportToMusicCSLJSON(this.songModel);
		var harm = new HarmonicAnalysisAPI();
		var idLog = UserLog.log('info', 'Computing...');
		harm.harmonicAnalyseFromLeadsheetAPI(JSON.stringify(JSONSong), function(data) {
			UserLog.removeLog(idLog);
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