define([
	'mustache',
	'modules/core/src/SongModel',
	'modules/Harmonizer/src/HarmonizeAPI',
	'utils/UserLog',
	'pubsub',
], function(Mustache, SongModel, HarmonizeAPI, UserLog, pubsub) {

	function HarmonizerController(view) {
		this.view = view;
		var self = this;
		$.subscribe('HarmonizerView-compute', function(el, idSong, style) {
			self.computeHarmonize(idSong, style);
		});
	}

	HarmonizerController.prototype.initController = function() {
		var self = this;
		$('#harmonize').click(function() {
			self.computeHarmonize(idSong, style);
			return false;
		});
	};

	HarmonizerController.prototype.computeHarmonize = function(idSong, style) {
		var self = this;
		if (!style) {
			style = "Take6";
		}
		$('#harmonize').html('Computing <div id="followingBallsG"><div id="followingBallsG_1" class="followingBallsG"></div><div id="followingBallsG_2" class="followingBallsG"></div><div id="followingBallsG_3" class="followingBallsG"></div><div id="followingBallsG_4" class="followingBallsG"></div></div>');
		var harm = new HarmonizeAPI();
		harm.harmonizeAPI(idSong, style, function(data) {
			$('#harmonize').html('Harmonize');
			if (data.success === true) {
				UserLog.logAutoFade('success', 'Harmonization is finished');
				this.view.updateHarmonizeView(data.sequence);
			} else {
				UserLog.logAutoFade('error', 'Harmonization is finished');
			}
		});
	};

	return HarmonizerController;
});