define(['modules/core/src/SectionModel'], function(SectionModel) {
	return {
		run: function()
		{
			test("Section model", function(assert) {

				//constructor
				var section = new SectionModel({
					numberOfBars: 10,
					name: "A",
					repeatTimes:1,
					style:"jazz"
				});
				assert.equal(section.getName(),"A","testing constructor");
				assert.equal(section.getRepeatTimes(),1);
				assert.equal(section.getNumberOfBars(),10);
				assert.equal(section.getStyle(),"jazz");
				assert.throws(function(){
					section.setRepeatTimes(-2);
				});

				/* A section with structure [0,1,2,3,4,5,6-{ending:1},7,8-{ending:2}, 9] is a typical section with 10 bars, 
				that becomes 16 when unfolded: 
											[0,1,2,3,4,5,6,7,
											[0,1,2,3,4,5,8,9]
					so we ask for section unfolded with 16 bars (value calculated from the length of the array returned 
					by songModel.getUnfoldedSongSection() )
				*/
				assert.throws(function(){
					section.cloneUnfolded();
				},"cloneUnfolded with no param throws exception");
				
				var unfoldedSection = section.cloneUnfolded(16);
				assert.equal(unfoldedSection.getName(),section.getName(),"testing unfoldedSection");
				assert.equal(unfoldedSection.getRepeatTimes(),0);
				assert.equal(unfoldedSection.getNumberOfBars(),16);
				assert.equal(unfoldedSection.getStyle(),section.getStyle());



			});
		}
	};
});