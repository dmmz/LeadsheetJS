define([
	'jquery',
	'mustache',
	'modules/core/src/SongModel',
	'utils/UserLog',
	'pubsub',
	'text!modules/Harmonizer/src/HarmonizerTemplate.html',
], function($, Mustache, SongModel, UserLog, pubsub, HarmonizerTemplate) {

	function HarmonizerView(parentHTML) {
		this.el = undefined;
		this.render();
	}

	HarmonizerView.prototype.render = function() {
		this.el = Mustache.render(HarmonizerTemplate);
	};

	// called by 'mainMenuView'
	HarmonizerView.prototype.initController = function() {
		var self = this;
		$('#markov_harmonizer').click(function() {
			var style = $('#harmonization_style_select').val();
			$.publish('HarmonizerView-compute-markov', style);
			return false;
		});
		$('#max_entropy_harmonizer').click(function() {
			var style = $('#harmonization_max_entropy_style_select').val();
			var instrument = $('#harmonization_max_entropy_instrument_select').val();
			var nsteps = $('#harmonization_max_entropy_nsteps_select').val();
			var k = $('#harmonization_max_entropy_k_select').val();
			var shortNoteDuration = $('#harmonization_max_entropy_short_note_duration_select').val();
			var longNoteDuration = $('#harmonization_max_entropy_long_note_duration_select').val();
			var transposeOctave = $('#harmonization_max_entropy_transpose_octave_select').prop('checked');
			$.publish('HarmonizerView-compute-maxEntropy', [style, instrument, nsteps, k, shortNoteDuration, longNoteDuration, transposeOctave]);
			return false;
		});
	};

	HarmonizerView.prototype.unactiveView = function() {
		$.publish('toHistoryView-unactiveView');
	};

	HarmonizerView.prototype.activeView = function() {
		$.publish('toHistoryView-activeView');
	};

	return HarmonizerView;
});