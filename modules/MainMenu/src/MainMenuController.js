define([
	'modules/MainMenu/src/MainMenuModel',
	'pubsub',
	'mustache'
], function(MainMenuModel, pubsub, Mustache) {
	/**
	 * MainMenuController is the model containing a set of menu, each menu contain at least a title
	 */
	function MainMenuController(model, view) {
		this.model = model || new MainMenuModel();
		this.view = view;

		$.subscribe('MainMenuView-active_menu', function(el, id) {
			self.activeMenu(id);
		});
	}

	MainMenuController.prototype.activeMenu = function(id) {
		var index = this.mainMenu.searchMenuIndex(id);
		// TODO display error in case there is one
		var currentMenu = this.mainMenu.getMenu(index);
		this.model.setCurrentMenu(currentMenu);
		this.pushStateTab(id);
	};

	MainMenuController.prototype.pushStateTab = function(tabName) {
		var stateObject = {};
		var title = "";
		var newUrl = window.location.href.split("#")[0] + '#' + tabName;
		history.pushState(stateObject, title, newUrl);
	};

	return MainMenuController;
});