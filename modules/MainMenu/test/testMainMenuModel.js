define([
	'modules/core/src/SongModel',
	'modules/MainMenu/src/MainMenuModel',
	'utils/AjaxUtils',
	'utils/UserLog',
	'pubsub'
], function(SongModel, MainMenuModel, AjaxUtils, UserLog, pubsub) {
	return {
		run: function() {
			test("MainMenuModel", function(assert) {
				
				var mm = new MainMenuModel();
				assert.ok(mm instanceof MainMenuModel);

				// get and set current menu
				assert.equal(mm.getCurrentMenu(), undefined);
				mm.setCurrentMenu('title');


				// add module
				assert.ok(mm.hasModule('menu1') === false);
				assert.equal(mm.getModuleLength(), 0);
				mm.addModule({title:'menu1'});

				assert.equal(mm.getModuleLength(), 1);
				assert.ok(mm.hasModule('menu1') === true);

				// remove module
				var mm2 = new MainMenuModel();
				mm2.addModule({title:'menu1'});
				mm2.addModule({title:'menu2'});
				mm2.addModule({title:'menu3'});
				assert.equal(mm2.getModuleLength(), 3);
				assert.ok(mm2.removeModule('menu2'));
				assert.equal(mm2.getModuleLength(), 2);


			});
		}
	};
});
