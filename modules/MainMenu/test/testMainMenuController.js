define([
	'modules/core/src/SongModel',
	'modules/MainMenu/src/MainMenuModel',
	'modules/MainMenu/src/MainMenuController',
	'utils/AjaxUtils',
	'utils/UserLog',
	'pubsub'
], function(SongModel, MainMenuModel, MainMenuController, AjaxUtils, UserLog, pubsub) {
	return {
		run: function() {
			test("MainMenuController", function(assert) {
				var mmc = new MainMenuController();
				assert.ok(mmc instanceof MainMenuController);
			});
		}
	};
});
