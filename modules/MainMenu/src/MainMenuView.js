define([
	'modules/MainMenu/src/MainMenuModel',
	'jquery',
	'pubsub',
	'mustache',
	'text!modules/MainMenu/src/MainMenuTemplate.html'
], function(MainMenuModel, $, pubsub, Mustache, MainMenuTemplate) {
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
				self.initController();
			});
		}
	}

	MainMenuView.prototype.initView = function(parentHTML, callback) {
		var self = this;
		//$.get('/modules/MainMenu/src/MainMenuTemplate.html', function(template) {
		var rendered = Mustache.render(MainMenuTemplate);
		parentHTML.innerHTML += rendered;
		self.el = parentHTML;
		if (typeof callback === "function") {
			callback();
		}
		//});
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

	MainMenuView.prototype.initController = function() {
		var self = this;
		$('body').on('click', '.main_menu_item', function() {
			var menuTitle = $(this).attr('data-menuTitle');
			$.publish('MainMenuView-active_menu', menuTitle);
		});
	};

	MainMenuView.prototype.buildMenu = function() {
		var first_level = '';
		var second_level = '';
		$('#main_menu_first_level').html();
		$('#main_menu_second_level').html();
		var currentMenu = this.model.getCurrentMenu();
		var currentMenuIndex = -1;
		if (typeof currentMenu !== "undefined") {
			currentMenuIndex = this.model.searchMenuIndex(currentMenu.title);
		}
		var firstClassName = '';
		var secondStyle = '';
		var menu;
		for (var i = 0, c = this.model.getMenuLength(); i < c; i++) {
			menu = this.model.getMenu(i);
			secondStyle = ' style="display:none"';
			firstClassName = '';
			if (i === currentMenuIndex) {
				firstClassName = this.selectedClassName;
				secondStyle = '';
			}
			first_level += '<div id="' + this._concatTitle(menu.title) + '_first_level" class="first_level main_menu_item ' + firstClassName + '" data-menuTitle="' + menu.title + '">' + menu.title + '</div>';
			second_level += '<div id="' + this._concatTitle(menu.title) + '_second_level" class="second_level" data-menuTitle="' + menu.title + '"' + secondStyle + '>' + menu.view.el + '</div>';
		}
		$('#main_menu_first_level').html(first_level);
		$('#main_menu_second_level').html(second_level);

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
		$('#main_menu_second_level > div').each(function() {
			$(this).hide();
		});
		var self = this;
		for (var i = 0, c = this.model.menuList.length; i < c; i++) {
			if (this.model.menuList[i] !== menu) {
				if (this.model.menuList[i].view && typeof this.model.menuList[i].view.unactiveView === "function") {
					this.model.menuList[i].view.unactiveView();
				}
			}
		}
		// remove active class
		$('.' + this.selectedClassName).each(function() {
			$(this).removeClass(self.selectedClassName);
		});
	};

	MainMenuView.prototype.showMenu = function(menu) {
		var self = this;
		// add active class
		$('#' + this._concatTitle(menu.title) + '_first_level').addClass(self.selectedClassName);

		$('#' + this._concatTitle(menu.title) + '_second_level').show(0, function() {
			// self.initController(menuTitle);
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