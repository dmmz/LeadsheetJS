define([
	'mustache',
	'modules/core/src/SongModel',
	'modules/converters/MusicCSLJson/src/SongModel_CSLJson',
	'modules/HarmonicAnalysis/src/HarmonicAnalysisAPI',
	'modules/Tag/src/TagManager',
	'utils/UserLog',
	'jquery',
	'pubsub',
	'utils/AjaxUtils'
], function(Mustache, SongModel, SongModel_CSLJson, HarmonicAnalysisAPI, TagManager, UserLog, $, pubsub, AjaxUtils) {

	function HarmonicAnalysisController(songModel, noteSpaceMng) {
		this.songModel = songModel;
		this.initSubscribe();
		this.tagManager = new TagManager(this.songModel, noteSpaceMng, [], undefined, false, false);
	}

	HarmonicAnalysisController.prototype.initSubscribe = function() {
		var self = this;
		$.subscribe('HarmonicAnalysisView-compute', function(el, nbNotes) {
			self.computeHarmonicAnalysis(nbNotes);
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

	HarmonicAnalysisController.prototype.computeHarmonicAnalysis = function(nbNotes) {
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
			var harm = new HarmonicAnalysisAPI();
			idLog = UserLog.log('info', 'Computing...');
			harm.harmonicAnalyseFromLeadsheetAPI(JSON.stringify(JSONSong), nbNotes, function(data) {
				UserLog.removeLog(idLog);
				if (data.success === true) {
					UserLog.logAutoFade('success', 'Harmonic Analysis is finished');
					if (typeof data.analysis !== "undefined") {
						var color = ['85,85,153', '153,153,85', '85,153,153', '85,153,85', '255,0,0', '255,0,255', '255,255,0', '0,255,0', '0,255,255', '200,164,179', '148,173,25', '65,105,175', '65,105,43', '65,79,43', '132,79,43', '132,79,164'];
						var colorPos = 0;
						var analysis = []; // this array contains tag names
						var colorAnalysis = []; // this array got same index as analysis array, but it contain colors
						var pos;
						for (var i = 0; i < data.analysis.length; i++) {
							pos = analysis.indexOf(data.analysis[i].name);
							if (pos === -1) {
								analysis.push(data.analysis[i].name);
								colorAnalysis.push('rgb(' + color[colorPos] + ')');
								data.analysis[i].color = 'rgb(' + color[colorPos] + ')';
								colorPos++;
							} else {
								data.analysis[i].color = colorAnalysis[pos];
							}
						}
						self.tagManager.setActive(true);
						self.tagManager.setTags(data.analysis);
						$.publish('ToViewer-draw', self.songModel);
					}
				} else {
					UserLog.logAutoFade('error', data.error);
				}
			});
		});



		/*var JSONSong = SongModel_CSLJson.exportToMusicCSLJSON(this.songModel);
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
		});*/
	};

	HarmonicAnalysisController.prototype.removeHarmonicAnalysis = function() {
		this.tagManager.setActive(false);
	};


	return HarmonicAnalysisController;
});