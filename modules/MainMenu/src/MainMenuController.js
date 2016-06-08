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

	MainMenuController.prototype.loadStateTab = function() {
		// Init menu with current hash
		if (window.location.hash.substring(1)) {
			this.model.setCurrentMenuById(window.location.hash.substring(1));	
		}
	};

	return MainMenuController;
});