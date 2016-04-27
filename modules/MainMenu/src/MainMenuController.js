define([
	'modules/MainMenu/src/MainMenuModel',
	'jquery',
], function(MainMenuModel, $) {
	/**
	 * MainMenuController manages all chords edition function
	 * @exports MainMenu/MainMenuController
	 */
	function MainMenuController(model) {
		this.model = model || new MainMenuModel();
		var self = this;
		// $.subscribe('MainMenuView-active_menu', function(el, menuTitle) {
		// 	self.activeMenu(menuTitle);
		// });
		$(window).on('hashchange', function() {
			self.loadStateTab.apply(self, arguments);
		});
	}

	MainMenuController.prototype.activeMenu = function(menuTitle) {
		menuTitle = menuTitle || 'File';
		var index = this.model.searchMenuIndex(menuTitle);
		index = index === -1 ? 0 : index;
		var currentMenu = this.model.getMenu(index);
		this.model.setCurrentMenu(currentMenu);	
	};

	MainMenuController.prototype.loadStateTab = function() {
		// Init menu with current hash
		this.activeMenu(window.location.hash.substring(1));
	};

	return MainMenuController;
});