define([
	'modules/Audio/src/AudioController',
], function(AudioController) {
	return {
		run: function() {
			test("AudioController", function(assert) {
				
				var audio = new AudioController();
				console.log(audio);
				assert.equal(audio._calcTime(1.5, 2, 4), 1.5);
				assert.equal(audio._calcTime(2,   2, 4), 2);
				assert.equal(audio._calcTime(3.5, 2, 4), 3.5);
				assert.equal(audio._calcTime(4,	  2, 4), 2);
				assert.equal(audio._calcTime(4.5, 2, 4), 2.5);
				assert.equal(audio._calcTime(5.5, 2, 4), 3.5);
				assert.equal(audio._calcTime(6.5, 2, 4), 2.5);


			});
		}
	};
});
