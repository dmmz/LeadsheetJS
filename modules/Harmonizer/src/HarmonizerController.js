define([
	'mustache',
	'modules/core/src/SongModel',
	'modules/converters/MusicCSLJson/src/SongModel_CSLJson',
	'modules/Harmonizer/src/HarmonizerAPI',
	'modules/Wave/src/WaveController',
	'utils/UserLog',
	'utils/AjaxUtils',
	'jquery',
	'pubsub',
], function(Mustache, SongModel, SongModel_CSLJson, HarmonizerAPI, WaveController, UserLog, AjaxUtils, $, pubsub) {

	function HarmonizerController(songModel, view, waveManager) {
		this.songModel = songModel;
		this.view = view;
		this.waveManager = waveManager; // canvas viewer, needed to display wave
		var self = this;
		$.subscribe('HarmonizerView-compute-markov', function(el, style, instrument) {
			self.computeMarkovHarmonizer(style, instrument);
		});
		$.subscribe('HarmonizerView-compute-maxEntropy', function(el, style, instrument, nSteps, k, nbNotes, shortNoteDuration, longNoteDuration, transposeOctave) {
			self.maxEntropyHarmonizer(style, instrument, nSteps, k, nbNotes, shortNoteDuration, longNoteDuration, transposeOctave);
		});
	}

	HarmonizerController.prototype.computeMarkovHarmonizer = function(style, instrument) {
		var self = this;

		$.publish('ToLayers-removeLayer');
		if (!style) {
			style = "Take6";
		}
		var JSONSong = SongModel_CSLJson.exportToMusicCSLJSON(this.songModel);
		var request = {
			'leadsheet': JSON.stringify(JSONSong),
		};
		var lastId = self.songModel._id;
		var idLog = UserLog.log('info', 'Unfolding...');
		AjaxUtils.servletRequest('jsonsong', 'unfold', request, function(data) {
			UserLog.removeLog(idLog);
			var unfoldedSongModel = new SongModel();
			SongModel_CSLJson.importFromMusicCSLJSON(data.unfolded, self.songModel);
			self.songModel._id = lastId;
			JSONSong = SongModel_CSLJson.exportToMusicCSLJSON(self.songModel);
			var harm = new HarmonizerAPI();
			var logId = UserLog.log('info', 'Computing ...');
			console.log(instrument);
			var tempo = self.songModel.getTempo();
			harm.markovHarmonizeFromLeadsheetAPI(JSON.stringify(JSONSong), style, instrument, tempo, function(data) {
				UserLog.removeLog(logId);
				if (data.success === true) {
					UserLog.logAutoFade('success', 'Harmonization is finished');
					if (typeof data.url !== "undefined") {
						$.subscribe('ToPlayer-disableAll');
						self.waveManager.enable();
						self.waveManager.load(data.url, tempo, false); //redraw = true
					}
					var harmonizedLeadsheet = new SongModel();
					SongModel_CSLJson.importFromMusicCSLJSON(data.sequence, harmonizedLeadsheet);
					$.publish('ToHistory-add', 'Harmonization - ' + style);
					$.publish('ToViewer-draw', harmonizedLeadsheet);
				} else {
					UserLog.logAutoFade('error', data.error);
				}
			});
		});
	};
	HarmonizerController.prototype.maxEntropyHarmonizer = function(style, instrument, nSteps, k, nbNotes, shortNoteDuration, longNoteDuration, transposeOctave) {
		var self = this;
		$.publish('ToLayers-removeLayer');
		var JSONSong = SongModel_CSLJson.exportToMusicCSLJSON(this.songModel);
		var request = {
			'leadsheet': JSON.stringify(JSONSong),
		};
		var lastId = self.songModel._id;
		var idLog = UserLog.log('info', 'Unfolding...');
		AjaxUtils.servletRequest('jsonsong', 'unfold', request, function(data) {
			UserLog.removeLog(idLog);
			var unfoldedSongModel = new SongModel();
			SongModel_CSLJson.importFromMusicCSLJSON(data.unfolded, self.songModel);
			self.songModel._id = lastId;
			JSONSong = SongModel_CSLJson.exportToMusicCSLJSON(self.songModel);
			var harm = new HarmonizerAPI();
			var logId = UserLog.log('info', 'Computing ...');
			var tempo = self.songModel.getTempo();
			harm.maxEntropyHarmonizeFromLeadsheetAPI(JSON.stringify(JSONSong), style, tempo, instrument, nSteps, k, nbNotes, shortNoteDuration, longNoteDuration, transposeOctave, function(data) {
				UserLog.removeLog(logId);
				if (data.success === true) {
					UserLog.logAutoFade('success', 'Harmonization is finished');
					if (typeof data.url !== "undefined") {
						$.subscribe('ToPlayer-disableAll');
						self.waveManager.enable();
						self.waveManager.load(data.url, tempo, false); //redraw = true
					}
					$.publish('ToHistory-add', 'Max Entropy Harmonization');
					$.publish('ToViewer-draw', self.songModel);
				} else {
					UserLog.logAutoFade('error', data.error);
				}
			});
		});
	};

	return HarmonizerController;
});