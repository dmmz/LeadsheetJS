define([
	'utils/ChordUtils',
	'utils/UserLog',
	'pubsub',
	'jquery_autocomplete',
], function(ChordUtils, UserLog, pubsub, jquery_autocomplete) {

	function ChordSpaceView(viewer, position, barNumber, beatNumber) {
		this.viewer = viewer;
		this.initSubscribe();
		this.position = position;
		this.barNumber = barNumber;
		this.beatNumber = beatNumber;
	}

	/**
	 * Publish event after receiving dom events
	 */
	ChordSpaceView.prototype.initController = function() {
		// input publish is on draw function
	};

	ChordSpaceView.prototype.initKeyboard = function(evt) {};

	/**
	 * Subscribe to model events
	 */
	ChordSpaceView.prototype.initSubscribe = function() {};

	ChordSpaceView.prototype.isInPath = function(x, y) {
		if (typeof x !== "undefined" && !isNaN(x) && typeof y !== "undefined" && !isNaN(y)) {
			if (this.position.x <= x && x <= (this.position.x + this.position.xe) && this.position.y <= y && y <= (this.position.y + this.position.ye)) {
				return true;
			}
		}
		return false;
	};

	ChordSpaceView.prototype.draw = function(viewer, songModel, selected) {
		var cursorHeight = 20;
		var marginTop = 5;
		var marginRight = 5;
		if (!!selected) {
			var self = this;
			var offset = $("#canvas_container canvas").offset();
			if (typeof offset === "undefined" || isNaN(offset.top) || isNaN(offset.left)) {
				offset = {
					top: 0,
					left: 0
				};
			}
			// viewer.ctx.strokeStyle = "#0077FF";
			var top = this.position.y - marginTop - 1;
			var left = this.position.x + offset.left + window.pageXOffset - 1;
			var width = this.position.xe - marginRight;
			var height = cursorHeight + marginTop;
			var inputVal = '';
			if (typeof songModel !== "undefined") {
				var chord = songModel.getComponent('chords').searchChordByBarAndBeat(this.barNumber, this.beatNumber);
				if (typeof chord !== "undefined") {
					inputVal = chord.toString('', false);
				}
			}
			var input = $('<input/>').attr({
				type: 'text',
				style: "position:absolute; z-index: 11000;left:" + left + "px;top:" + top + "px; width:" + width + "px; height:" + height + "px",
				'class': 'chordSpaceInput',
			}).prependTo('#canvas_container');
			var chordTypeList = [];
			if (typeof ChordUtils.allChords !== "undefined") {
				chordTypeList = ChordUtils.allChords;
			} else {
				chordTypeList = ChordUtils.getAllChords();
			}
			// input.select();
			input.devbridgeAutocomplete({
				'lookup': chordTypeList,
				'maxHeight': 200,
				'width': 140,
				'triggerSelectOnValidInput': false,
				'showNoSuggestionNotice': true,
				'autoSelectFirst': true,
				// You may need to modify that if at first it appears incorrectly, it's probably because ur element is not absolute position
				// 'appendTo': myAbsolutedPositionElement, // dom or jquery (see devbridgeAutocomplete doc)
				'noSuggestionNotice': 'No Chord match',
				lookupFilter: function(suggestion, originalQuery, queryLowerCase) {
					return suggestion.value.indexOf(originalQuery) !== -1;
				},
				onSelect: function(suggestion) {
					var chordInfos = {
						'chordString': suggestion.value,
						'chordModel': chord,
						'chordSpace': self,
					};
					input.devbridgeAutocomplete('dispose');
					$.publish('ChordSpaceView-updateChord', chordInfos);
				}
			});
			input.focus(); // this focus allow setting cursor on end carac
			input.val(inputVal);
			input.focus(); // this focus launch autocomplete firectly when value is not empty
		}
		viewer.ctx.strokeStyle = "#999999";
		
		viewer.ctx.strokeRect(
			this.position.x,
			this.position.y - marginTop,
			this.position.xe - marginRight,
			cursorHeight + marginTop
		);
	};

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