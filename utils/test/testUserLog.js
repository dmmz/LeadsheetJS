define([
	'utils/UserLog',
	], function(UserLog) {
	return {
		run: function() {
			test("UserLog", function(assert) {

				var id = UserLog.log('success', 'Testing log');
				assert.ok(typeof id !== "undefined");
				assert.equal($('#logId-' + id).length, 1);


				UserLog.removeLog(id);
				assert.equal($('#logId-' + id).length, 0);
				
			});
		}
	};
});