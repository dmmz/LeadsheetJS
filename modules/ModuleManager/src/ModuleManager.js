define([
], function() {

	/**
	 * ModuleManager is the model containing a set of modules, each module contain a menu, each module contain at least a title
	 */
	function ModuleManager() {
		this.modules = []; // array of menus
	}

	ModuleManager.prototype.getModuleLength = function() {
		return this.modules.length;
	};

	ModuleManager.prototype.getModule = function(index) {
		if (isNaN(index) || typeof this.modules[index] === "undefined") {
			throw 'ModuleManager - getModule - index is undefined or is not a number or doesnt exist';
		}
		return this.modules[index];
	};

	ModuleManager.prototype.addModule = function(module) {
		if (typeof module === "undefined" || module.title == "undefined") {
			throw 'ModuleManager - addModule - module is undefined';
		}
		if (this.hasModule(module.title) === false) {
			this.modules.push(module);
		} else {
			console.warn('ModuleManager - addModule - module ' + module + ' already exist');
		}
	};

	ModuleManager.prototype.hasModule = function(moduleTitle) {
		if (typeof moduleTitle === "") {
			throw "ModuleManager - hasModule - moduleTitle can't be equal to an empty string";
		}
		for (var i = 0, c = this.modules.length; i < c; i++) {
			if (this.modules[i].title === moduleTitle) {
				return true;
			}
		}
		return false;
	};

	ModuleManager.prototype.searchModuleIndex = function(moduleTitle) {
		if (typeof moduleTitle === "") {
			throw "ModuleManager - searchModuleIndex - moduleTitle can't be equal to an empty string";
		}
		for (var i = 0, c = this.modules.length; i < c; i++) {
			if (this.modules[i].title === moduleTitle) {
				return i;
			}
		}
		return -1;
	};

	ModuleManager.prototype.removeModule = function(moduleTitle) {
		var index = this.searchModuleIndex(moduleTitle);
		if (index !== -1) {
			this.modules.splice(index, 1);
			return true;
		}
		return false;
	};


	return ModuleManager;
});