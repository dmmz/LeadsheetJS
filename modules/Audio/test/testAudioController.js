define([
	'modules/Audio/src/AudioController',
], function(AudioController) {
	return {
		run: function() {
			test("AudioController", function(assert) {
				
				var audio = new AudioController();
				assert.equal(audio._calcTime(1500, 2, 4), 1500);
				assert.equal(audio._calcTime(2000,   2, 4), 2000);
				assert.equal(audio._calcTime(3500, 2, 4), 3500);
				assert.equal(audio._calcTime(4000,	  2, 4), 2000);
				assert.equal(audio._calcTime(4500, 2, 4), 2500);
				assert.equal(audio._calcTime(5500, 2, 4), 3500);
				assert.equal(audio._calcTime(6500, 2, 4), 2500);


			});
		}
	};
});
