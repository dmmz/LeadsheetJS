define([
	"modules/MainMenu/src/MainMenuController",
	"modules/MainMenu/src/MainMenuModel",
	"modules/MainMenu/src/MainMenuView"
], function(MainMenuController, MainMenuModel, MainMenuView) {
	/**
	 * MainMenu constructor
	 * @exports MainMenu
	 */
	function MainMenu(elemContainer, allowChangeUrl) {
		this.model = new MainMenuModel(allowChangeUrl);
		this.controller = new MainMenuController(this.model);
		new MainMenuView(this.model, elemContainer);
	}
	return MainMenu;
});