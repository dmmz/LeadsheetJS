define(['modules/converters/MusicCSLJson/src/BarModel_CSLJson', 'modules/core/src/BarModel'], function(BarModel_CSLJson, BarModel) {
	return {
		run: function() {
			test("BarModel_CSLJson", function(assert) {
				var bar = new BarModel();
				var t = BarModel_CSLJson.exportToMusicCSLJSON(bar);
				assert.deepEqual(t, {});

				var bar2 = new BarModel({
					begining: undefined,
					clef: 'treble',
					ending: 'BEGIN',
					style: 'Pop',
					timeSignatureChange: '3/4',
					keySignatureChange: 'F',
					label: 'coda',
					sublabel: 'Ds al fine'
				});

				t = BarModel_CSLJson.exportToMusicCSLJSON(bar2);
				
				var importBarObj = {
					clef: 'treble',
					ending: 'BEGIN',
					style: 'Pop',
					timeSignature: '3/4',
					keySignature: 'F',
					coda: 1,
					sublabel: 'Ds al fine'
				};
				assert.deepEqual(t, importBarObj);
				var newBar = BarModel_CSLJson.importFromMusicCSLJSON(importBarObj);
				assert.equal(newBar.getClef(), 'treble');
				assert.equal(newBar.getEnding(), 'BEGIN');
				assert.equal(newBar.getStyle(), 'Pop');
				assert.equal(newBar.getTimeSignatureChange(), '3/4');
				assert.equal(newBar.getKeySignatureChange(), 'F');
				assert.equal(newBar.getLabel(), 'coda');
				assert.equal(newBar.getSublabel(), 'Ds al fine');
			});
		}
	};
});