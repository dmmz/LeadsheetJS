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
		$('#harmonize').click(function() {
			var style = $('#harmonization_style_select').val();
			$.publish('HarmonizerView-compute', style);
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