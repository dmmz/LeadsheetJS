define([
	'mustache',
	'modules/core/src/SongModel',
	'modules/converters/MusicCSLJson/src/SongModel_CSLJson',
	'modules/Harmonizer/src/HarmonizerAPI',
	'modules/Wave/src/WaveController',
	'utils/UserLog',
	'jquery',
	'pubsub',
], function(Mustache, SongModel, SongModel_CSLJson, HarmonizerAPI, WaveController, UserLog, $, pubsub) {

	function HarmonizerController(songModel, view, waveManager) {
		this.songModel = songModel;
		this.view = view;
		this.waveManager = waveManager; // canvas viewer, needed to display wave
		var self = this;
		$.subscribe('HarmonizerView-compute-markov', function(el, style) {
			self.computeMarkovHarmonizer(style);
		});
		$.subscribe('HarmonizerView-compute-maxEntropy', function(el, style, instrument, nSteps, k, shortNoteDuration, longNoteDuration, transposeOctave) {
			self.maxEntropyHarmonizer(style, instrument, nSteps, k, shortNoteDuration, longNoteDuration, transposeOctave);
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
	HarmonizerController.prototype.maxEntropyHarmonizer = function(style, instrument, nSteps, k, shortNoteDuration, longNoteDuration, transposeOctave) {
		var self = this;
		var JSONSong = SongModel_CSLJson.exportToMusicCSLJSON(this.songModel);
		var harm = new HarmonizerAPI();
		var logId = UserLog.log('info', 'Computing ...');
		var tempo = self.songModel.getTempo();
		harm.maxEntropyHarmonizeFromLeadsheetAPI(JSON.stringify(JSONSong), style, tempo, instrument, nSteps, k, shortNoteDuration, longNoteDuration, transposeOctave, function(data) {
			UserLog.removeLog(logId);
			if (data.success === true) {
				UserLog.logAutoFade('success', 'Harmonization is finished');
				var params = {
					showHalfWave: true,
					//drawMargins: true,
					topAudio: -110,
					heightAudio: 60,
					//marginCursor: 20
				};
				if (typeof data.url !== "undefined") {
					self.waveManager.enable();
					self.waveManager.load(data.url, tempo, true); //redraw = true
				}
				$.publish('ToHistory-add', 'Max Entropy Harmonization');
				$.publish('ToViewer-draw', self.songModel);
			} else {
				UserLog.logAutoFade('error', data.error);
			}
		});
	};

	return HarmonizerController;
});