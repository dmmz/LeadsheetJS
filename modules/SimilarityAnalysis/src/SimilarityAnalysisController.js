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

	function SimilarityAnalysisController(songModel, noteSpaceMng) {
		this.songModel = songModel;
		this.initSubscribe();
		this.tagManager = new TagManager(this.songModel, noteSpaceMng, [], undefined, false, false);
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
		simAPI.getNotesClustering(self.songModel._id, threshold, 1, function(res) {
			UserLog.removeLog(idLog);
			UserLog.logAutoFade('success', 'Similarity Analysis is finished');
			var similarity = [];
			var firstBeat, lastBeat;
			var color = ['255,0,0', '255,0,255', '255,255,0', '0,255,0', '0,255,255', '200,164,179', '148,173,25'];
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

	};

	SimilarityAnalysisController.prototype.removeSimilarityAnalysis = function() {
		this.tagManager.setActive(false);
	};


	return SimilarityAnalysisController;
});