define([
	'modules/core/src/SongModel',
	'modules/Harmonizer/src/HarmonizerController',
	'utils/AjaxUtils',
	'utils/UserLog',
	'pubsub'
], function(SongModel, HarmonizerController, AjaxUtils, UserLog, pubsub) {
	return {
		run: function() {
			test("HarmonizerController", function(assert) {
				
				var hc = new HarmonizerController();
				assert.ok(hc instanceof HarmonizerController);

				// hc.computeHarmonize('517cc0c058e3388155000001', 'Take6');
				
				//expect(0);
			});
		}
	};
});
