define([
/*	'tests/songs/AloneTogether',
	'tests/songs/unfold/DylansDelight',*/
	'modules/Unfold/test/testSimpleUnfoldTest',
	'modules/Unfold/test/testMichelle',
	'modules/Unfold/test/testGertrudesBounce'

], function(testSimpleUnfoldTest, testMichelle, testGertrudesBounce) {
	return {
		run: function() {
			test("LeadsheetStructure", function(assert) {
				testSimpleUnfoldTest(assert);
				// testMichelle(assert);
				// testGertrudesBounce(assert);
				//tested also with songs with coda where coda section has no name
				
			});
		}
	};
});