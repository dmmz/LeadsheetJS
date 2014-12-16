define([
	'modules/ModuleManager/src/ModuleManager',
], function(ModuleManager) {
	return {
		run: function() {
			test("ModuleManager", function(assert) {
				
				var mm = new ModuleManager();
				assert.ok(mm instanceof ModuleManager);

				// add module
				assert.ok(mm.hasModule('menu1') === false);
				assert.equal(mm.getModuleLength(), 0);
				mm.addModule({title:'menu1'});

				assert.equal(mm.getModuleLength(), 1);
				assert.ok(mm.hasModule('menu1') === true);

				// remove module
				var mm2 = new ModuleManager();
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
