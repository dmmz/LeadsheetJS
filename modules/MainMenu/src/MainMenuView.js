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
		var self = this;
		if (typeof parentHTML !== "undefined") {
			this.initView(parentHTML, function() {
				self.initSubscribe();
				self.initController();
				$.publish('MainMenuView-ready');
			});
		}
	}

	MainMenuView.prototype.initView = function(parentHTML, callback) {
		var self = this;
		$.get('/modules/MainMenu/src/MainMenuTemplate.html', function(template) {
			var rendered = Mustache.render(template);
			parentHTML.innerHTML += rendered;
			self.el = parentHTML;
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
		$.subscribe('MainMenuModel-setCurrentMenu', function(el, menuTitle) {
			self.setCurrentMenu(menuTitle);
		});
	};

	MainMenuView.prototype.initController = function() {
		var self = this;
		$('.main_menu_item').show(0, function() {
			var id = $(this).attr('data-id');
			self.showMenu(id);
			$.publish('MainMenuView-active_menu', id);
		});
	};

	MainMenuView.prototype.addMenu = function(menu) {
		$('#main_menu_first_level').append(menu.title);
		$('#main_menu_second_level').append(menu.view.el);
	};

	MainMenuView.prototype.removeMenu = function(menu) {
		if ($('#' + menu.title).length > 0) {
			$('#main_menu_first_level').removeChild($('#' + menu.title + '_first_level')[0]);
			$('#main_menu_second_level').removeChild(menu.view.el);
		}
	};

	MainMenuView.prototype.setCurrentMenu = function(menuTitle) {
		// update view
		this.hideAllMenus();
		this.showMenu(menuTitle);
	};

	MainMenuView.prototype.hideAllMenus = function() {
		$('#main_menu_second_level > div').each(function() {
			$(this).hide();
		});
		// remove active class
		$('.main_menu_first_level_selected').each(function() {
			$(this).removeClass('main_menu_first_level_selected');
		});
	};

	MainMenuView.prototype.showMenu = function(menuTitle) {
		$('#' + menuTitle + '_second_level').show(0, function() {
			self.initController(menuTitle);
			//menu.initView('main_menu_second_level');
		});
		$('.main_menu_first_level_selected').each(function() {
			$(this).removeClass('main_menu_first_level_selected');
		});
		// add active class
		$('#' + menuTitle).addClass('main_menu_first_level_selected');
	};

	return MainMenuView;
});