define([
	'jquery',
	'mustache',
	'modules/core/src/SongModel',
	'utils/UserLog',
	'pubsub',
	'text!modules/HarmonicAnalysis/src/HarmonicAnalysisTemplate.html'
], function($, Mustache, SongModel, UserLog, pubsub, HarmonicAnalysisTemplate) {

	function HarmonicAnalysisView(parentHTML) {
		this.el = undefined;
		this.render();
	}

	HarmonicAnalysisView.prototype.render = function() {
		this.el = Mustache.render(HarmonicAnalysisTemplate);
	};

	HarmonicAnalysisView.prototype.initController = function() {
		var self = this;
		$('#harmonic_analysis').click(function() {
			var nbNotes = $('#harmonic_analysis_nb_notes_select').val();
			$.publish('HarmonicAnalysisView-compute', nbNotes);
			$('#remove_harmonic_analysis').show();
			return false;
		});
		$('#remove_harmonic_analysis').click(function() {
			$.publish('HarmonicAnalysisView-remove');
			$('#remove_harmonic_analysis').hide();
			return false;
		});
	};

	return HarmonicAnalysisView;
});