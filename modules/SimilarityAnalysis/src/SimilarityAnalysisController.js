define([
	'mustache',
	'modules/core/src/SongModel',
	'modules/converters/MusicCSLJson/src/SongModel_CSLJson',
	'modules/SimilarityAnalysis/src/SimilarityAnalysisAPI',
	'modules/Tag/src/TagManager',
	'utils/UserLog',
	'jquery',
	'pubsub',
	'utils/AjaxUtils'
], function(Mustache, SongModel, SongModel_CSLJson, SimilarityAnalysisAPI, TagManager, UserLog, $, pubsub, AjaxUtils) {

	function SimilarityAnalysisController(songModel, noteSpaceMng, view) {
		this.songModel = songModel;
		this.view = view;
		this.initSubscribe();
		this.tagManager = new TagManager(this.songModel, noteSpaceMng, [], undefined, false, false);

		// init threshold
		var self = this;
		var simAPI = new SimilarityAnalysisAPI();
		simAPI.getThresholdClustering(self.songModel._id, function(data) {
			self.view.setThreshold(data);
		});
	}

	SimilarityAnalysisController.prototype.initSubscribe = function() {
		var self = this;
		$.subscribe('SimilarityAnalysisView-compute', function(el, threshold) {
			self.computeSimilarityAnalysis(threshold);
		});
		$.subscribe('SimilarityAnalysisView-remove', function(el) {
			self.removeSimilarityAnalysis();
			$.publish('ToViewer-draw', self.songModel);
		});
		// call each time we open a new song
		$.subscribe('ToLayers-removeLayer', function(el) {
			self.removeSimilarityAnalysis();
			$.publish('ToViewer-draw', self.songModel);
		});
	};

	SimilarityAnalysisController.prototype.computeSimilarityAnalysis = function(threshold) {
		var self = this;
		var simAPI = new SimilarityAnalysisAPI();
		var idLog = UserLog.log('info', 'Computing...');
		$.publish('ToLayers-removeLayer');
		var lastId = self.songModel._id;
		simAPI.getNotesClustering(self.songModel._id, threshold, 1, function(res) {
			UserLog.removeLog(idLog);
			var JSONSong = SongModel_CSLJson.exportToMusicCSLJSON(self.songModel);
			var request = {
				'leadsheet': JSON.stringify(JSONSong),
			};
			idLog = UserLog.log('info', 'Unfolding...');
			AjaxUtils.servletRequest('jsonsong', 'unfold', request, function(data) {
				UserLog.removeLog(idLog);
				UserLog.logAutoFade('success', 'Similarity Analysis is finished');
				var unfoldedSongModel = new SongModel();
				SongModel_CSLJson.importFromMusicCSLJSON(data.unfolded, self.songModel);
				self.songModel._id = lastId;
				var similarity = [];
				var firstBeat, lastBeat;
				var color = ['85,85,153', '153,153,85', '85,153,153', '85,153,85', '255,0,0', '255,0,255', '255,255,0', '0,255,0', '0,255,255', '200,164,179', '148,173,25', '65,105,175', '65,105,43', '65,79,43', '132,79,43', '132,79,164'];
				for (var i = 0; i < res.length; i++) {
					firstBeat = self.songModel.getStartBeatFromBarNumber(i);
					if (i !== res.length - 1) {
						lastBeat = self.songModel.getStartBeatFromBarNumber(i + 1);
					} else {
						lastBeat = self.songModel.getSongTotalBeats() + 1;
					}
					similarity.push({
						'startBeat': firstBeat,
						'endBeat': lastBeat,
						'name': 'n°' + res[i].cluster + ' d ' + parseFloat(res[i].distance.toFixed(2)),
						'color': 'rgba(' + color[res[i].cluster] + ',' + (res[i].distance / 3 + 0.66) + ')'
					});
				}

				self.tagManager.setActive(true);
				self.tagManager.setTags(similarity);
				$.publish('ToViewer-draw', self.songModel);
			});
		});

	};

	SimilarityAnalysisController.prototype.removeSimilarityAnalysis = function() {
		this.tagManager.setActive(false);
	};


	return SimilarityAnalysisController;
});