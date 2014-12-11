define([
	'modules/core/src/SongModel',
	'modules/Harmonizer/src/HarmonizeAPI',
	'utils/AjaxUtils',
	'utils/UserLog',
	'pubsub'
], function(SongModel, HarmonizeAPI, AjaxUtils, UserLog, pubsub) {

	function HarmonizerController() {
		this.initEventSubscriber();
	}

	HarmonizerController.prototype.initEventSubscriber = function() {
		var self = this;
		$('#harmonize').click(function() {
			var idSong = $(this).attr('data');
			var style = $('#harmonization_style_select').val();
			self.computeHarmonize(idSong, style);
			return false;
		});
	};

	HarmonizerController.prototype.computeHarmonize = function(idSong, style) {
		if (!style) {
			style = "Take6";
		}

		$('#harmonize').html('Computing <div id="followingBallsG"><div id="followingBallsG_1" class="followingBallsG"></div><div id="followingBallsG_2" class="followingBallsG"></div><div id="followingBallsG_3" class="followingBallsG"></div><div id="followingBallsG_4" class="followingBallsG"></div></div>');
		var harm = new HarmonizeAPI();
		harm.harmonizeAPI(idSong, style, function(data) {
			$('#harmonize').html('Harmonize');
			if (data.success === true) {
				UserLog.logAutoFade('success', 'Harmonization is finished');
				updateHarmonizeView(data.sequence);
			} else {
				UserLog.logAutoFade('error', 'Harmonization is finished');
			}
		});
	};

	HarmonizerController.prototype.updateHarmonizeView = function(leadsheet) {
		if (typeof leadsheet !== "undefined") {
			var songModel = new SongModel(leadsheet);
			// TODO editor is not defined here
			editor.songModel = songModel;
			editor.viewer.draw(editor);
			playerModel.initFromSongModel(songModel);
			$.publish('SongModel-reinit');
		}
	};

	return HarmonizerController;
});