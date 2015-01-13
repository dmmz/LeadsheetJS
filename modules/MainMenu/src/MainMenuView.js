define([
	'modules/MainMenu/src/MainMenuModel',
	'pubsub',
	'mustache'
], function(MainMenuModel, pubsub, Mustache) {
	/**
	 * MainMenuView is the model containing a set of menu, each menu contain at least a title
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
				$.publish('MainMenuView-render');
			});
		}
	}

	MainMenuView.prototype.initView = function(parentHTML, callback) {
		var self = this;
		$.get('/modules/MainMenu/src/MainMenuTemplate.html', function(template) {
			var rendered = Mustache.render(template);
			parentHTML.innerHTML += rendered;
			self.el = rendered;
			if (typeof callback === "function") {
				callback();
			}
		});
	};

	MainMenuView.prototype.initSubscribe = function() {
		var self = this;
		$.subscribe('MainMenuModel-addMenu', function(el, menu) {
			self.addMenu(menu);
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
		var className = '';
		var menu;
		for (var i = 0, c = this.model.getMenuLength(); i < c; i++) {
			menu = this.model.getMenu(i);
			if (i === currentMenu) {
				className = 'class="' + this.selectedClassName;
			}
			first_level += '<div id="' + menu.title + '_first_level" class="first_level main_menu_item" ' + className + ' data-menuTitle="' + menu.title + '">' + menu.title + '</div>';
			second_level += '<div id="' + menu.title + '_second_level" class="second_level" data-menuTitle="' + menu.title + '">' + menu.view.el + '</div>';
		}
	};

	MainMenuView.prototype.addMenu = function(menu) {
		$('#main_menu_first_level').append('<div id="' + menu.title + '_first_level" class="first_level main_menu_item" data-menuTitle="' + menu.title + '">' + menu.title + '</div>');
		var secondLevelItem = '<div id="' + menu.title + '_second_level" class="second_level" data-menuTitle="' + menu.title + '" style="display:none">' + menu.view.el + '</div>';
		$('#main_menu_second_level').append(secondLevelItem);
		menu.view.initController();
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
		if (menu.view && typeof menu.view.activeView === "function") {
			menu.view.activeView();
		}
		// add active class
		$('#' + menu.title + '_first_level').addClass(self.selectedClassName);

		$('#' + menu.title + '_second_level').show(0, function() {
			// self.initController(menuTitle);
			// menu.initView('main_menu_second_level');
		});
	};

	return MainMenuView;
});