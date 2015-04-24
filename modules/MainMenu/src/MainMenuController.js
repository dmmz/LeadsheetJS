define([
	'modules/MainMenu/src/MainMenuModel',
	'pubsub',
	'mustache'
], function(MainMenuModel, pubsub, Mustache) {
	/**
	 * MainMenuController is the model containing a set of menu, each menu contain at least a title
	 */
	function MainMenuController(model) {
		this.model = model || new MainMenuModel();
		var self = this;
		$.subscribe('MainMenuView-active_menu', function(el, menuTitle) {
			self.activeMenu(menuTitle);
		});
	}

	MainMenuController.prototype.activeMenu = function(menuTitle) {
		var index = this.model.searchMenuIndex(menuTitle);
		if (index !== -1) {
			var currentMenu = this.model.getMenu(index);
			this.model.setCurrentMenu(currentMenu);
			this.pushStateTab(menuTitle);
		}
	};

	MainMenuController.prototype.pushStateTab = function(tabName) {
		var stateObject = {};
		var title = "";
		var newUrl = window.location.href.split("#")[0] + '#' + tabName;
		history.pushState(stateObject, title, newUrl);
	};

	return MainMenuController;
});