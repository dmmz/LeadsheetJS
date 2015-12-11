define([
	'modules/MainMenu/src/MainMenuModel',
	'jquery',
	'pubsub',
	'mustache'
], function(MainMenuModel, $, pubsub, Mustache) {
	/**
	 * MainMenuController manages all chords edition function
	 * @exports MainMenu/MainMenuController
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
			if (this.model.isAllowChangeUrl()) {
				this.pushStateTab(menuTitle);
			}
		}
	};

	MainMenuController.prototype.pushStateTab = function(tabName) {
		var stateObject = {};
		var title = "";
		var newUrl = window.location.href.split("#")[0] + '#' + tabName;
		history.pushState(stateObject, title, newUrl);
	};

	MainMenuController.prototype.loadStateTab = function() {
		// Init menu with current location
		var id = decodeURI(window.location.href.split("#")[1]);
		if (typeof id !== "undefined") {
			this.activeMenu(id);
		}
	};

	return MainMenuController;
});