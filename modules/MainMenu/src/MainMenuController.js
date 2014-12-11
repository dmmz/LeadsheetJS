define([
	'modules/MainMenu/src/MainMenuModel',
	'utils/AjaxUtils',
	'utils/UserLog',
	'pubsub'
], function(MainMenuModel, AjaxUtils, UserLog, pubsub) {

	/**
	 * MainMenuController is the model containing a set of modules, each module contain a menu, each module contain at least a title
	 */
	function MainMenuController(option) {
		this.initEventSubscriber();
		this.mainMenu = (option && option.model) ? option.model : new MainMenuModel();
	}

	MainMenuController.prototype.initEventSubscriber = function() {

	};

	MainMenuController.prototype.hideAllMenus = function() {
		/*$('#main_menu_second_level > div').each(function() {
			$(this).hide();
		});*/
		// remove active class
		/*$('.main_menu_first_level_selected').each(function() {
			$(this).removeClass('main_menu_first_level_selected');
		});*/
	};

	MainMenuController.prototype.showMenu = function(id) {
		/*$('#' + id + '_second_level').show(0, function() {
			self.initModule(id);
		});*/
		// add active class
		// $('#' + id).addClass('main_menu_first_level_selected');
	};

	MainMenuController.prototype.initModule = function(id) {
		if (typeof currentModule.init !== "function") {
			throw "Trying to load a menu who does not have a init function";
		}
		// call module init function
		currentModule.init();

		$.publish('MainMenuController-setCurrentModule', id);

		// update view
		this.hideAllMenus();
		this.showMenu(id);

		// update model
		this.mainMenu.setCurrentMenu(id);
		var index = this.mainMenu.searchModuleIndex(id);
		var currentModule = this.mainMenu.getModule(index);

		pushStateTab(id);

		function pushStateTab(tabName) {
			var stateObject = {};
			var title = "";
			var newUrl = window.location.href.split("#")[0] + '#' + tabName;
			history.pushState(stateObject, title, newUrl);
		}
	};

	return MainMenuController;
});