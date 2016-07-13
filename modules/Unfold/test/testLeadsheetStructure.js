define([
/*	'tests/songs/AloneTogether',
	'tests/songs/unfold/DylansDelight',*/
	'modules/Unfold/test/UnfoldTester',
	'modules/Unfold/test/testSimpleUnfoldTest',
	'modules/Unfold/test/testMichelle'

], function(UnfoldTester, testSimpleUnfoldTest, testMichelle) {
	return {
		run: function() {
			test("LeadsheetStructure", function(assert) {
				//testSimpleUnfoldTest(assert);
				testMichelle(assert);
				
			});
		}
	};
});