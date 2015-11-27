define([
	'modules/History/src/HistoryModel',
], function(HistoryModel) {
	return {
		run: function() {
			test("HistoryModel", function(assert) {
				var hm = new HistoryModel();
				assert.ok(hm instanceof HistoryModel);

				assert.equal(hm.historyList.length, 0, 'on initialisation, no history');
				assert.equal(hm.getCurrentPosition(), -1);
				assert.equal(hm.lastLeadsheet, null);
				
				//called by controller
				hm.addToHistory({title:'ls'}, 'initial leadsheet');
				
				assert.equal(hm.getCurrentPosition(), -1, 'tests initial lead sheet');
				assert.equal(hm.historyList.length, 0);
				assert.deepEqual(hm.lastLeadsheet, {title:'ls'});

				
				//controller does this two actions
				hm.addToHistory({title:'ls', composer:'hey'}, '1st change');
				//hm.setCurrentPosition(hm.historyList.length - 1);
				
				assert.equal(hm.getCurrentPosition(), 0, 'tests 1st change');
				assert.deepEqual(hm.lastLeadsheet, {title:'ls', composer:'hey'});

				hm.addToHistory({title:'ls', composer:'hey'}, '2nd change with no changes');
				//console.log(hm.getCurrentState());
				assert.equal(hm.getCurrentPosition(), 0, 'position has not moved because no changes were added');

				hm.addToHistory({title:'ls', composer:'hi', source:'real book'}, '2nd change, now this is a good one');
				//console.log(hm.getCurrentState());
				assert.equal(hm.getCurrentPosition(), 1, 'tests 2nd change');

				hm.addToHistory({title:'ls', composer:'hi'}, '3rd change, removed source');
				//console.log(hm.getCurrentState());
				assert.equal(hm.getCurrentPosition(), 2, 'tests 2nd change');
				
				
				hm.setCurrentPosition(hm.getCurrentPosition() - 1);
				assert.equal(hm.getCurrentPosition(), 1);
				assert.deepEqual(hm.getCurrentState(), {title:'ls', composer:'hi', source:'real book'});
				
				hm.setCurrentPosition(hm.getCurrentPosition() - 1);
				assert.equal(hm.getCurrentPosition(), 0);
				assert.deepEqual(hm.getCurrentState(), {title:'ls', composer:'hey'});

				hm.setCurrentPosition(hm.getCurrentPosition() - 1);
				assert.equal(hm.getCurrentPosition(), -1);
				assert.deepEqual(hm.getCurrentState(), {title:'ls'});
				hm.setCurrentPosition(hm.getCurrentPosition() + 3);

				assert.deepEqual(hm.getCurrentState(), {title:'ls', composer:'hi'});
				assert.equal(hm.getCurrentPosition(), 2);

			});
		}
	};
});
