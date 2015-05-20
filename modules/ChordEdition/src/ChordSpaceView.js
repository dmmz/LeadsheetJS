define([
	'utils/ChordUtils',
	'utils/UserLog',
	'jquery',
	'pubsub',
	'jquery_autocomplete',
	'modules/Edition/src/ElementView'
], function(ChordUtils, UserLog, $, pubsub, jquery_autocomplete, ElementView) {

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


	ChordSpaceView.prototype.onChange = function(chord, value) {
		var chordInfos = {
			'chordString': value,
			'chordModel': chord,
			'chordSpace': this,
		};
		$.publish('ChordSpaceView-updateChord', chordInfos);
	};


	ChordSpaceView.prototype.drawEditableChord = function(songModel, marginTop, marginRight) {
		var self = this;

		// Get chord value
		var inputVal = '';
		if (typeof songModel !== "undefined") {
			var chord = songModel.getComponent('chords').searchChordByBarAndBeat(this.barNumber, this.beatNumber);
			if (typeof chord !== "undefined") {
				inputVal = chord.toString('', false);
			}
		}

		// // Then we create input
		var offset = $("#canvas_container canvas").offset();
		if (typeof offset === "undefined" || isNaN(offset.top) || isNaN(offset.left)) {
			offset = {
				top: 0,
				left: 0
			};
		}
		var pos = this.viewer.scaler.getScaledObj(this.position);
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
		input.focus(); // this focus launch autocomplete directly when value is not empty
		/*// on blur event we change the value, blur is launched when we enter and click somewhere else
		// We don't use blur because it prevent onclick element to be launched
		input.on('blur', function() {
			console.log('blur');
			self.onChange(chord, $(this).val());
			input.devbridgeAutocomplete('dispose');
		});*/
		$('#autocomplete-suggestion').on('click', function() {
			// console.log('click');
			self.onChange(chord, $(input).val());
			input.devbridgeAutocomplete('dispose');
		});
		// on tab call (tab doesn't trigger blur event)
		input.keydown(function(e) {
			var code = e.keyCode || e.which;
			if (code == '9') {
				// console.log('tab');
				self.onChange(chord, $(this).val());
				input.devbridgeAutocomplete('dispose');
			}
			if (code == '13') {
				// console.log('enter');
				self.onChange(chord, $(this).val());
				input.devbridgeAutocomplete('dispose');
			}
		});
		// We use a filter function to make it easier for user to enter chords
		input.on('input propertychange paste', function() {
			$(this).val(self.filterFunction($(this).val()));
		});

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