define(['modules/core/src/TimeSignatureModel'], function(TimeSignatureModel) {
	return {
		run: function()
		{
			test("Time Signature", function(assert) {
				assert.throws(function(){new TimeSignatureModel("timesign/notvalid");});

				var timeSig = new TimeSignatureModel("5/4");
				assert.equal(timeSig.getBeats(),5);
				assert.equal(timeSig.getQuarterBeats(),5);
				
				timeSig = new TimeSignatureModel("3/8");
				assert.equal(timeSig.getBeats(),3);
				assert.equal(timeSig.getQuarterBeats(),1.5);
			});

		}
	};
});