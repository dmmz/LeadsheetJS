define([
	'modules/MainMenu/src/MainMenuModel',
	'modules/MainMenu/src/MainMenuController',
	'modules/MainMenu/src/MainMenuView',
	'modules/Harmonizer/src/HarmonizerController',
	'modules/Harmonizer/src/HarmonizerView',
], function(MainMenuModel, MainMenuController, MainMenuView, HarmonizerController, HarmonizerView) {
	return {
		run: function() {
			test("MainMenuController", function(assert) {
				//var menu = new MainMenuModel();
				
				//var menuView = new MainMenuView(menu, document.getElementsByTagName('body')[0]);

				var mmc = new MainMenuController();
				assert.ok(mmc instanceof MainMenuController);

				/*
				$.subscribe('MainMenuView-ready', function(el) {
					var hv = new HarmonizerView($('#main_menu_second_level')[0]);
					var hc = new HarmonizerController(undefined,hv);
					menu.addMenu({title:'Harmonizer', view: hv});
				});
				*/
			});
		}
	};
});