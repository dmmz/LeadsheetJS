define([
	'pubsub',
], function(pubsub) {

	/**
	 * MainMenuModel is the model containing a set of menuList, each menuList contain a menu, each menu contain at least a title
	 */
	function MainMenuModel() {
		this.menuList = []; // array of menus
		this.currentMenu = this.menuList[0]; // Current menu represent the current selected menu
	}


	MainMenuModel.prototype.getMenuLength = function() {
		return this.menuList.length;
	};

	MainMenuModel.prototype.getMenu = function(index) {
		if (isNaN(index) || typeof this.menuList[index] === "undefined") {
			throw 'MainMenuModel - getMenu - index is undefined or is not a number or doesnt exist ' + index;
		}
		return this.menuList[index];
	};

	MainMenuModel.prototype.addMenu = function(menu) {
		if (typeof menu === "undefined" || menu.title == "undefined") {
			throw 'MainMenuModel - addMenu - menu is undefined';
		}
		if (this.hasMenu(menu.title) === false) {
			this.menuList.push(menu);
			$.publish('MainMenuModel-addMenu', menu);
		} else {
			console.warn('MainMenuModel - addMenu - menu ' + menu.title + ' already exist');
		}
	};

	MainMenuModel.prototype.hasMenu = function(menuTitle) {
		if (typeof menuTitle === "") {
			throw "MainMenuModel - hasModule - menuTitle can't be equal to an empty string";
		}
		for (var i = 0, c = this.menuList.length; i < c; i++) {
			if (this.menuList[i].title === menuTitle) {
				return true;
			}
		}
		return false;
	};

	MainMenuModel.prototype.searchMenuIndex = function(menuTitle) {
		if (typeof menuTitle === "") {
			throw "MainMenuModel - searchMenuIndex - menuTitle can't be equal to an empty string";
		}
		for (var i = 0, c = this.menuList.length; i < c; i++) {
			if (this.menuList[i].title === menuTitle) {
				return i;
			}
		}
		return -1;
	};

	MainMenuModel.prototype.removeMenu = function(menuTitle) {
		var index = this.searchMenuIndex(menuTitle);
		if (index !== -1) {
			this.menuList.splice(index, 1);
			$.publish('MainMenuModel-removeMenu', menuTitle);
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
		$.publish('MainMenuModel-setCurrentMenu', this.currentMenu);
	};

	return MainMenuModel;
});