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
				var menu = new MainMenuModel();
				menu.addModule({title:'menu1'});

				var mmc = new MainMenuController(menu);
				assert.ok(mmc instanceof MainMenuController);

				assert.throws(function() {
					mmc.initModule('menu1');
				});
			});
		}
	};
});
