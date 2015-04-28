define([
		"modules/MainMenu/src/MainMenuController",
		"modules/MainMenu/src/MainMenuModel",
		"modules/MainMenu/src/MainMenuView"
	],function(MainMenuController,MainMenuModel,MainMenuView){
	
	function MainMenu(elemContainer){
		this.model = new LJS.MainMenu.MainMenuModel();
		this.controller = LJS.MainMenu.MainMenuController(this.model);
		new LJS.MainMenu.MainMenuView(this.model, elemContainer);
	}
	return MainMenu;
});