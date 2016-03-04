define(['modules/core/src/ChordModel'], function(ChordModel) {
	return {
		run: function() {
			test("Chords", function(assert) {
				var chord = new ChordModel();

				// Basic Test
				assert.equal(chord.toString(), "");
				assert.throws(function() {
					chord.setNote();
				});
				assert.equal(chord.getNote(), "");
				assert.equal(chord.getChordType(), "");
				assert.ok(!chord.getParenthesis());
				assert.deepEqual(chord.getBase(), {});

				// Adding base chord
				var chordBase = new ChordModel();
				chordBase.setNote('G');
				chordBase.setChordType('m');
				chord.setBase(chordBase);
				assert.equal(chord.getBase().getNote(), "G");
				assert.equal(chord.getBase().getChordType(), "m");
				// Remove base chord
				chord.setBase("");

				// Accidentals
				chord.setNote("Db");
				assert.equal(chord.getNote(), "Db");

				// ChordTypes
				chord.setChordType("M7");
				assert.equal(chord.getChordType(), "M7");

				// testing to String
				assert.equal(chord.toString(), "DbM7");
				assert.equal(chord.toString(" "), "Db M7");
				chord.setParenthesis(true);

				assert.equal(chord.toString(""), "(DbM7)");

				var chordMaj = new ChordModel({
					'note': 'A'
				});
				assert.equal(chordMaj.toString(""), "A", 'testing major chord to string');
				assert.equal(chordMaj.toString("", true), "A", 'testing major chord to string');
				assert.equal(chordMaj.toString("", false), "A", 'testing major chord to string');

				// setChordFromString
				chord.setChordFromString('A#m9/E');
				assert.equal(chord.getNote(), "A#");
				assert.equal(chord.getChordType(), "m9");
				assert.equal(chord.getBase().getNote(), "E");
				assert.equal(chord.getBase().getChordType(), "");


				assert.ok(new ChordModel({
					note: 'Ab',
					chordType: 'halfdim7',
					base: new ChordModel({
						note: 'F'
					}),
					beat: 1
				}).equalsTo({
					p: 'Ab',
					ch: 'halfdim7',
					bp: 'F'
				}), 'equalsTo, note, chortype and note base');

				assert.ok(new ChordModel({
					note: 'G',
					beat: 1
				}).equalsTo({
					p: 'G'
				}), 'equalsTo, only note');

				assert.notOk(new ChordModel({
					note: 'G',
					chordType: 'm7',
					beat: 1
				}).equalsTo({
					p: 'G'
				}), 'equalsTo, fails: chordType in model but not in json');

				assert.notOk(new ChordModel({
					note: 'G',
					beat: 1
				}).equalsTo({
					p: 'G',
					ch: 'm7'
				}), 'equalsTo, fails: chordType in json but not in model');

				assert.ok(new ChordModel({
					note: 'G',
					base: new ChordModel({
						note: 'F'
					}),
					beat: 1
				}).equalsTo({
					p: 'G',
					bp: 'F'
				}), 'equalsTo, only note and base note');

				assert.ok(new ChordModel({
					note: 'G',
					base: new ChordModel({
						note: 'F'
					}),
					beat: 1
				}).equalsTo({
					p: 'G',
					ch: '',
					bp: 'F'
				}), 'equalsTo, only note and base note, ch present but empty string');

				assert.ok(new ChordModel({
					note: 'G',
					chordType: 'm7',
					base: new ChordModel({
						note: 'F',
						chordType: '7'
					}),
					beat: 1
				}).equalsTo({
					p: 'G',
					ch: 'm7',
					bp: 'F',
					bch: '7'
				}), 'equalsTo, all fields');

				assert.notOk(new ChordModel({
					note: 'G',
					chordType: 'm7',
					beat: 1
				}).equalsTo({
					p: 'G',
					ch: 'm7',
					bp: 'F'
				}), 'equalsTo fails, orignal chord has not base, and json does');

				assert.notOk(new ChordModel({
					note: 'G',
					chordType: 'm7',
					base: new ChordModel({
						note: 'F',
						chordType: '7'
					}),
					beat: 1
				}).equalsTo({
					p: 'G',
					ch: 'm7',
					bp: 'F',
					bch: 'm7'
				}), 'equalsTo fails, all fields, but they are not all equal');

				var newChord = new ChordModel({
					note: 'G',
					chordType: 'm7',
					beat: 3
				});
				assert.equal(newChord.getNote(), "G");
				assert.ok(newChord.equalsTo({
					p: 'G',
					ch: 'm7'
				}));

				var clonedChord = newChord.clone();
				assert.deepEqual(clonedChord, newChord);

				//Chords with base
				var newChordWithBase = new ChordModel({
					note: 'G',
					base: 'Bb'
				});
				var baseOnly = new ChordModel({
					note: 'Bb'
				});
				assert.deepEqual(newChordWithBase.getBase(), baseOnly, 'Check base model is an object strictly equal to Get Base');

				var clonedChordWithBase = newChordWithBase.clone();
				assert.deepEqual(newChordWithBase, clonedChordWithBase, 'cloning chords with base');

			});
		}
	};
});