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
				assert.equal(mmc.model.getCurrentMenu(), undefined, "Try active menu on a menu that doesn't exist");

				mmc.activeMenu('Notes');
				assert.equal(mmc.model.getCurrentMenu().title, 'Notes', "try to activate a menu");
			});
		}
	};
});