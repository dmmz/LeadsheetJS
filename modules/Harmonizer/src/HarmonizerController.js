define([
	'mustache',
	'modules/core/src/SongModel',
	'modules/converters/MusicCSLJson/src/SongModel_CSLJson',
	'modules/Harmonizer/src/HarmonizerAPI',
	'utils/UserLog',
	'jquery',
	'pubsub',
], function(Mustache, SongModel, SongModel_CSLJson, HarmonizerAPI, UserLog, $, pubsub) {

	function HarmonizerController(songModel, view) {
		this.songModel = songModel;
		this.view = view;
		var self = this;
		$.subscribe('HarmonizerView-compute-markov', function(el, style) {
			self.computeMarkovHarmonizer(style);
		});
		$.subscribe('HarmonizerView-compute-maxEntropy', function(el) {
			self.maxEntropyHarmonizer();
		});
	}

	HarmonizerController.prototype.computeMarkovHarmonizer = function(style) {
		var self = this;
		if (!style) {
			style = "Take6";
		}
		var JSONSong = SongModel_CSLJson.exportToMusicCSLJSON(this.songModel);
		var harm = new HarmonizerAPI();
		var logId = UserLog.log('info', 'Computing ...');
		harm.markovHarmonizeFromLeadsheetAPI(JSON.stringify(JSONSong), style, function(data) {
			UserLog.removeLog(logId);
			if (data.success === true) {
				UserLog.logAutoFade('success', 'Harmonization is finished');
				SongModel_CSLJson.importFromMusicCSLJSON(data.sequence, self.songModel);
				$.publish('ToHistory-add', 'Harmonization - ' + style);
				$.publish('ToViewer-draw', self.songModel);
			} else {
				UserLog.logAutoFade('error', data.error);
			}
		});
	};

	HarmonizerController.prototype.maxEntropyHarmonizer = function() {
		var self = this;
		var JSONSong = SongModel_CSLJson.exportToMusicCSLJSON(this.songModel);
		var harm = new HarmonizerAPI();
		UserLog.logAutoFade('warn', 'This harmonization will soon be available !');
		/*var logId = UserLog.log('info', 'Computing ...');
		harm.maxEntropyHarmonizeFromLeadsheetAPI(JSON.stringify(JSONSong), function(data) {
			UserLog.removeLog(logId);
			if (data.success === true) {
				UserLog.logAutoFade('success', 'Harmonization is finished');
				SongModel_CSLJson.importFromMusicCSLJSON(data.sequence, self.songModel);
				$.publish('ToHistory-add', 'Harmonization - ' + style);
				$.publish('ToViewer-draw', self.songModel);
			} else {
				UserLog.logAutoFade('error', data.error);
			}
		});*/
	};

	return HarmonizerController;
});