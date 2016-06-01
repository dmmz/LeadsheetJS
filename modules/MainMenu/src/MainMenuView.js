define([
	'modules/MainMenu/src/MainMenuModel',
	'jquery',
	'mustache',
	'text!modules/MainMenu/src/MainMenuTemplate.html'
], function(MainMenuModel, $, Mustache, MainMenuTemplate) {
	/**
	 * MainMenuView is the model containing a set of menu, each menu contain at least a title
	 * MainMenuView creates menu template and call each view of menu that are loaded
	 * @exports MainMenu/MainMenuView
	 */
	function MainMenuView(model, parentHTML) {
		this.model = (model) ? model : new MainMenuModel();
		this.el = undefined;
		this.selectedClassName = 'main_menu_first_level_selected';
		var self = this;

		if (typeof parentHTML !== "undefined") {
			this.initView(parentHTML, function() {
				self.initSubscribe();
			});
		}
	}

	MainMenuView.prototype.initView = function(parentHTML, callback) {
		var self = this;
		var rendered = Mustache.render(MainMenuTemplate);
		parentHTML.innerHTML += rendered;
		self.el = parentHTML;
		if (typeof callback === "function") {
			callback();
		}
	};

	MainMenuView.prototype.initSubscribe = function() {
		var self = this;
		$.subscribe('MainMenuModel-addMenu', function(el, menu) {
			// we rebuild everything to take into account the order
			self.removeMenu();
			self.buildMenu();
		});
		$.subscribe('MainMenuModel-removeMenu', function(el, menu) {
			self.removeMenu(menu);
		});
		$.subscribe('MainMenuModel-setCurrentMenu', function(el, menu) {
			self.setCurrentMenu(menu);
		});
	};

	MainMenuView.prototype.buildMenu = function() {
		/*function getMenuItem($first_level_main_menu_item_tpl){
			var $first_level_menu_item = $first_level_main_menu_item_tpl.clone();
			$first_level_menu_item.text(menu.title);
			$first_level_menu_item.data('menuTitle', menu.title);
			$first_level_menu_item.attr({'id': titleConcat + '_first_level', 'href': '#' + menu.title});
			return $first_level_menu_item;
		}*/

		function getMenuItem() {
			return $('<li></li>').attr({role: 'presentation'/*, class: 'active'*/}).append(
				$('<a></a>').attr({href:'#' + menu.title}).text(menu.title)
			);
			
		}
		var second_level = '';
		var $main_menu_first_level = $('#main_menu_first_level');
		var $first_level_main_menu_item_tpl = $('<a class="first_level main_menu_item"></a>');
		var $main_menu_second_level = $('#main_menu_second_level');
		var $second_level_menu_item_tpl = $('<div class="second_level"></div>');
		var currentMenu = this.model.getCurrentMenu();
		var currentMenuIndex = -1;
		if (typeof currentMenu !== "undefined") {
			currentMenuIndex = this.model.searchMenuIndex(currentMenu.title);
		}
		var secondStyle = '';
		var menu;
		for (var i = 0, c = this.model.getMenuLength(); i < c; i++) {
			menu = this.model.getMenu(i);
			var titleConcat = this._concatTitle(menu.title);
			// first level item
			var $first_level_menu_item = getMenuItem($first_level_main_menu_item_tpl);
		
			// second level item
			var $second_level_menu_item = $second_level_menu_item_tpl.clone();
			$second_level_menu_item.html(menu.view.el);
			$second_level_menu_item.attr({'id': titleConcat + '_second_level'});
			if (i === currentMenuIndex) {
				$first_level_menu_item.addClass(this.selectedClassName);
			} else {
				$second_level_menu_item.hide();
			}
			$main_menu_first_level.append($first_level_menu_item);
			$main_menu_second_level.append($second_level_menu_item);
		}
		// init controller
		for (i = 0, c = this.model.getMenuLength(); i < c; i++) {
			menu = this.model.getMenu(i);
			menu.view.initController();
		}
		$.publish('MainMenuView-render');
	};

	MainMenuView.prototype.removeMenu = function(menuTitle) {
		$('#' + menuTitle + '_first_level').remove();
		$('#' + menuTitle + '_second_level').remove();
	};

	MainMenuView.prototype.setCurrentMenu = function(menu) {
		// update view
		this.hideAllMenus(menu);
		this.showMenu(menu);
	};

	MainMenuView.prototype._concatTitle = function(title) {
		return title.replace(' ', '_');
	};

	MainMenuView.prototype.hideAllMenus = function(menu) {
		$('#main_menu_second_level > div').hide();
		var self = this;
		for (var i = 0, c = this.model.menuList.length; i < c; i++) {
			if (this.model.menuList[i] !== menu) {
				if (this.model.menuList[i].view && typeof this.model.menuList[i].view.unactiveView === "function") {
					this.model.menuList[i].view.unactiveView();
				}
			}
		}
		// remove active class
		$('.' + this.selectedClassName).removeClass(this.selectedClassName);
	};

	MainMenuView.prototype.showMenu = function(menu) {
		// add active class
		$('#' + this._concatTitle(menu.title) + '_first_level').addClass(this.selectedClassName);
		$('#' + this._concatTitle(menu.title) + '_second_level').show(0, function() {
			if (typeof menu.view.activeView === "function") {
				menu.view.activeView();
			}
		});
	};


	MainMenuView.prototype.hide = function() {
		this.el.style.display = "none";
	};

	MainMenuView.prototype.show = function() {
		this.el.style.display = "block";
	};


	return MainMenuView;
});