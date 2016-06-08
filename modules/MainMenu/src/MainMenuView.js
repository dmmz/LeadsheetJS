define([
	'modules/MainMenu/src/MainMenuModel',
	'jquery',
	'mustache',
	'text!modules/MainMenu/src/MainMenuTemplate.html',
	'bootstrap'
], function(MainMenuModel, $, Mustache, MainMenuTemplate) {
	/**
	 * MainMenuView is the model containing a set of menu, each menu contain at least a title
	 * MainMenuView creates menu template and call each view of menu that are loaded
	 * @exports MainMenu/MainMenuView
	 */
	function MainMenuView(model, parentHTML) {
		this.model = (model) ? model : new MainMenuModel();
		this.el = undefined;
		this.selectedClassName = 'active';
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
		// $.subscribe('MainMenuModel-setCurrentMenu', function(el, menu) {
		// 	self.setCurrentMenu(menu);
		// });
	};

	MainMenuView.prototype.buildMenu = function() {

		function getMenuItem(menuTitle) {
			return $('<li></li>').attr({role: 'presentation'}).append(
				$('<a></a>').attr({href:'#' + menuTitle, 'aria-controls': menuTitle, role: 'tab'}).text(menu.title)
			);
			
		}
		var $main_menu_first_level = $('#main_menu_first_level');
		var $main_menu_second_level = $('#main_menu_second_level').addClass('tab-content');
		var $second_level_menu_item_tpl = $('<div role="tabpanel" class="tab-pane"></div>');
		var currentMenu = this.model.getCurrentMenu();
		var currentMenuIndex = 0;
		if (typeof currentMenu !== "undefined") {
			currentMenuIndex = this.model.searchMenuIndex(currentMenu.title);
		}
		var secondStyle = '';
		var menu;
		for (var i = 0, c = this.model.getMenuLength(); i < c; i++) {
			menu = this.model.getMenu(i);
			var titleConcat = this.model.getMenuIdFromTitle(menu.title);
			// first level item
			var $first_level_menu_item = getMenuItem(titleConcat);
		
			// second level item
			var $second_level_menu_item = $second_level_menu_item_tpl.clone();
			$second_level_menu_item.html(menu.view.el);
			$second_level_menu_item.attr({'id': titleConcat});
			if (i === currentMenuIndex) {
				$first_level_menu_item.addClass(this.selectedClassName);
				$second_level_menu_item.addClass(this.selectedClassName);
			}
			$main_menu_first_level.append($first_level_menu_item);
			$main_menu_second_level.append($second_level_menu_item);
			$first_level_menu_item.find('a').click(this.setCurrentMenu);
		}
		// init controller
		for (i = 0, c = this.model.getMenuLength(); i < c; i++) {
			menu = this.model.getMenu(i);
			menu.view.initController();
		}
		$.publish('MainMenuView-render');
	};

	MainMenuView.prototype.removeMenu = function(menuTitle) {
		$('#' + menuTitle).remove();
		$('#' + menuTitle).remove();
	};

	MainMenuView.prototype.setCurrentMenu = function() {
		// this is the <a> clicked 
	  	$(this).tab('show');
	};

	MainMenuView.prototype.hide = function() {
		this.el.style.display = "none";
	};

	MainMenuView.prototype.show = function() {
		this.el.style.display = "block";
	};

	return MainMenuView;
});