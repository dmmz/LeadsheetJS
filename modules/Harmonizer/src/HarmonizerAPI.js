define([
	'utils/AjaxUtils',
], function(AjaxUtils) {

	function HarmonizerAPI() {}

	HarmonizerAPI.prototype.markovHarmonizeFromIdSongAPI = function(idSong, style, instrument, tempo, callback) {
		var request = {
			'id': idSong,
			'setName': style,
			'audioPreset': instrument,
			'tempo': tempo,
		};
		AjaxUtils.servletRequest('flow', 'harmonize', request, callback);
	};

	HarmonizerAPI.prototype.markovHarmonizeFromLeadsheetAPI = function(leadsheet, style, instrument, tempo, callback) {
		var request = {
			'leadsheet': leadsheet,
			'setName': style,
			'audioPreset': instrument,
			'tempo': tempo,
		};
		AjaxUtils.servletRequest('flow', 'harmonize', request, callback);
	};

	HarmonizerAPI.prototype.maxEntropyHarmonizeFromLeadsheetAPI = function(leadsheet, setId, tempo, instrument, nSteps, k, nbNotes, shortNoteDuration, longNoteDuration, transposeMelodyOneOctaveDown, callback) {
		var request = {
			'leadsheet': leadsheet,
			'instrument': instrument,
			'setId': setId,
			'tempo': tempo,
			'nSteps': nSteps,
			'k': k,
			'numNotesForHarmonicAnalysis': nbNotes,
			'shortNoteDuration': shortNoteDuration,
			'longNoteDuration': longNoteDuration,
			'transposeMelodyOneOctaveDown': transposeMelodyOneOctaveDown
		};
		AjaxUtils.servletRequest('flow', 'harmonizekl', request, callback);
	};

	return HarmonizerAPI;
});