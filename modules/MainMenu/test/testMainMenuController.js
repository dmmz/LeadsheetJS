define([
	'modules/MainMenu/src/MainMenuModel',
	'modules/MainMenu/src/MainMenuController',
	'modules/MainMenu/src/MainMenuView'
], function(MainMenuModel, MainMenuController, MainMenuView) {
	return {
		run: function() {
			test("MainMenuController", function(assert) {
				var mmc = new MainMenuController();
				assert.ok(mmc instanceof MainMenuController);

				mmc.model.addMenu({title:'Notes', view: undefined});
				mmc.model.addMenu({title:'Chords', view: undefined});
				
				mmc.activeMenu('Lyrics');
				assert.equal(mmc.model.getCurrentMenu().title, 'Notes', "Try active menu on a menu that doesn't exist. Default is the first Menu.");

				mmc.activeMenu('Chords');
				assert.equal(mmc.model.getCurrentMenu().title, 'Chords', "try to activate a menu");
			});
		}
	};
});