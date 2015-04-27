define([
		"modules/MainMenu/src/MainMenuController",
		"modules/MainMenu/src/MainMenuModel",
		"modules/MainMenu/src/MainMenuView",
	],
	function(MainMenuController, MainMenuModel, MainMenuView) {
		return {
			"MainMenuController": MainMenuController,
			"MainMenuModel": MainMenuModel,
			"MainMenuView": MainMenuView,
		};
	}
);