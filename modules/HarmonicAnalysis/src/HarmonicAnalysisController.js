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
						//var color = ['85,85,153', '153,153,85', '85,153,153', '85,153,85', '255,0,0', '255,0,255', '255,255,0', '0,255,0', '0,255,255', '200,164,179', '148,173,25', '65,105,175', '65,105,43', '65,79,43', '132,79,43', '132,79,164'];
						var color = [];
						var golden_ratio_conjugate = 0.618033988749895;
						var h = 0.0;
						for (var i = 0; i < data.analysis.length; i++) {
							h = ((golden_ratio_conjugate * i) * 360) % 360;
							//h = Math.round(360 * i / 13)%360;
							color.push(hsvToRgb(h, 100, 100));
						}
						var colorPos = 0;
						var analysis = []; // this array contains tag names
						var colorAnalysis = []; // this array got same index as analysis array, but it contain colors
						var pos;
						for (var i = 0; i < data.analysis.length; i++) {
							pos = analysis.indexOf(data.analysis[i].name);
							if (pos === -1) {
								analysis.push(data.analysis[i].name);
								colorAnalysis.push('rgba(' + color[colorPos] + ', 0.8)');
								data.analysis[i].color = 'rgba(' + color[colorPos] + ', 0.8)';
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