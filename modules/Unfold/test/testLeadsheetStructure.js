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
				testMichelle(assert);
				testGertrudesBounce(assert);
				
				//Missing: 
				//	Coda that is not in section label ??
				//	Problem getting one bar coda from codato
				//	section x2 with no endings ??
			});
		}
	};
});