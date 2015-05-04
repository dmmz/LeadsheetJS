define([
	'utils/ChordUtils',
	'utils/UserLog',
	'pubsub',
	'jquery_autocomplete'
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
		// there are two controllers, one on input onselect, the other on blur event
	};

	ChordSpaceView.prototype.initKeyboard = function(evt) {};

	/**
	 * Subscribe to model events
	 */
	ChordSpaceView.prototype.initSubscribe = function() {};

	ChordSpaceView.prototype.isInPath = function(area) {
		area.xe = area.xe || area.x; 
		area.ye = area.ye || area.y; //in case xe and ye are not defined, they take the same value a x and y respectively
		var pos = this.viewer.scaler.getScaledObj(this.position);
		var posXe = pos.x + pos.w,
		posYe = pos.y + pos.h;

		// console.log("area");
		// console.log(area);
		// console.log("position");
		// console.log(pos);
		return (area.x < posXe && area.xe > pos.x) && (area.y < posYe && area.ye > pos.y);
	};

	ChordSpaceView.prototype.onChange = function(chord, value) {
		var chordInfos = {
			'chordString': value,
			'chordModel': chord,
			'chordSpace': this,
		};
		$.publish('ChordSpaceView-updateChord', chordInfos);
	};


	ChordSpaceView.prototype.drawEditableChord = function(songModel, selected) {
		
		var marginTop = 5;
		var marginRight = 5;
		if (!!selected) {
			var self = this;

			// Get chord value
			var inputVal = '';
			if (typeof songModel !== "undefined") {
				var chord = songModel.getComponent('chords').searchChordByBarAndBeat(this.barNumber, this.beatNumber);
				if (typeof chord !== "undefined") {
					inputVal = chord.toString('', false);
				}
			}

			// Then we create input
			var offset = $("#canvas_container canvas").offset();
			if (typeof offset === "undefined" || isNaN(offset.top) || isNaN(offset.left)) {
				offset = {
					top: 0,
					left: 0
				};
			}
			var pos =  this.viewer.scaler.getScaledObj(this.position);
			var top = pos.y - marginTop - 1;
			var left = pos.x + offset.left + window.pageXOffset - 1;
			var width = pos.w - marginRight;
			var height = pos.h + marginTop;
			var input = $('<input/>').attr({
				type: 'text',
				style: "position:absolute; z-index: 11000;left:" + left + "px;top:" + top + "px; width:" + width + "px; height:" + height + "px",
				'class': 'chordSpaceInput',
			}).prependTo('#canvas_container');

			// We create auto complete input
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
					// console.log('select');
					//$(input).val(suggestion.value);
					input.devbridgeAutocomplete('dispose');
					self.onChange(chord, suggestion.value);
				}
			});
			input.focus(); // this focus allow setting cursor on end carac
			input.val(inputVal);
			input.focus(); // this focus launch autocomplete firectly when value is not empty
			// on blur event we change the value, blur is launched when we enter and click somewhere else
			input.on('blur', function() {
				//console.log('blur');
				self.onChange(chord, $(this).val());
				input.devbridgeAutocomplete('dispose');
			});
			$('#autocomplete-suggestion').on('click', function() {
				//console.log('click');
				self.onChange(chord, $(input).val());
				input.devbridgeAutocomplete('dispose');
			});
			// on tab call (tab doesn't trigger blur event)
			/*input.keydown(function(e) {
				var code = e.keyCode || e.which;
				if (code == '9') {
					console.log('tab');
					// self.onChange(chord, $(this).val());
					// input.devbridgeAutocomplete('dispose');
				}
			});*/
			// We use a filter function to make it easier for user to enter chords
			input.on('input propertychange paste', function() {
				$(this).val(self.filterFunction($(this).val()));
			});
		}

		//Drawing chord space boxes. We don't need to scale because this function is called by ChordSpaceManager.draw, which uses viewer.drawElem
		this.viewer.ctx.strokeStyle = "#999999";
		this.viewer.ctx.strokeRect(
			this.position.x,
			this.position.y - marginTop,
			this.position.w - marginRight,
			this.position.h + marginTop
		);
	};
	ChordSpaceView.prototype.draw = function(ctx) {
		
		var marginTop = 5;
		var marginRight = 5;
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