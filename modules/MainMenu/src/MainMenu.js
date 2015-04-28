define([
		"modules/MainMenu/src/MainMenuController",
		"modules/MainMenu/src/MainMenuModel",
		"modules/MainMenu/src/MainMenuView"
	],function(MainMenuController,MainMenuModel,MainMenuView){
	
	function MainMenu(elemContainer){
		this.model = new MainMenuModel();
		this.controller = new MainMenuController(this.model);
		new MainMenuView(this.model, elemContainer);
	}
	return MainMenu;
});