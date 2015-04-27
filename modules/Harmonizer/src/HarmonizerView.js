define([
	'mustache',
	'modules/core/src/SongModel',
	'utils/UserLog',
	'pubsub',
	'text!modules/Harmonizer/src/HarmonizerTemplate.html',
], function(Mustache, SongModel, UserLog, pubsub, HarmonizerTemplate) {

	function HarmonizerView(parentHTML) {
		this.el = undefined;
		var self = this;
		/*this.initView(parentHTML, function() {
			self.initController();
			$.publish('HarmonizerView-render', self);
		});*/
	}

	HarmonizerView.prototype.render = function(parentHTML, callback) {
		// case el has never been rendered
		//if (typeof this.el === "undefined" || (typeof this.el !== "undefined" && force === true)) {
		var rendered = Mustache.render(HarmonizerTemplate);
		if (typeof parentHTML !== "undefined") {
			parentHTML.innerHTML = rendered;
		}
		this.el = rendered;
		this.initController();
		//$.publish('HarmonizerView-render');
		if (typeof callback === "function") {
			callback();
		}
		return;
	};

	HarmonizerView.prototype.initController = function() {
		var self = this;
		$('#harmonize').click(function() {
			var style = $('#harmonization_style_select').val();
			$.publish('HarmonizerView-compute', style);
			return false;
		});
	};
	
	HarmonizerView.prototype.unactiveView = function(idElement) {
		$.publish('toHistoryView-unactiveView');
	};

	HarmonizerView.prototype.activeView = function(idElement) {
		$.publish('toHistoryView-activeView');
	};

	return HarmonizerView;
});