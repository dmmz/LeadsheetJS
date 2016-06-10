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
			
			});
		}
	};
});