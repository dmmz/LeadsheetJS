define([
	'modules/core/src/SongModel',
	'utils/AjaxUtils',
	'utils/UserLog',
	'pubsub'
], function(SongModel, AjaxUtils, UserLog, pubsub) {

	/**
	 * MainMenuModel is the model containing a set of modules, each module contain a menu, each module contain at least a title
	 */
	function MainMenuModel() {
		this.modules = []; // array of menus
		this.currentMenu = this.modules[0]; // Current menu represent the current selected module
	}

	MainMenuModel.prototype.getModuleLength = function(module) {
		return this.modules.length;
	};

	MainMenuModel.prototype.getModule = function(index) {
		if (typeof index === "undefined" || isNaN(index) || typeof this.modules[index]) {
			throw 'MainMenuModel - getModule - index is undefined or is not a number or doesnt exist';
		}
		return this.modules[index];
	};

	MainMenuModel.prototype.addModule = function(module) {
		if (typeof module === "undefined" || module.title == "undefined") {
			throw 'MainMenuModel - addModule - module is undefined';
		}
		if (this.hasModule(module.title) === false) {
			this.modules.push(module);
		} else {
			console.warn('MainMenuModel - addModule - module ' + module + ' already exist');
		}
	};

	MainMenuModel.prototype.hasModule = function(moduleTitle) {
		if (typeof moduleTitle === "") {
			throw "MainMenuModel - hasModule - moduleTitle can't be equal to an empty string";
		}
		for (var i = 0, c = this.modules.length; i < c; i++) {
			if (this.modules[i].title === moduleTitle) {
				return true;
			}
		}
		return false;
	};

	MainMenuModel.prototype.searchModuleIndex = function(moduleTitle) {
		if (typeof moduleTitle === "") {
			throw "MainMenuModel - searchModuleIndex - moduleTitle can't be equal to an empty string";
		}
		for (var i = 0, c = this.modules.length; i < c; i++) {
			if (this.modules[i].title === moduleTitle) {
				return i;
			}
		}
		return -1;
	};

	MainMenuModel.prototype.removeModule = function(moduleTitle) {
		var index = this.searchModuleIndex(moduleTitle);
		if (index !== -1) {
			this.modules.splice(index, 1);
			return true;
		}
		return false;
	};

	MainMenuModel.prototype.getCurrentMenu = function() {
		return this.currentMenu;
	};

	MainMenuModel.prototype.setCurrentMenu = function(currentMenu) {
		if (typeof currentMenu === "undefined") {
			return;
		}
		this.currentMenu = currentMenu;
	};

	return MainMenuModel;
});