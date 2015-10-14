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
		if (typeof self.songModel._id !== "undefined") {
			simAPI.getThresholdClustering(self.songModel._id, function(data) {
				self.view.setThreshold(data);
			});
		}
	}

	SimilarityAnalysisController.prototype.initSubscribe = function() {
		var self = this;
		$.subscribe('SimilarityAnalysisView-compute', function(el, threshold, structure) {
			self.computeSimilarityAnalysis(threshold, structure);
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
	/**
	 * HSV to RGB color conversion
	 *
	 * H runs from 0 to 360 degrees
	 * S and V run from 0 to 100
	 * 
	 * Ported from the excellent java algorithm by Eugene Vishnevsky at:
	 * http://www.cs.rit.edu/~ncs/color/t_convert.html
	 */
	function hsvToRgb(h, s, v) {
		var r, g, b;
		var i;
		var f, p, q, t;

		// Make sure our arguments stay in-range
		h = Math.max(0, Math.min(360, h));
		s = Math.max(0, Math.min(100, s));
		v = Math.max(0, Math.min(100, v));

		// We accept saturation and value arguments from 0 to 100 because that's
		// how Photoshop represents those values. Internally, however, the
		// saturation and value are calculated from a range of 0 to 1. We make
		// That conversion here.
		s /= 100;
		v /= 100;

		if (s == 0) {
			// Achromatic (grey)
			r = g = b = v;
			return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
		}

		h /= 60; // sector 0 to 5
		i = Math.floor(h);
		f = h - i; // factorial part of h
		p = v * (1 - s);
		q = v * (1 - s * f);
		t = v * (1 - s * (1 - f));

		switch (i) {
			case 0:
				r = v;
				g = t;
				b = p;
				break;

			case 1:
				r = q;
				g = v;
				b = p;
				break;

			case 2:
				r = p;
				g = v;
				b = t;
				break;

			case 3:
				r = p;
				g = q;
				b = v;
				break;

			case 4:
				r = t;
				g = p;
				b = v;
				break;

			default: // case 5:
				r = v;
				g = p;
				b = q;
		}

		return Math.round(r * 255) + "," + Math.round(g * 255) + "," + Math.round(b * 255);
	}
	SimilarityAnalysisController.prototype.computeSimilarityAnalysis = function(threshold, structure) {
		var self = this;
		var simAPI = new SimilarityAnalysisAPI();
		var idLog = UserLog.log('info', 'Computing...');
		$.publish('ToLayers-removeLayer');
		var lastId = self.songModel._id;
		simAPI.getNotesClustering(self.songModel._id, threshold, 1, structure, function(res) {
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
				// var color = ['85,85,153', '153,153,85', '85,153,153', '85,153,85', '255,0,0', '255,0,255', '255,255,0', '0,255,0', '0,255,255', '200,164,179', '148,173,25', '65,105,175', '65,105,43', '65,79,43', '132,79,43', '132,79,164'];
				var color = [];
				var golden_ratio_conjugate = 0.618033988749895;
				var h = 0.0;
				var offset = Math.random();
				for (var i = 0; i < res.length; i++) {
					h = ((offset + (golden_ratio_conjugate * i)) * 360) % 360;
					//h = Math.round(360 * i / 13)%360;
					color.push(hsvToRgb(h, 95, 95));
				}
				var numberOfMeasure = 1;
				var currentMeasure = 0;
				for (var i = 0; i < res.length; i++) {
					numberOfMeasure = res[i].size;
					firstBeat = self.songModel.getStartBeatFromBarNumber(currentMeasure);
					lastBeat = self.songModel.getStartBeatFromBarNumber(currentMeasure + numberOfMeasure);
					if (lastBeat === firstBeat) {
						lastBeat = self.songModel.getSongTotalBeats() + 1;
					}
					similarity.push({
						'startBeat': firstBeat,
						'endBeat': lastBeat,
						'name': 'n°' + res[i].cluster + ' d ' + parseFloat(res[i].distance.toFixed(2)),
						'color': 'rgba(' + color[res[i].cluster] + ',' + (res[i].distance / 3 + 0.66) + ')'
					});
					currentMeasure += numberOfMeasure;
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