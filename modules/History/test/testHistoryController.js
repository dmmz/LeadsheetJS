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

				hc.loadHistory(0);
				assert.equal(hm.getCurrentPosition(), 0);

				hc.moveSelectHistory(1);
				assert.equal(hm.getCurrentPosition(), 1);

				hc.moveSelectHistory(-1);
				assert.equal(hm.getCurrentPosition(), 0);

			});
		}
	};
});
