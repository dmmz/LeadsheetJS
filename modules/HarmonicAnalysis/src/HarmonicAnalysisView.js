define([
	'mustache',
	'modules/core/src/SongModel',
	'utils/UserLog',
	'pubsub',
	'text!modules/HarmonicAnalysis/src/HarmonicAnalysisTemplate.html'
], function(Mustache, SongModel, UserLog, pubsub, HarmonicAnalysisTemplate) {

	function HarmonicAnalysisView(parentHTML) {
		this.el = undefined;
		var self = this;
		/*this.initView(parentHTML, function() {
			self.initController();
			$.publish('HarmonicAnalysisView-render', self);
		});*/
	}

	HarmonicAnalysisView.prototype.render = function(parentHTML, callback) {
		//if (typeof this.el === "undefined" || (typeof this.el !== "undefined" && force === true)) {
		var rendered = Mustache.render(HarmonicAnalysisTemplate);
		if (typeof parentHTML !== "undefined") {
			parentHTML.innerHTML = rendered;
		}
		this.el = rendered;
		this.initController();
		//$.publish('HarmonicAnalysisView-render');
		if (typeof callback === "function") {
			callback();
		}
		return;
	};

	HarmonicAnalysisView.prototype.initController = function() {
		var self = this;
		$('#harmonic_analysis').click(function() {
			$.publish('HarmonicAnalysisView-compute');
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