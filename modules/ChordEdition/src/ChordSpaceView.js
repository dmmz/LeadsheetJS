define([
	'utils/ChordUtils',
	'utils/UserLog',
	'jquery',
	'pubsub',
	'jquery_autocomplete',
	'modules/Edition/src/ElementView',
	'modules/Edition/src/HtmlInputElement'
], function(ChordUtils, UserLog, $, pubsub, jquery_autocomplete, ElementView, HtmlInputElement) {
	/**
	 * ChordSpaceView is represented as a rectangle on each beat on top of bars, it create an input where user can select a chord label
	 * This object is created by ChordSpaceManager
	 * @exports ChordEdition/ChordSpaceView
	 */
	function ChordSpaceView(viewer, position, barNumber, beatNumber, viewerScaler) {
		this.viewer = viewer;
		this.position = position;
		this.barNumber = barNumber;
		this.beatNumber = beatNumber;
		this.scaler = viewerScaler;
	}

	/**
	 * @interface
	 */
	ChordSpaceView.prototype.isInPath = function(coords) {
		return ElementView.isInPath(coords, this.position, this.scaler);
	};
	/**
	 * @interface
	 */
	ChordSpaceView.prototype.isBetweenYs = function(coords) {
		return ElementView.isBetweenYs(coords, this.position, this.scaler);
	};
	/**
	 * @interface
	 */
	ChordSpaceView.prototype.getArea = function() {
		return this.position;
	};

	/**
	 * @interface
	 *
	 * @param  {CanvasContext} ctx
	 * @param  {Number} marginTop   [description]
	 * @param  {Number} marginRight [description]
	 */
	ChordSpaceView.prototype.draw = function(ctx, marginTop, marginRight) {
		var style = ctx.fillStyle;
		ctx.fillStyle = "#0099FF";
		ctx.globalAlpha = 0.2;
		ctx.fillRect(
			this.position.x,
			this.position.y - marginTop,
			this.position.w - marginRight,
			this.position.h + marginTop
		);
		ctx.fillStyle = style;
		ctx.globalAlpha = 1;
	};


	ChordSpaceView.prototype._getChordAtThisPosition = function(songModel) {
		return songModel.getComponent('chords').searchChordByBarAndBeat(this.barNumber, this.beatNumber);
	};

	ChordSpaceView.prototype.drawEditableChord = function(songModel, marginTop, marginRight) {
		var self = this;

		// Get chord value
		var inputVal = '';
		if (typeof songModel !== "undefined") {
			var chord = this._getChordAtThisPosition(songModel);
			if (typeof chord !== "undefined") {
				inputVal = chord.toString('', false);
			}
		}
		//we create html input, jquery object is in htmlInput.input (did not do getter because don't believe anymore in plain getters in javascript)
		var htmlInput = new HtmlInputElement(this.viewer, 'chordSpaceInput', this.getArea(), marginTop, marginRight);
		var input = htmlInput.input;
		// We create auto complete input
		var chordTypeList = [];
		if (typeof ChordUtils.allChords !== "undefined") {
			chordTypeList = ChordUtils.allChords;
		} else {
			chordTypeList = ChordUtils.getAllChords();
		}
		this.createAutocomplete(input, songModel, chordTypeList, inputVal);


		// TRAINING CODE FOR ALEX SERVLET
		/*var chordList = this._getChordList(songModel);
		//console.log(JSON.stringify(chordList));
		this.getPredictionChords(chordList, function(chordsPrediction) {
			self.chordsPrediction = chordsPrediction;
			// TODO Index should be computed by creating a function that return index of previous chord
			// looking for chords prediction between index 1 and 2;
			var predictionList = self.getPredictionListFromPosition(input, 1, chordTypeList);
			self.createAutocomplete(input, songModel, predictionList, inputVal);
		});*/
		return htmlInput;
	};

	ChordSpaceView.prototype.getPredictionListFromPosition = function(input, indexChordsBefore, chordTypeList) {
		var predictionList = [];
		for (var i = 0, c = this.chordsPrediction[indexChordsBefore].length; i < c; i++) {
			predictionList.push(this.chordsPrediction[indexChordsBefore][i]["note"] + '' + this.chordsPrediction[indexChordsBefore][i]["chordType"]);
		}
		predictionList = predictionList.concat(chordTypeList);
		return predictionList;
	};

	ChordSpaceView.prototype.getPredictionChords = function(chordList, callback) {
		/*$.ajax({
			url: 'http://apijava.flow-machines.com:8080/',
			dataType: 'json',
			type: 'POST',
			data: chordList,
			xhrFields: {
				withCredentials: true
			},
			success: function(data) {
				if (typeof data !== "undefined") {
					if (typeof callback !== "undefined") {
						callback(data);
					}
				}
			}
		});*/
		// Example of request returned
		var data = [
			// Tous les accords qui vont s’afficher si la personne clic dans une case entre l’accord 1 et 2
			[{
				"note": "F",
				"chordType": "m"
			}, {
				"note": "G",
				"chordType": "m"
			}, {
				"note": "C",
				"chordType": "7"
			}],
			// Tous les accords qui vont s’afficher si la personne clic dans une case entre l’accord 2 et 3
			[{
				"note": "F",
				"chordType": "m"
			}, {
				"note": "D",
				"chordType": "7"
			}, {
				"note": "C",
				"chordType": "7"
			}, ],
		];

		if (typeof data !== "undefined") {
			if (typeof callback !== "undefined") {
				callback(data);
			}
		}
	};

	ChordSpaceView.prototype.onChange = function(songModel, newChordString) {
		var currentChord = this._getChordAtThisPosition(songModel);
		var chordJson = ChordUtils.string2Json(newChordString);

		var removingChord = !!(chordJson.empty && currentChord !== undefined);
		var noUpdateToEmptyChord = !!(chordJson.empty && currentChord === undefined);
		var addingNewChord = (!chordJson.empty && currentChord === undefined);

		if (chordJson.error) {
			UserLog.logAutoFade('error', 'Chord "' + newChordString + '" not well formated');
		} else if (!noUpdateToEmptyChord && (removingChord || addingNewChord || !currentChord.equalsTo(chordJson))) {
			//last condition refers to when we are modifying existing chord
			$.publish('ChordSpaceView-updateChord', [chordJson, currentChord, this]);
		}
	};

	ChordSpaceView.prototype.createAutocomplete = function(input, songModel, list, inputVal) {
		var self = this;
		// input.select();
		input.devbridgeAutocomplete({
			lookup: list,
			maxHeight: 200,
			lookupLimit: 40,
			width: 140,
			triggerSelectOnValidInput: false,
			showNoSuggestionNotice: true,
			autoSelectFirst: true,
			delimiter: "/",
			// You may need to modify that if at first it appears incorrectly, it's probably because ur element is not absolute position
			// 'appendTo': myAbsolutedPositionElement, // dom or jquery (see devbridgeAutocomplete doc)
			noSuggestionNotice: 'No Chord match',
			lookupFilter: function(suggestion, originalQuery, queryLowerCase) {
				return suggestion.value.indexOf(originalQuery) !== -1;
			},
			onSelect: function() {
				self.onChange(songModel, $(input).val());
				//input.devbridgeAutocomplete('dispose');
			}
		});
		input.focus(); // this focus allow setting cursor on end carac
		input.val(inputVal);
		input.focus(); // this focus launch autocomplete directly when value is not empty
		// on blur event we change the value, blur is launched when we enter and click somewhere else
		input.on('blur', function() {
			self.onChange(songModel, $(this).val())
				// input.devbridgeAutocomplete('dispose');
		});
		// on tab call (tab doesn't trigger blur event)
		input.keydown(function(e) {
			var code = e.keyCode || e.which;
			if (code == '9') {
				//console.log('tab');
				self.onChange(songModel, $(this).val());
				input.devbridgeAutocomplete('dispose');
			}
		});
		// We use a filter function to make it easier for user to enter chords
		input.on('input propertychange paste', function() {
			$(this).val(self.filterFunction($(this).val()));
		});
	};

	ChordSpaceView.prototype._getChordList = function(songModel) {
		var chordList = [];
		var cm = songModel.getComponent('chords');
		var chords = cm.getChords();
		var chordItem = {};
		for (var i = 0, c = chords.length; i < c; i++) {
			chordItem = {
				note: chords[i].note,
				chordType: chords[i].chordType,
				startBeat: songModel.getStartBeatFromBarNumber(chords[i].barNumber) + chords[i].beat
			};
			chordList.push(chordItem);
		}
		return chordList;
	};


	/**
	 * Set to upper case first notes, add a lot of replacement for french or not keyboard
	 * @param  {String} s input string
	 * @return {String}   output string
	 */
	ChordSpaceView.prototype.filterFunction = function(s) {
		function indexesOf(source, find) {
			var result = [];
			for (i = 0; i < source.length; ++i) {
				if (source.substring(i, i + find.length) == find) {
					result.push(i);
				}
			}
			return result;
		}
		s = s.replace(/^[a-z]/, function(m) {
			return m.toUpperCase();
		});
		s = s.replace(/\/[a-z]/, function(m) {
			return m.toUpperCase();
		});
		s = s.replace("-", "m");
		s = s.replace("è", "7");
		s = s.replace("ç", "9");
		s = s.replace("0", "halfdim7");
		s = s.replace("<", "|");
		s = s.replace(".", "dim7");
		s = s.replace("*", "M7");
		s = s.replace("mm", "mM");
		if (s.substring(0, 1) == "5") {
			s = s.replace("5", "%");
		}

		// replace 3 by # always except if it comes after 1 (e.g. A13) or after t (e.g. AM7(omit3) )
		var indexes = indexesOf(s, "3");
		for (var i in indexes) {
			if (s.charAt(indexes[i] - 1) != 1 && s.charAt(indexes[i] - 1) != "t") {
				s = s.substr(0, indexes[i]) + "#" + s.substr(indexes[i] + 1);
			}
		}

		s = s.replace(/^(.+)(p|²)$/, "($1)"); // parenthesis and ² 
		return s;
	};
	return ChordSpaceView;
});