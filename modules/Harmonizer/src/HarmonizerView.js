define([
	'mustache',
	'modules/core/src/SongModel',
	'modules/Harmonizer/src/HarmonizeAPI',
	'utils/UserLog',
	'pubsub'
], function(Mustache, SongModel, HarmonizeAPI, UserLog, pubsub) {

	function HarmonizerView(parentHTML) {
		this.el = undefined;
		var self = this;
		if (typeof parentHTML !== "undefined") {
			this.initView(parentHTML, function() {
				self.initController();
				$.publish('HarmonizerView-ready');
			});
		}
	}

	HarmonizerView.prototype.initView = function(parentHTML, callback) {
		var self = this;
		$.get('/modules/Harmonizer/src/HarmonizerTemplate.html', function(template) {
			var rendered = Mustache.render(template);
			parentHTML.innerHTML = rendered;
			self.el = parentHTML;
			if (typeof callback === "function") {
				callback();
			}
		});
	};

	HarmonizerView.prototype.initController = function() {
		var self = this;
		$('#harmonize').click(function() {
			var idSong = $(this).attr('data');
			var style = $('#harmonization_style_select').val();
			$.publish('HarmonizerView-compute', idSong, style);
			return false;
		});
	};

	HarmonizerView.prototype.updateHarmonizeView = function(leadsheet) {
		if (typeof leadsheet !== "undefined") {
			var songModel = new SongModel(leadsheet);
			// TODO editor is not defined here
			editor.songModel = songModel;
			editor.viewer.draw(editor);
			playerModel.initFromSongModel(songModel);
			$.publish('SongModel-reinit');
		}
	};

	return HarmonizerView;
});