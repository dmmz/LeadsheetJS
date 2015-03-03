define([
	'modules/Cursor/src/CursorModel',
], function(CursorModel) {
	return {
		run: function() {
			test("CursorModel", function(assert) {
				
				var cm = new CursorModel(10);

				// test init
				
				assert.ok(cm instanceof CursorModel);
				assert.deepEqual(cm.getPos(), [0, 0]);
				
				// Basic setter and getter
				cm.setPos(4);
				assert.deepEqual(cm.getPos(), [4, 4]);

				cm.setPos([5,6]);
				assert.deepEqual(cm.getPos(), [5, 6]);

				assert.equal(cm.getStart(), 5);
				assert.equal(cm.getEnd(), 6);

				cm.setIndexPos(1, 7);
				assert.deepEqual(cm.getPos(), [5, 7]);

				cm.setIndexPos(0, 4);
				assert.deepEqual(cm.getPos(), [4, 7]);

				assert.equal(cm.getListLength(), 10, 'length');

				// reset
				cm.reset();
				assert.deepEqual(cm.getPos(), [0, 0], 'reset');
 
				// cursor move, expand, increment etc
				cm.expand(1, 10);
				assert.deepEqual(cm.getPos(), [0, 1]);

				cm.increment(5);
				assert.deepEqual(cm.getPos(), [5, 6]);

				cm.expand(1, 10);
				assert.deepEqual(cm.getPos(), [5, 7]);

				cm.expand(-1, 10);
				assert.deepEqual(cm.getPos(), [5, 6]);

				cm.expand(-1, 10);
				assert.deepEqual(cm.getPos(), [5, 5]);
			});
		}
	};
});
