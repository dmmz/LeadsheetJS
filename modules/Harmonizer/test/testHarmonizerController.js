define([
	'modules/Harmonizer/src/HarmonizerController',
], function(HarmonizerController) {
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