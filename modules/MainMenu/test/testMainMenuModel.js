define([
	'modules/MainMenu/src/MainMenuModel',
], function(MainMenuModel) {
	return {
		run: function() {
			test("MainMenuModel", function(assert) {
				
				var mm = new MainMenuModel();
				assert.ok(mm instanceof MainMenuModel);


				// get and set current menu
				assert.equal(mm.getCurrentMenu(), undefined);
				mm.setCurrentMenu('title');
				assert.equal(mm.getCurrentMenu('title'), 'title');

				// add module
				assert.ok(mm.hasMenu('menu1') === false);
				assert.equal(mm.getMenuLength(), 0);
				mm.addMenu({title:'menu1'});

				assert.equal(mm.getMenuLength(), 1);
				assert.ok(mm.hasMenu('menu1') === true);

				// remove Menu
				var mm2 = new MainMenuModel();
				mm2.addMenu({title:'menu1'});
				mm2.addMenu({title:'menu2'});
				mm2.addMenu({title:'menu3'});
				assert.equal(mm2.getMenuLength(), 3);
				assert.ok(mm2.removeMenu('menu2'));
				assert.equal(mm2.getMenuLength(), 2);

			});
		}
	};
});
