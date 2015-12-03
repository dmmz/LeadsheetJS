define([
	'modules/History/src/HistoryModel',
	'modules/History/src/HistoryController',
], function(HistoryModel, HistoryController) {
	return {
		run: function() {
			test("HistoryController", function(assert) {

				var hm = new HistoryModel();

				var hc = new HistoryController(hm);

				hc.addToHistory({}, 'test');
				hc.addToHistory({}, 'test2');
				assert.equal(hm.historyList.length, 2);

				//Following tests are commented because sometimes gives error due to the publish to the drawer
				//There are test already on HistoryModel
				//
				/*hc.loadHistory(0);
				assert.equal(hm.getCurrentPosition(), 0);

				hc.moveSelectHistory(1);
				assert.equal(hm.getCurrentPosition(), 1);

				hc.moveSelectHistory(-1);
				assert.equal(hm.getCurrentPosition(), 0);
				*/
			});
		}
	};
});
