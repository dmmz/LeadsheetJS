define(function() {
	var simpleLeadSheet = {
		composer: "Random Composer",
		title: "Whatever song",
		time: "4/4",
		changes: [{
			id: 0,
			name: "A",
			bars: [{
				chords: [{
					p: "A",
					ch: "M7",
					beat: 1
				}],
				melody: [{
					keys: ["a/4"],
					duration: "q"
				}, {
					keys: ["g/4"],
					duration: "8"
				}, {
					keys: ["e/4"],
					duration: "8"
				}, {
					keys: ["f/4"],
					duration: "q"
				}, {
					keys: ["c/4"],
					duration: "q"
				}]
			}, {
				melody: [{
					keys: ["a/4"],
					duration: "q"
				}, {
					keys: ["f/4"],
					duration: "q"
				}, {
					keys: ["g/4"],
					duration: "q"
				}, {
					keys: ["e/4"],
					duration: "q"
				}]
			}, {
				chords: [{
					p: "B",
					ch: "7",
					beat: 1
				}],
				melody: [{
					keys: ["a/4"],
					duration: "q"
				}, {
					keys: ["f/4"],
					duration: "q"
				}, {
					keys: ["g/4"],
					duration: "q"
				}, {
					keys: ["e/4"],
					duration: "q"
				}]
			}, {
				melody: [{
					keys: ["a/4"],
					duration: "q"
				}, {
					keys: ["f/4"],
					duration: "q"
				}, {
					keys: ["g/4"],
					duration: "q"
				}, {
					keys: ["e/4"],
					duration: "q"
				}]
			}, {
				chords: [{
					p: "E",
					ch: "m",
					beat: 1
				}],
				melody: [{
					keys: ["a/4"],
					duration: "q"
				}, {
					keys: ["f/4"],
					duration: "q"
				}, {
					keys: ["g/4"],
					duration: "q"
				}, {
					keys: ["e/4"],
					duration: "q"
				}]
			}, {
				melody: [{
					keys: ["a/4"],
					duration: "q"
				}, {
					keys: ["f/4"],
					duration: "q"
				}, {
					keys: ["g/4"],
					duration: "q"
				}, {
					keys: ["e/4"],
					duration: "q"
				}]
			}, {
				chords: [{
					p: "F",
					ch: "7",
					beat: 1
				}],
				melody: [{
					keys: ["a/4"],
					duration: "q"
				}, {
					keys: ["f/4"],
					duration: "q"
				}, {
					keys: ["g/4"],
					duration: "q"
				}, {
					keys: ["e/4"],
					duration: "q"
				}]
			}, {
				melody: [{
					keys: ["a/4"],
					duration: "q"
				}, {
					keys: ["f/4"],
					duration: "q"
				}, {
					keys: ["g/4"],
					duration: "q"
				}, {
					keys: ["e/4"],
					duration: "q"
				}]
			}]
		}]
	};
	var leadSheetTimeSigChanges = {
		composer: "Random Composer",
		title: "Whatever song",
		time: "4/4",
		changes: [{
			id: 0,
			name: "A",
			bars: [{
				chords: [{
					p: "A",
					ch: "Maj7",
					beat: 1
				}, {
					p: "B",
					ch: "m7",
					beat: 3
				}],
				melody: [{
					keys: ["a/4"],
					duration: "q"
				}, {
					keys: ["f/4"],
					duration: "q"
				}, {
					keys: ["g/4"],
					duration: "q"
				}, {
					keys: ["e/4"],
					duration: "q"
				}],
			}, {
				melody: [{
					keys: ["a/4"],
					duration: "q"
				}, {
					keys: ["f/4"],
					duration: "8"
				}, {
					keys: ["f/4"],
					duration: "8"
				}, {
					keys: ["g/4"],
					duration: "q"
				}],
				timeSignature: "3/4",
				chords: [{
					p: "D",
					ch: "7",
					beat: 1
				}, {
					p: "E",
					ch: "m7",
					beat: 3
				}],
			}, {
				chords: [{
					p: "B",
					ch: "7",
					beat: 1
				}],
				melody: [{
					keys: ["a/4"],
					duration: "q",
					tuplet: "start",
					time_modification: "3/2"
				}, {
					keys: ["f/4"],
					duration: "q",
					time_modification: "3/2"
				}, {
					keys: ["g/4"],
					duration: "q",
					tuplet: "stop",
					time_modification: "3/2"
				}, {
					keys: ["g/4"],
					duration: "q"
				}]
			}, {
				chords: [{
					p: "C",
					ch: "7",
					beat: 1
				}],
				melody: [{
					keys: ["a/4"],
					duration: "q"
				}, {
					keys: ["f/4"],
					duration: "q"
				}],
				timeSignature: "2/4"
			}, {
				chords: [{
					p: "E",
					ch: "m",
					beat: 1
				}],
				melody: [{
					keys: ["a/4"],
					duration: "q"
				}, {
					keys: ["f/4"],
					duration: "q"
				}, {
					keys: ["g/4"],
					duration: "q"
				}, {
					keys: ["e/4"],
					duration: "q"
				}],
				timeSignature: "4/4"
			}, {
				chords: [{
					p: "G",
					ch: "m",
					beat: 1
				}],
				melody: [{
					keys: ["a/4"],
					duration: "q"
				}, {
					keys: ["f/4"],
					duration: "q"
				}, {
					keys: ["g/4"],
					duration: "q"
				}, {
					keys: ["e/4"],
					duration: "q"
				}]
			}, {
				chords: [{
					p: "F",
					ch: "7",
					beat: 1
				}],
				melody: [{
					keys: ["a/4"],
					duration: "q"
				}, {
					keys: ["f/4"],
					duration: "q"
				}, {
					keys: ["g/4"],
					duration: "q"
				}, {
					keys: ["e/4"],
					duration: "q"
				}]
			}, {
				chords: [{
					p: "A",
					ch: "m7",
					beat: 1
				}],
				melody: [{
					keys: ["a/4"],
					duration: "q"
				}, {
					keys: ["f/4"],
					duration: "q"
				}, {
					keys: ["g/4"],
					duration: "q"
				}, {
					keys: ["e/4"],
					duration: "q"
				}]
			}]
		}]
	};

	var afoxe = {
		"title": "Afoxe\u0301 e\u0301",
		"composer": "Gilberto Gil",
		"time": "4\/4",
		"style": "Bossa Nova",
		"source": "531df51458e338e256a1b91f",
		"melody_file": {
			"filename": "gilbertogilsongbooki\/a\/afoxe\u0301e\u0301_ggi.xml"
		},
		"pdf_source": {
			"filename": "gilbertogilsongbooki\/a\/afoxe\u0301e\u0301_ggi.pdf"
		},
		"comments": "_hsync",
		"changes": [{
			"id": "0",
			"name": "Intro",
			"numBars": "1",
			"repeat": "0",
			"endingNumBars": "0",
			"timeSignature": "",
			"style": "",
			"bars": [{
				"chords": [{
					"p": "NC",
					"beat": 1
				}, {
					"p": "E",
					"ch": "m",
					"bp": "G",
					"beat": 3
				}, {
					"p": "E",
					"bp": "G#",
					"beat": 4
				}],
				"melody": [{
					"keys": [
						"B\/4"
					],
					"duration": "wr"
				}]
			}]
		}, {
			"id": "1",
			"name": "A",
			"numBars": "4",
			"repeat": "0",
			"endingNumBars": "0",
			"timeSignature": "",
			"style": "",
			"bars": [{
				"chords": [{
					"p": "A",
					"ch": "m7",
					"beat": 1
				}, {
					"p": "G",
					"ch": "sus4add9",
					"beat": 3
				}, {
					"p": "G",
					"ch": "9",
					"beat": 4
				}],
				"melody": [{
					"keys": [
						"B\/4"
					],
					"duration": "8r"
				}, {
					"keys": [
						"G\/5"
					],
					"duration": "16"
				}, {
					"keys": [
						"E\/5"
					],
					"duration": "16",
					"tie": "start"
				}, {
					"keys": [
						"E\/5"
					],
					"duration": "16",
					"tie": "stop"
				}, {
					"keys": [
						"G\/5"
					],
					"duration": "16"
				}, {
					"keys": [
						"E\/5"
					],
					"duration": "8"
				}, {
					"keys": [
						"B\/4"
					],
					"duration": "hr"
				}]
			}, {
				"chords": [{
					"p": "A",
					"ch": "m7",
					"beat": 1
				}, {
					"p": "E",
					"ch": "m",
					"beat": 3
				}, {
					"p": "E",
					"ch": "m",
					"bp": "G",
					"beat": 4
				}],
				"melody": [{
					"keys": [
						"B\/4"
					],
					"duration": "wr"
				}]
			}, {
				"chords": [{
					"p": "A",
					"ch": "m",
					"beat": 1
				}, {
					"p": "G",
					"ch": "sus4add9",
					"beat": 3
				}, {
					"p": "G",
					"ch": "9",
					"beat": 4
				}],
				"melody": [{
					"keys": [
						"B\/4"
					],
					"duration": "8r"
				}, {
					"keys": [
						"G\/5"
					],
					"duration": "16"
				}, {
					"keys": [
						"E\/5"
					],
					"duration": "16",
					"tie": "start"
				}, {
					"keys": [
						"E\/5"
					],
					"duration": "16",
					"tie": "stop"
				}, {
					"keys": [
						"G\/5"
					],
					"duration": "16"
				}, {
					"keys": [
						"E\/5"
					],
					"duration": "8"
				}, {
					"keys": [
						"B\/4"
					],
					"duration": "hr"
				}]
			}, {
				"segno": "1",
				"chords": [{
					"p": "A",
					"ch": "m7",
					"beat": 1
				}, {
					"p": "G",
					"ch": "9",
					"beat": 3
				}],
				"melody": [{
					"keys": [
						"B\/4"
					],
					"duration": "hr"
				}, {
					"keys": [
						"B\/4"
					],
					"duration": "16r"
				}, {
					"keys": [
						"A\/5"
					],
					"duration": "8"
				}, {
					"keys": [
						"G\/5"
					],
					"duration": "16",
					"tie": "start"
				}, {
					"keys": [
						"G\/5"
					],
					"duration": "16",
					"tie": "stop"
				}, {
					"keys": [
						"E\/5"
					],
					"duration": "16"
				}, {
					"keys": [
						"D\/5"
					],
					"duration": "16"
				}, {
					"keys": [
						"C\/5"
					],
					"duration": "16"
				}]
			}]
		}, {
			"id": "2",
			"name": "B",
			"numBars": "4",
			"repeat": "0",
			"endingNumBars": "0",
			"timeSignature": "",
			"style": "",
			"bars": [{
				"chords": [{
					"p": "C",
					"beat": 1
				}, {
					"p": "G",
					"ch": "sus4add9",
					"beat": 3
				}, {
					"p": "G",
					"ch": "9",
					"beat": 4
				}],
				"melody": [{
					"keys": [
						"B\/4"
					],
					"duration": "hr"
				}, {
					"keys": [
						"B\/4"
					],
					"duration": "16r"
				}, {
					"keys": [
						"G\/4"
					],
					"duration": "8"
				}, {
					"keys": [
						"A\/4"
					],
					"duration": "16",
					"tie": "start"
				}, {
					"keys": [
						"A\/4"
					],
					"duration": "16",
					"tie": "stop"
				}, {
					"keys": [
						"C\/5"
					],
					"duration": "16"
				}, {
					"keys": [
						"A\/4"
					],
					"duration": "16"
				}, {
					"keys": [
						"C\/5"
					],
					"duration": "16"
				}]
			}, {
				"chords": [{
					"p": "C",
					"beat": 1
				}, {
					"p": "F",
					"bp": "A",
					"beat": 3
				}, {
					"p": "G",
					"ch": "9",
					"beat": 4
				}],
				"melody": [{
					"keys": [
						"B\/4"
					],
					"duration": "hr"
				}, {
					"keys": [
						"B\/4"
					],
					"duration": "16r"
				}, {
					"keys": [
						"A\/5"
					],
					"duration": "8"
				}, {
					"keys": [
						"G\/5"
					],
					"duration": "16",
					"tie": "start"
				}, {
					"keys": [
						"G\/5"
					],
					"duration": "16",
					"tie": "stop"
				}, {
					"keys": [
						"E\/5"
					],
					"duration": "16"
				}, {
					"keys": [
						"D\/5"
					],
					"duration": "16"
				}, {
					"keys": [
						"C\/5"
					],
					"duration": "16"
				}]
			}, {
				"chords": [{
					"p": "C",
					"beat": 1
				}, {
					"p": "G",
					"ch": "sus4add9",
					"beat": 3
				}, {
					"p": "G",
					"ch": "9",
					"beat": 4
				}],
				"melody": [{
					"keys": [
						"B\/4"
					],
					"duration": "hr"
				}, {
					"keys": [
						"B\/4"
					],
					"duration": "16r"
				}, {
					"keys": [
						"G\/4"
					],
					"duration": "8"
				}, {
					"keys": [
						"A\/4"
					],
					"duration": "16",
					"tie": "start"
				}, {
					"keys": [
						"A\/4"
					],
					"duration": "16",
					"tie": "stop"
				}, {
					"keys": [
						"C\/5"
					],
					"duration": "16"
				}, {
					"keys": [
						"A\/4"
					],
					"duration": "16"
				}, {
					"keys": [
						"C\/5"
					],
					"duration": "16"
				}]
			}, {
				"chords": [{
					"p": "C",
					"beat": 1
				}, {
					"p": "Gb",
					"ch": "7#11",
					"beat": 3
				}],
				"melody": [{
					"keys": [
						"B\/4"
					],
					"duration": "wr"
				}]
			}]
		}, {
			"id": "3",
			"name": "C",
			"numBars": "10",
			"repeat": "0",
			"endingNumBars": "0",
			"timeSignature": "",
			"style": "",
			"bars": [{
				"chords": [{
					"p": "F",
					"ch": "M7",
					"beat": 1
				}],
				"melody": [{
					"keys": [
						"C\/4"
					],
					"duration": "16"
				}, {
					"keys": [
						"C\/4"
					],
					"duration": "16"
				}, {
					"keys": [
						"F\/4"
					],
					"duration": "16"
				}, {
					"keys": [
						"A\/4"
					],
					"duration": "16",
					"tie": "start"
				}, {
					"keys": [
						"A\/4"
					],
					"duration": "8",
					"tie": "stop"
				}, {
					"keys": [
						"C\/5"
					],
					"duration": "8",
					"tie": "start"
				}, {
					"keys": [
						"C\/5"
					],
					"duration": "8",
					"tie": "stop"
				}, {
					"keys": [
						"A\/4"
					],
					"duration": "8"
				}, {
					"keys": [
						"G\/4"
					],
					"duration": "8"
				}, {
					"keys": [
						"F\/4"
					],
					"duration": "8"
				}]
			}, {
				"chords": [{
					"p": "G",
					"ch": "13",
					"beat": 1
				}, {
					"p": "A",
					"beat": 3
				}, {
					"p": "G",
					"beat": 4
				}],
				"melody": [{
					"keys": [
						"B\/3"
					],
					"duration": "16"
				}, {
					"keys": [
						"D\/4"
					],
					"duration": "16"
				}, {
					"keys": [
						"G\/4"
					],
					"duration": "16"
				}, {
					"keys": [
						"B\/4"
					],
					"duration": "16",
					"tie": "start"
				}, {
					"keys": [
						"B\/4"
					],
					"duration": "8",
					"tie": "stop"
				}, {
					"keys": [
						"C#\/4"
					],
					"duration": "16"
				}, {
					"keys": [
						"E\/4"
					],
					"duration": "16"
				}, {
					"keys": [
						"A\/4"
					],
					"duration": "16"
				}, {
					"keys": [
						"C#\/5"
					],
					"duration": "8",
					"dot": 1
				}, {
					"keys": [
						"D\/5"
					],
					"duration": "q"
				}]
			}, {
				"chords": [{
					"p": "F",
					"beat": 1
				}, {
					"p": "F",
					"ch": "M7(6)",
					"beat": 3
				}],
				"melody": [{
					"keys": [
						"D\/5"
					],
					"duration": "16"
				}, {
					"keys": [
						"E\/5"
					],
					"duration": "16"
				}, {
					"keys": [
						"F\/5"
					],
					"duration": "16"
				}, {
					"keys": [
						"E\/5"
					],
					"duration": "16",
					"tie": "start"
				}, {
					"keys": [
						"E\/5"
					],
					"duration": "8",
					"tie": "stop"
				}, {
					"keys": [
						"D\/5"
					],
					"duration": "8",
					"tie": "start"
				}, {
					"keys": [
						"D\/5"
					],
					"duration": "8",
					"tie": "stop"
				}, {
					"keys": [
						"C\/5"
					],
					"duration": "8"
				}, {
					"keys": [
						"B\/4"
					],
					"duration": "8"
				}, {
					"keys": [
						"B\/4"
					],
					"duration": "8"
				}]
			}, {
				"chords": [{
					"p": "B",
					"ch": "halfdim7",
					"beat": 1
				}, {
					"p": "E",
					"ch": "13b9",
					"beat": 3
				}],
				"melody": [{
					"keys": [
						"B\/4"
					],
					"duration": "16"
				}, {
					"keys": [
						"C\/5"
					],
					"duration": "16"
				}, {
					"keys": [
						"D\/5"
					],
					"duration": "16"
				}, {
					"keys": [
						"C\/5"
					],
					"duration": "16",
					"tie": "start"
				}, {
					"keys": [
						"C\/5"
					],
					"duration": "8",
					"tie": "stop"
				}, {
					"keys": [
						"B\/4"
					],
					"duration": "8",
					"tie": "start"
				}, {
					"keys": [
						"B\/4"
					],
					"duration": "8",
					"tie": "stop"
				}, {
					"keys": [
						"A\/4"
					],
					"duration": "8"
				}, {
					"keys": [
						"G#\/4"
					],
					"duration": "q"
				}]
			}, {
				"chords": [{
					"p": "F",
					"ch": "M7",
					"beat": 1
				}],
				"melody": [{
					"keys": [
						"C\/4"
					],
					"duration": "16"
				}, {
					"keys": [
						"C\/4"
					],
					"duration": "16"
				}, {
					"keys": [
						"F\/4"
					],
					"duration": "16"
				}, {
					"keys": [
						"A\/4"
					],
					"duration": "16",
					"tie": "start"
				}, {
					"keys": [
						"A\/4"
					],
					"duration": "8",
					"tie": "stop"
				}, {
					"keys": [
						"C\/5"
					],
					"duration": "8",
					"tie": "start"
				}, {
					"keys": [
						"C\/5"
					],
					"duration": "8",
					"tie": "stop"
				}, {
					"keys": [
						"A\/4"
					],
					"duration": "8"
				}, {
					"keys": [
						"G\/4"
					],
					"duration": "8"
				}, {
					"keys": [
						"F\/4"
					],
					"duration": "8"
				}]
			}, {
				"chords": [{
					"p": "G",
					"ch": "13",
					"beat": 1
				}, {
					"p": "A",
					"beat": 3
				}, {
					"p": "G",
					"beat": 4
				}],
				"melody": [{
					"keys": [
						"B\/3"
					],
					"duration": "16"
				}, {
					"keys": [
						"D\/4"
					],
					"duration": "16"
				}, {
					"keys": [
						"G\/4"
					],
					"duration": "16"
				}, {
					"keys": [
						"B\/4"
					],
					"duration": "16",
					"tie": "start"
				}, {
					"keys": [
						"B\/4"
					],
					"duration": "8",
					"tie": "stop"
				}, {
					"keys": [
						"C#\/4"
					],
					"duration": "16"
				}, {
					"keys": [
						"E\/4"
					],
					"duration": "16"
				}, {
					"keys": [
						"A\/4"
					],
					"duration": "16"
				}, {
					"keys": [
						"C#\/5"
					],
					"duration": "8",
					"dot": 1
				}, {
					"keys": [
						"D\/5"
					],
					"duration": "q"
				}]
			}, {
				"chords": [{
					"p": "F",
					"beat": 1
				}, {
					"p": "F",
					"ch": "M7(6)",
					"beat": 3
				}],
				"melody": [{
					"keys": [
						"D\/5"
					],
					"duration": "16"
				}, {
					"keys": [
						"E\/5"
					],
					"duration": "16"
				}, {
					"keys": [
						"F\/5"
					],
					"duration": "16"
				}, {
					"keys": [
						"E\/5"
					],
					"duration": "16",
					"tie": "start"
				}, {
					"keys": [
						"E\/5"
					],
					"duration": "8",
					"tie": "stop"
				}, {
					"keys": [
						"D\/5"
					],
					"duration": "8",
					"tie": "start"
				}, {
					"keys": [
						"D\/5"
					],
					"duration": "8",
					"tie": "stop"
				}, {
					"keys": [
						"C\/5"
					],
					"duration": "8"
				}, {
					"keys": [
						"B\/4"
					],
					"duration": "8"
				}, {
					"keys": [
						"B\/4"
					],
					"duration": "8"
				}]
			}, {
				"chords": [{
					"p": "B",
					"ch": "halfdim7",
					"beat": 1
				}, {
					"p": "E",
					"ch": "sus4",
					"beat": 3
				}, {
					"p": "E",
					"ch": "7",
					"beat": 4
				}],
				"melody": [{
					"keys": [
						"B\/4"
					],
					"duration": "16"
				}, {
					"keys": [
						"C\/5"
					],
					"duration": "16"
				}, {
					"keys": [
						"D\/5"
					],
					"duration": "16"
				}, {
					"keys": [
						"C\/5"
					],
					"duration": "16",
					"tie": "start"
				}, {
					"keys": [
						"C\/5"
					],
					"duration": "8",
					"tie": "stop"
				}, {
					"keys": [
						"B\/4"
					],
					"duration": "8"
				}, {
					"keys": [
						"A\/4"
					],
					"duration": "q"
				}, {
					"keys": [
						"G#\/4"
					],
					"duration": "q"
				}]
			}, {
				"chords": [{
					"p": "A",
					"ch": "m7",
					"beat": 1
				}],
				"melody": [{
					"keys": [
						"A\/4"
					],
					"duration": "w"
				}]
			}, {
				"chords": [{
					"p": "A",
					"ch": "m7",
					"beat": 1
				}, {
					"p": "G",
					"beat": 3
				}],
				"melody": [{
					"keys": [
						"B\/4"
					],
					"duration": "wr"
				}]
			}]
		}, {
			"id": "4",
			"name": "D",
			"numBars": "8",
			"repeat": "0",
			"endingNumBars": "0",
			"timeSignature": "",
			"style": "",
			"bars": [{
				"chords": [{
					"p": "F",
					"beat": 1
				}, {
					"p": "G",
					"ch": "sus4add9",
					"beat": 3
				}, {
					"p": "G",
					"ch": "9",
					"beat": 4
				}],
				"melody": [{
					"keys": [
						"A\/4"
					],
					"duration": "16"
				}, {
					"keys": [
						"A\/4"
					],
					"duration": "16"
				}, {
					"keys": [
						"A\/4"
					],
					"duration": "16"
				}, {
					"keys": [
						"A\/4"
					],
					"duration": "16",
					"tie": "start"
				}, {
					"keys": [
						"A\/4"
					],
					"duration": "8",
					"tie": "stop"
				}, {
					"keys": [
						"C\/5"
					],
					"duration": "8",
					"tie": "start"
				}, {
					"keys": [
						"C\/5"
					],
					"duration": "8",
					"tie": "stop"
				}, {
					"keys": [
						"A\/4"
					],
					"duration": "8"
				}, {
					"keys": [
						"G\/4"
					],
					"duration": "8"
				}, {
					"keys": [
						"F\/4"
					],
					"duration": "8"
				}]
			}, {
				"chords": [{
					"p": "C",
					"ch": "9",
					"beat": 1
				}],
				"melody": [{
					"keys": [
						"E\/4"
					],
					"duration": "16"
				}, {
					"keys": [
						"E\/4"
					],
					"duration": "16"
				}, {
					"keys": [
						"E\/4"
					],
					"duration": "16"
				}, {
					"keys": [
						"E\/4"
					],
					"duration": "16",
					"tie": "start"
				}, {
					"keys": [
						"E\/4"
					],
					"duration": "16",
					"tie": "stop"
				}, {
					"keys": [
						"C\/4"
					],
					"duration": "16"
				}, {
					"keys": [
						"G\/4"
					],
					"duration": "8",
					"tie": "start"
				}, {
					"keys": [
						"G\/4"
					],
					"duration": "8",
					"tie": "stop"
				}, {
					"keys": [
						"E\/4"
					],
					"duration": "8"
				}, {
					"keys": [
						"D\/4"
					],
					"duration": "8"
				}, {
					"keys": [
						"C\/4"
					],
					"duration": "8"
				}]
			}, {
				"chords": [{
					"p": "F",
					"ch": "M7",
					"beat": 1
				}, {
					"p": "Bb",
					"ch": "9",
					"beat": 3
				}],
				"melody": [{
					"keys": [
						"A\/4"
					],
					"duration": "16"
				}, {
					"keys": [
						"A\/4"
					],
					"duration": "16"
				}, {
					"keys": [
						"A\/4"
					],
					"duration": "16"
				}, {
					"keys": [
						"A\/4"
					],
					"duration": "16",
					"tie": "start"
				}, {
					"keys": [
						"A\/4"
					],
					"duration": "8",
					"tie": "stop"
				}, {
					"keys": [
						"C\/5"
					],
					"duration": "8",
					"tie": "start"
				}, {
					"keys": [
						"C\/5"
					],
					"duration": "8",
					"tie": "stop"
				}, {
					"keys": [
						"Ab\/4"
					],
					"duration": "8"
				}, {
					"keys": [
						"G\/4"
					],
					"duration": "8"
				}, {
					"keys": [
						"F\/4"
					],
					"duration": "8"
				}]
			}, {
				"chords": [{
					"p": "Eb",
					"ch": "M7",
					"beat": 1
				}, {
					"p": "C",
					"ch": "sus4",
					"beat": 3
				}, {
					"p": "C",
					"ch": "7",
					"beat": 4
				}],
				"melody": [{
					"keys": [
						"G\/4"
					],
					"duration": "h"
				}, {
					"keys": [
						"B\/4"
					],
					"duration": "hr"
				}]
			}, {
				"chords": [{
					"p": "F",
					"ch": "m7",
					"beat": 1
				}, {
					"p": "Bb",
					"ch": "9",
					"beat": 3
				}],
				"melody": [{
					"keys": [
						"Ab\/4"
					],
					"duration": "16"
				}, {
					"keys": [
						"A\/4"
					],
					"duration": "16"
				}, {
					"keys": [
						"A\/4"
					],
					"duration": "16"
				}, {
					"keys": [
						"A\/4"
					],
					"duration": "16",
					"tie": "start"
				}, {
					"keys": [
						"A\/4"
					],
					"duration": "8",
					"tie": "stop"
				}, {
					"keys": [
						"C\/5"
					],
					"duration": "8",
					"tie": "start"
				}, {
					"keys": [
						"C\/5"
					],
					"duration": "8",
					"tie": "stop"
				}, {
					"keys": [
						"A\/4"
					],
					"duration": "8"
				}, {
					"keys": [
						"G\/4"
					],
					"duration": "8"
				}, {
					"keys": [
						"F\/4"
					],
					"duration": "8"
				}]
			}, {
				"chords": [{
					"p": "Eb",
					"ch": "M7",
					"beat": 1
				}, {
					"p": "Ab",
					"ch": "M7",
					"beat": 3
				}],
				"melody": [{
					"keys": [
						"G\/4"
					],
					"duration": "16"
				}, {
					"keys": [
						"G\/4"
					],
					"duration": "16"
				}, {
					"keys": [
						"G\/4"
					],
					"duration": "16"
				}, {
					"keys": [
						"G\/4"
					],
					"duration": "16",
					"tie": "start"
				}, {
					"keys": [
						"G\/4"
					],
					"duration": "8",
					"tie": "stop"
				}, {
					"keys": [
						"Bb\/4"
					],
					"duration": "8",
					"tie": "start"
				}, {
					"keys": [
						"B\/4"
					],
					"duration": "8",
					"tie": "stop"
				}, {
					"keys": [
						"G\/4"
					],
					"duration": "8"
				}, {
					"keys": [
						"F\/4"
					],
					"duration": "8"
				}, {
					"keys": [
						"Eb\/4"
					],
					"duration": "8"
				}]
			}, {
				"chords": [{
					"p": "D",
					"ch": "m7",
					"beat": 1
				}, {
					"p": "G",
					"ch": "sus4add9",
					"beat": 3
				}, {
					"p": "G",
					"ch": "9",
					"beat": 4
				}],
				"melody": [{
					"keys": [
						"A\/4"
					],
					"duration": "16"
				}, {
					"keys": [
						"A\/4"
					],
					"duration": "8"
				}, {
					"keys": [
						"A\/4"
					],
					"duration": "16"
				}, {
					"keys": [
						"A\/4"
					],
					"duration": "8"
				}, {
					"keys": [
						"E\/5"
					],
					"duration": "8",
					"tie": "start"
				}, {
					"keys": [
						"E\/5"
					],
					"duration": "8",
					"tie": "stop"
				}, {
					"keys": [
						"C\/5"
					],
					"duration": "8"
				}, {
					"keys": [
						"B\/4"
					],
					"duration": "8"
				}, {
					"keys": [
						"A\/4"
					],
					"duration": "8"
				}]
			}, {
				"chords": [{
					"p": "C",
					"ch": "sus4add9",
					"beat": 1
				}, {
					"p": "C",
					"ch": "13",
					"beat": 3
				}],
				"melody": [{
					"keys": [
						"G\/4"
					],
					"duration": "w"
				}]
			}]
		}, {
			"id": "5",
			"name": "E",
			"numBars": "9",
			"repeat": "0",
			"endingNumBars": "0",
			"timeSignature": "",
			"style": "",
			"bars": [{
				"chords": [{
					"p": "F",
					"ch": "M7",
					"beat": 1
				}],
				"melody": [{
					"keys": [
						"C\/4"
					],
					"duration": "16"
				}, {
					"keys": [
						"C\/4"
					],
					"duration": "16"
				}, {
					"keys": [
						"F\/4"
					],
					"duration": "16"
				}, {
					"keys": [
						"A\/4"
					],
					"duration": "16",
					"tie": "start"
				}, {
					"keys": [
						"A\/4"
					],
					"duration": "8",
					"tie": "stop"
				}, {
					"keys": [
						"C\/5"
					],
					"duration": "8",
					"tie": "start"
				}, {
					"keys": [
						"C\/5"
					],
					"duration": "8",
					"tie": "stop"
				}, {
					"keys": [
						"A\/4"
					],
					"duration": "8"
				}, {
					"keys": [
						"G\/4"
					],
					"duration": "8"
				}, {
					"keys": [
						"F\/4"
					],
					"duration": "8"
				}]
			}, {
				"chords": [{
					"p": "G",
					"ch": "13",
					"beat": 1
				}, {
					"p": "A",
					"beat": 3
				}, {
					"p": "G",
					"beat": 4
				}],
				"melody": [{
					"keys": [
						"B\/3"
					],
					"duration": "16"
				}, {
					"keys": [
						"D\/4"
					],
					"duration": "16"
				}, {
					"keys": [
						"G\/4"
					],
					"duration": "16"
				}, {
					"keys": [
						"B\/4"
					],
					"duration": "16",
					"tie": "start"
				}, {
					"keys": [
						"B\/4"
					],
					"duration": "8",
					"tie": "stop"
				}, {
					"keys": [
						"C#\/4"
					],
					"duration": "16"
				}, {
					"keys": [
						"E\/4"
					],
					"duration": "16"
				}, {
					"keys": [
						"A\/4"
					],
					"duration": "16"
				}, {
					"keys": [
						"C#\/5"
					],
					"duration": "8",
					"dot": 1
				}, {
					"keys": [
						"D\/5"
					],
					"duration": "q"
				}]
			}, {
				"chords": [{
					"p": "F",
					"beat": 1
				}, {
					"p": "F",
					"ch": "M7(6)",
					"beat": 3
				}],
				"melody": [{
					"keys": [
						"D\/5"
					],
					"duration": "16"
				}, {
					"keys": [
						"E\/5"
					],
					"duration": "16"
				}, {
					"keys": [
						"F\/5"
					],
					"duration": "16"
				}, {
					"keys": [
						"E\/5"
					],
					"duration": "16",
					"tie": "start"
				}, {
					"keys": [
						"E\/5"
					],
					"duration": "8",
					"tie": "stop"
				}, {
					"keys": [
						"D\/5"
					],
					"duration": "8",
					"tie": "start"
				}, {
					"keys": [
						"D\/5"
					],
					"duration": "8",
					"tie": "stop"
				}, {
					"keys": [
						"C\/5"
					],
					"duration": "8"
				}, {
					"keys": [
						"B\/4"
					],
					"duration": "8"
				}, {
					"keys": [
						"B\/4"
					],
					"duration": "8"
				}]
			}, {
				"chords": [{
					"p": "B",
					"ch": "halfdim7",
					"beat": 1
				}, {
					"p": "E",
					"ch": "13b9",
					"beat": 3
				}],
				"melody": [{
					"keys": [
						"B\/4"
					],
					"duration": "16"
				}, {
					"keys": [
						"C\/5"
					],
					"duration": "16"
				}, {
					"keys": [
						"D\/5"
					],
					"duration": "16"
				}, {
					"keys": [
						"C\/5"
					],
					"duration": "16",
					"tie": "start"
				}, {
					"keys": [
						"C\/5"
					],
					"duration": "8",
					"tie": "stop"
				}, {
					"keys": [
						"B\/4"
					],
					"duration": "8",
					"tie": "start"
				}, {
					"keys": [
						"B\/4"
					],
					"duration": "8",
					"tie": "stop"
				}, {
					"keys": [
						"A\/4"
					],
					"duration": "8"
				}, {
					"keys": [
						"G#\/4"
					],
					"duration": "q"
				}]
			}, {
				"chords": [{
					"p": "F",
					"ch": "M7",
					"beat": 1
				}],
				"melody": [{
					"keys": [
						"C\/4"
					],
					"duration": "16"
				}, {
					"keys": [
						"C\/4"
					],
					"duration": "16"
				}, {
					"keys": [
						"F\/4"
					],
					"duration": "16"
				}, {
					"keys": [
						"A\/4"
					],
					"duration": "16",
					"tie": "start"
				}, {
					"keys": [
						"A\/4"
					],
					"duration": "8",
					"tie": "stop"
				}, {
					"keys": [
						"C\/5"
					],
					"duration": "8",
					"tie": "start"
				}, {
					"keys": [
						"C\/5"
					],
					"duration": "8",
					"tie": "stop"
				}, {
					"keys": [
						"A\/4"
					],
					"duration": "8"
				}, {
					"keys": [
						"G\/4"
					],
					"duration": "8"
				}, {
					"keys": [
						"F\/4"
					],
					"duration": "8"
				}]
			}, {
				"chords": [{
					"p": "G",
					"ch": "13",
					"beat": 1
				}, {
					"p": "A",
					"beat": 3
				}, {
					"p": "G",
					"beat": 4
				}],
				"melody": [{
					"keys": [
						"B\/3"
					],
					"duration": "16"
				}, {
					"keys": [
						"D\/4"
					],
					"duration": "16"
				}, {
					"keys": [
						"G\/4"
					],
					"duration": "16"
				}, {
					"keys": [
						"B\/4"
					],
					"duration": "16",
					"tie": "start"
				}, {
					"keys": [
						"B\/4"
					],
					"duration": "8",
					"tie": "stop"
				}, {
					"keys": [
						"C#\/4"
					],
					"duration": "16"
				}, {
					"keys": [
						"E\/4"
					],
					"duration": "16"
				}, {
					"keys": [
						"A\/4"
					],
					"duration": "16"
				}, {
					"keys": [
						"C#\/5"
					],
					"duration": "8",
					"dot": 1
				}, {
					"keys": [
						"D\/5"
					],
					"duration": "q"
				}]
			}, {
				"chords": [{
					"p": "F",
					"beat": 1
				}, {
					"p": "F",
					"ch": "M7(6)",
					"beat": 3
				}],
				"melody": [{
					"keys": [
						"D\/5"
					],
					"duration": "16"
				}, {
					"keys": [
						"E\/5"
					],
					"duration": "16"
				}, {
					"keys": [
						"F\/5"
					],
					"duration": "16"
				}, {
					"keys": [
						"E\/5"
					],
					"duration": "16",
					"tie": "start"
				}, {
					"keys": [
						"E\/5"
					],
					"duration": "8",
					"tie": "stop"
				}, {
					"keys": [
						"D\/5"
					],
					"duration": "8",
					"tie": "start"
				}, {
					"keys": [
						"D\/5"
					],
					"duration": "8",
					"tie": "stop"
				}, {
					"keys": [
						"C\/5"
					],
					"duration": "8"
				}, {
					"keys": [
						"B\/4"
					],
					"duration": "8"
				}, {
					"keys": [
						"B\/4"
					],
					"duration": "8"
				}]
			}, {
				"chords": [{
					"p": "B",
					"ch": "halfdim7",
					"beat": 1
				}, {
					"p": "E",
					"ch": "sus4",
					"beat": 3
				}, {
					"p": "E",
					"ch": "7",
					"beat": 4
				}],
				"melody": [{
					"keys": [
						"B\/4"
					],
					"duration": "16"
				}, {
					"keys": [
						"C\/5"
					],
					"duration": "16"
				}, {
					"keys": [
						"D\/5"
					],
					"duration": "16"
				}, {
					"keys": [
						"C\/5"
					],
					"duration": "16",
					"tie": "start"
				}, {
					"keys": [
						"C\/5"
					],
					"duration": "8",
					"tie": "stop"
				}, {
					"keys": [
						"B\/4"
					],
					"duration": "8"
				}, {
					"keys": [
						"E\/5"
					],
					"duration": "q"
				}, {
					"keys": [
						"E\/5"
					],
					"duration": "q"
				}]
			}, {
				"chords": [{
					"p": "F",
					"ch": "M7",
					"beat": 1
				}, {
					"p": "G",
					"ch": "sus4add9",
					"beat": 3
				}],
				"melody": [{
					"keys": [
						"D\/5"
					],
					"duration": "8"
				}, {
					"keys": [
						"C\/5"
					],
					"duration": "16"
				}, {
					"keys": [
						"A\/4"
					],
					"duration": "16",
					"tie": "start"
				}, {
					"keys": [
						"A\/4"
					],
					"duration": "q",
					"tie": "stop"
				}, {
					"keys": [
						"B\/4"
					],
					"duration": "8r"
				}, {
					"keys": [
						"G\/5"
					],
					"duration": "16"
				}, {
					"keys": [
						"E\/5"
					],
					"duration": "16",
					"tie": "start"
				}, {
					"keys": [
						"E\/5"
					],
					"duration": "16",
					"tie": "stop"
				}, {
					"keys": [
						"G\/5"
					],
					"duration": "16"
				}, {
					"keys": [
						"E\/5"
					],
					"duration": "8"
				}]
			}]
		}, {
			"id": "6",
			"name": "Instrumental",
			"numBars": "4",
			"repeat": "0",
			"endingNumBars": "0",
			"timeSignature": "",
			"style": "",
			"bars": [{
				"chords": [{
					"p": "A",
					"ch": "m7",
					"beat": 1
				}, {
					"p": "G",
					"ch": "sus4add9",
					"beat": 3
				}, {
					"p": "G",
					"ch": "9",
					"beat": 4
				}],
				"melody": [{
					"keys": [
						"B\/4"
					],
					"duration": "wr"
				}]
			}, {
				"chords": [{
					"p": "A",
					"ch": "m7",
					"beat": 1
				}, {
					"p": "E",
					"ch": "m",
					"beat": 3
				}, {
					"p": "E",
					"ch": "m",
					"bp": "G",
					"beat": 4
				}],
				"melody": [{
					"keys": [
						"B\/4"
					],
					"duration": "hr"
				}, {
					"keys": [
						"B\/4"
					],
					"duration": "16r"
				}, {
					"keys": [
						"A\/5"
					],
					"duration": "8"
				}, {
					"keys": [
						"G\/5"
					],
					"duration": "16",
					"tie": "start"
				}, {
					"keys": [
						"G\/5"
					],
					"duration": "16",
					"tie": "stop"
				}, {
					"keys": [
						"E\/5"
					],
					"duration": "16"
				}, {
					"keys": [
						"D\/5"
					],
					"duration": "16"
				}, {
					"keys": [
						"C\/5"
					],
					"duration": "16"
				}]
			}, {
				"chords": [{
					"p": "A",
					"ch": "m7",
					"beat": 1
				}, {
					"p": "G",
					"ch": "sus4add9",
					"beat": 3
				}, {
					"p": "G",
					"ch": "9",
					"beat": 4
				}],
				"melody": [{
					"keys": [
						"B\/4"
					],
					"duration": "wr"
				}]
			}, {
				"sublabel": "DS",
				"chords": [{
					"p": "A",
					"ch": "m7",
					"beat": 1
				}, {
					"p": "G",
					"ch": "9",
					"beat": 3
				}],
				"melody": [{
					"keys": [
						"B\/4"
					],
					"duration": "hr"
				}, {
					"keys": [
						"B\/4"
					],
					"duration": "16r"
				}, {
					"keys": [
						"A\/5"
					],
					"duration": "8"
				}, {
					"keys": [
						"G\/5"
					],
					"duration": "16",
					"tie": "start"
				}, {
					"keys": [
						"G\/5"
					],
					"duration": "16",
					"tie": "stop"
				}, {
					"keys": [
						"E\/5"
					],
					"duration": "16"
				}, {
					"keys": [
						"D\/5"
					],
					"duration": "16"
				}, {
					"keys": [
						"C\/5"
					],
					"duration": "16"
				}]
			}]
		}, {
			"id": "7",
			"name": "Outro Fade out",
			"numBars": "8",
			"repeat": "1",
			"endingNumBars": "0",
			"timeSignature": "",
			"style": "",
			"bars": [{
				"chords": [{
					"p": "C",
					"beat": 1
				}, {
					"p": "G",
					"ch": "sus4add9",
					"beat": 3
				}, {
					"p": "G",
					"ch": "9",
					"beat": 4
				}],
				"melody": [{
					"keys": [
						"B\/4"
					],
					"duration": "hr"
				}, {
					"keys": [
						"B\/4"
					],
					"duration": "16r"
				}, {
					"keys": [
						"G\/4"
					],
					"duration": "8"
				}, {
					"keys": [
						"A\/4"
					],
					"duration": "16",
					"tie": "start"
				}, {
					"keys": [
						"A\/4"
					],
					"duration": "16",
					"tie": "stop"
				}, {
					"keys": [
						"C\/5"
					],
					"duration": "16"
				}, {
					"keys": [
						"A\/4"
					],
					"duration": "16"
				}, {
					"keys": [
						"C\/5"
					],
					"duration": "16"
				}]
			}, {
				"chords": [{
					"p": "C",
					"beat": 1
				}, {
					"p": "F",
					"bp": "A",
					"beat": 3
				}, {
					"p": "G",
					"ch": "9",
					"beat": 4
				}],
				"melody": [{
					"keys": [
						"B\/4"
					],
					"duration": "hr"
				}, {
					"keys": [
						"B\/4"
					],
					"duration": "16r"
				}, {
					"keys": [
						"A\/5"
					],
					"duration": "8"
				}, {
					"keys": [
						"G\/5"
					],
					"duration": "16",
					"tie": "start"
				}, {
					"keys": [
						"G\/5"
					],
					"duration": "16",
					"tie": "stop"
				}, {
					"keys": [
						"E\/5"
					],
					"duration": "16"
				}, {
					"keys": [
						"D\/5"
					],
					"duration": "16"
				}, {
					"keys": [
						"C\/5"
					],
					"duration": "16"
				}]
			}, {
				"chords": [{
					"p": "C",
					"beat": 1
				}, {
					"p": "G",
					"ch": "sus4add9",
					"beat": 3
				}, {
					"p": "G",
					"ch": "9",
					"beat": 4
				}],
				"melody": [{
					"keys": [
						"B\/4"
					],
					"duration": "hr"
				}, {
					"keys": [
						"B\/4"
					],
					"duration": "16r"
				}, {
					"keys": [
						"G\/4"
					],
					"duration": "8"
				}, {
					"keys": [
						"A\/4"
					],
					"duration": "16",
					"tie": "start"
				}, {
					"keys": [
						"A\/4"
					],
					"duration": "16",
					"tie": "stop"
				}, {
					"keys": [
						"C\/5"
					],
					"duration": "16"
				}, {
					"keys": [
						"A\/4"
					],
					"duration": "16"
				}, {
					"keys": [
						"C\/5"
					],
					"duration": "16"
				}]
			}, {
				"chords": [{
					"p": "C",
					"beat": 1
				}, {
					"p": "E",
					"ch": "m",
					"bp": "G",
					"beat": 3
				}, {
					"p": "E",
					"bp": "G#",
					"beat": 4
				}],
				"melody": [{
					"keys": [
						"B\/4"
					],
					"duration": "hr"
				}, {
					"keys": [
						"B\/4"
					],
					"duration": "8r"
				}, {
					"keys": [
						"G\/5"
					],
					"duration": "16"
				}, {
					"keys": [
						"E\/5"
					],
					"duration": "16",
					"tie": "start"
				}, {
					"keys": [
						"E\/5"
					],
					"duration": "16",
					"tie": "stop"
				}, {
					"keys": [
						"G\/5"
					],
					"duration": "16"
				}, {
					"keys": [
						"E\/5"
					],
					"duration": "8"
				}]
			}, {
				"chords": [{
					"p": "A",
					"ch": "m7",
					"beat": 1
				}, {
					"p": "G",
					"ch": "sus4add9",
					"beat": 3
				}, {
					"p": "G",
					"ch": "9",
					"beat": 4
				}],
				"melody": [{
					"keys": [
						"B\/4"
					],
					"duration": "wr"
				}]
			}, {
				"chords": [{
					"p": "A",
					"ch": "m7",
					"beat": 1
				}, {
					"p": "E",
					"ch": "m",
					"beat": 3
				}, {
					"p": "E",
					"ch": "m",
					"bp": "G",
					"beat": 4
				}],
				"melody": [{
					"keys": [
						"B\/4"
					],
					"duration": "hr"
				}, {
					"keys": [
						"B\/4"
					],
					"duration": "8r"
				}, {
					"keys": [
						"G\/5"
					],
					"duration": "16"
				}, {
					"keys": [
						"E\/5"
					],
					"duration": "16",
					"tie": "start"
				}, {
					"keys": [
						"E\/5"
					],
					"duration": "16",
					"tie": "stop"
				}, {
					"keys": [
						"G\/5"
					],
					"duration": "16"
				}, {
					"keys": [
						"E\/5"
					],
					"duration": "8"
				}]
			}, {
				"chords": [{
					"p": "A",
					"ch": "m7",
					"beat": 1
				}, {
					"p": "G",
					"ch": "sus4add9",
					"beat": 3
				}, {
					"p": "G",
					"ch": "9",
					"beat": 4
				}],
				"melody": [{
					"keys": [
						"B\/4"
					],
					"duration": "wr"
				}]
			}, {
				"chords": [{
					"p": "A",
					"ch": "m7",
					"beat": 1
				}, {
					"p": "G",
					"ch": "9",
					"beat": 3
				}],
				"melody": [{
					"keys": [
						"B\/4"
					],
					"duration": "hr"
				}, {
					"keys": [
						"B\/4"
					],
					"duration": "16r"
				}, {
					"keys": [
						"A\/5"
					],
					"duration": "8"
				}, {
					"keys": [
						"G\/5"
					],
					"duration": "16",
					"tie": "start"
				}, {
					"keys": [
						"G\/5"
					],
					"duration": "16",
					"tie": "stop"
				}, {
					"keys": [
						"E\/5"
					],
					"duration": "16"
				}, {
					"keys": [
						"D\/5"
					],
					"duration": "16"
				}, {
					"keys": [
						"C\/5"
					],
					"duration": "16"
				}]
			}]
		}],
		"editinfo": {
			"userid": "50f95ad27069badd428ff952",
			"date": {
				"sec": 1423579458,
				"usec": 660000
			}
		},
		"_id": {
			"$id": "531df5ac58e338d71de20bab"
		},
		"keySignature": "C"
	};

	var foldedSong = {
	"title": "Folded song",
 "composer": "Dani Martin",
 "time": "4\/4",
 "keySignature": "C",
 "style": "Medium Swing",
 "source": "51b6fe4067ca227d25665b0e",
 "changes": [  {
   "name": "",
   "repeat": 1,
   "numBars": 10,
   "bars": [
    {
     "chords": [
      {
       "p": "D",
       "ch": "m",
       "beat": 1
      }
     ],
     "melody": [
      {
       "keys": [
        "Db\/4"
       ],
       "duration": "w"
      }
     ]
    },
    {
     "melody": [
      {
       "keys": [
        "E\/4"
       ],
       "duration": "w"
      }
     ]
    },
    {
     "chords": [
      {
       "p": "F",
       "ch": "7",
       "beat": 1
      }
     ],
     "melody": [
      {
       "keys": [
        "F\/4"
       ],
       "duration": "w"
      }
     ]
    },
    {
     "melody": [
      {
       "keys": [
        "A#\/4"
       ],
       "duration": "w"
      }
     ]
    },
    {
     "chords": [
      {
       "p": "A",
       "ch": "m",
       "beat": 1
      }
     ],
     "melody": [
      {
       "keys": [
        "C\/5"
       ],
       "duration": "w"
      }
     ]
    },
    {
     "melody": [
      {
       "keys": [
        "B\/4"
       ],
       "duration": "h"
      },
      {
       "keys": [
        "A\/4"
       ],
       "duration": "h",
      }
     ]
    },
    {
     "ending": "1",
     "chords": [
      {
       "p": "G",
       "ch": "7",
       "beat": 1
      }
     ],
     "melody": [
      {
       "keys": [
        "A\/4"
       ],
       "duration": "h",
      },
      {
       "keys": [
        "B\/4"
       ],
       "duration": "qr"
      },
      {
       "keys": [
        "B\/4"
       ],
       "duration": "qr"
      }
     ]
    },
    {
     "melody": [
      {
       "keys": [
        "B\/4"
       ],
       "duration": "w"
      }
     ]
    },
    {
     "ending": "2",
     "chords": [
      {
       "p": "E",
       "ch": "7",
       "beat": 1
      },
      {
       "p": "F",
       "beat": 3
      }
     ],
     "melody": [
      {
       "keys": [
        "Ab\/4"
       ],
       "duration": "w"
      }
     ]
    },
    {
     "melody": [
      {
       "keys": [
        "G#\/4"
       ],
       "duration": "w"
      }
     ]
    }
   ]
  },
  {
   "name": "",
   "repeat": 0,
   "numBars": 4,
   "bars": [
    {
     "chords": [
      {
       "p": "D",
       "ch": "",
       "beat": 1
      }
     ],
     "melody": [
      {
       "keys": [
        "D\/5"
       ],
       "duration": "w"
      }
     ]
    },
    {
     "chords": [
      {
       "p": "G",
       "ch": "7",
       "beat": 1
      }
     ],
     "melody": [
      {
       "keys": [
        "F\/5"
       ],
       "duration": "w"
      }
     ]
    },
    {
     "chords": [
      {
       "p": "C",
       "ch": "maj7",
       "beat": 1
      }
     ],
     "melody": [
      {
       "keys": [
        "E\/5"
       ],
       "duration": "w"
      }
     ]
    },
    {
     "melody": [
      {
       "keys": [
        "E\/5"
       ],
       "duration": "w"
      }
     ]
    }
   ]
  }
 ]
};
	return {
		simpleLeadSheet: simpleLeadSheet,
		leadSheetTimeSigChanges: leadSheetTimeSigChanges,
		afoxe: afoxe,
		foldedSong: foldedSong
	};

});