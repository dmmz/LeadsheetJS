define([
	'utils/ChordUtils',
], function(ChordUtils) {
	return {
		run: function() {
			test("ChordUtils", function(assert) {

				assert.deepEqual(ChordUtils.string2Json("Ab7"),{
					p:'Ab',
					ch: '7'
				});

				assert.deepEqual(ChordUtils.string2Json("Gm7"),{
					p:'G',
					ch: 'm7'
				});
				
				assert.deepEqual(ChordUtils.string2Json("C#halfdim7"),{
					p:'C#',
					ch: 'halfdim7'
				});

				assert.deepEqual(ChordUtils.string2Json("C_#9"),{
					p:'C',
					ch: '_#9'
				});

				assert.deepEqual(ChordUtils.string2Json("Db9"),{
					p:'Db',
					ch: '9'
				});	

				assert.deepEqual(ChordUtils.string2Json("D_b9"),{
					p:'D',
					ch: '_b9'
				});

				assert.deepEqual(ChordUtils.string2Json("Dnonexisting"),{
					error: true
				},'Dnonexisting');

				assert.deepEqual(ChordUtils.string2Json("k"),{
					error: true
				});

				assert.deepEqual(ChordUtils.string2Json(""),{
					empty: true
				});

				assert.deepEqual(ChordUtils.string2Json("NC"),{
					p:"NC",
					ch: ""
				});
				
				assert.deepEqual(ChordUtils.string2Json("Ab/F"),{
					p:"Ab",
					ch:"",
					bp:"F"
				});

				assert.deepEqual(ChordUtils.string2Json("Ab/Fm7"),{
					p:"Ab",
					ch:"",
					bp:"F",
					bch:"m7"
				});
			});

		}
	};
});