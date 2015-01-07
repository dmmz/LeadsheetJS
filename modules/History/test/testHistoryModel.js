define([
	'modules/History/src/HistoryModel',
], function(HistoryModel) {
	return {
		run: function() {
			test("HistoryModel", function(assert) {
				
				var hm = new HistoryModel();
				assert.ok(hm instanceof HistoryModel);

				hm.addToHistory({}, 'test');
				assert.equal(hm.historyList.length, 1);

				assert.equal(hm.getCurrentPosition(), 0);
				hm.setCurrentPosition(0);
				assert.equal(hm.getCurrentPosition(), 0);

				hm.addToHistory({}, 'test2');
				hm.setCurrentPosition(1);
				assert.equal(hm.getCurrentPosition(), 1);

			});
		}
	};
});
