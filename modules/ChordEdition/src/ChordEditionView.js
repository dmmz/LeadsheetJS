define([
	'mustache',
	'modules/core/src/SongModel',
	'utils/UserLog',
	'utils/NoteUtils',
	'pubsub',
], function(Mustache, SongModel, UserLog, NoteUtils, pubsub) {

	function ChordEditionView(parentHTML) {
		this.el = undefined;
		this.initSubscribe();
	}

	ChordEditionView.prototype.render = function(parentHTML, force, callback) {
		force = force || false;
		// case el has never been rendered
		var self = this;
		if (typeof this.el === "undefined" || (typeof this.el !== "undefined" && force === true)) {
			this.initView(parentHTML, function() {
				self.initController();
				self.initKeyboard();
				$.publish('ChordEditionView-render');
				if (typeof callback === "function") {
					callback();
				}
				return;
			});
		} else {
			if (typeof callback === "function") {
				callback();
			}
			return;
		}
	};

	ChordEditionView.prototype.initView = function(parentHTML, callback) {
		var self = this;
		$.get('/modules/ChordEdition/src/ChordEditionTemplate.html', function(template) {
			var rendered = Mustache.render(template);
			if (typeof parentHTML !== "undefined") {
				parentHTML.innerHTML = rendered;
			}
			self.el = rendered;
			if (typeof callback === "function") {
				callback();
			}
		});
	};

	/**
	 * Publish event after receiving dom events
	 */
	ChordEditionView.prototype.initController = function() {
		// Chords
		$('#chord-visibility').click(function() {
			$.publish('ChordEditionView-toggleChordVisibility');
		});
		$('#delete_chord').click(function() {
			$.publish('ChordEditionView-deleteChord');
		});
		$('#add_chord').click(function() {
			$.publish('ChordEditionView-addChord');
		});

		// Selection
		$('#edit_chord').click(function() {
			$.publish('ChordEditionView-toggleEditChord');
		});
		$('#copy_chord').click(function() {
			$.publish('ChordEditionView-copyChords');
		});
		$('#paste_chord').click(function() {
			$.publish('ChordEditionView-pasteChords');
		});

	};

	ChordEditionView.prototype.initKeyboard = function(evt) {
		var self = this;
		$(document).keydown(function(evt) {
			if (self.editing === false) {
				return;
			}
			var keyCode = (evt === null) ? event.keyCode : evt.keyCode;
			var key = String.fromCharCode(keyCode).toLowerCase();

			//prevent backspace
			if (keyCode === 8) {
				var doPrevent = false;
				var d = evt.srcElement || evt.target;
				if (d.tagName.toUpperCase() === 'TEXTAREA' || (d.tagName.toUpperCase() === 'INPUT' && (d.type.toUpperCase() === 'TEXT' || d.type.toUpperCase() === 'PASSWORD' || d.type.toUpperCase() === 'FILE'))) {
					doPrevent = d.readOnly || d.disabled;
				} else {
					doPrevent = true;
				}
				if (doPrevent) {
					stopEvent(evt);
				}
			}

			//Functions for Chords
			if (self.isEditMode("chords")) {
				if (keyCode == 32) { // space					
					$.publish('ChordEditionView-addChord');
					stopEvent(evt);
				} else if (keyCode == 46) { // delete
					$.publish('ChordEditionView-deleteChord');
					stopEvent(evt);
				} else if (keyCode == 13) { //	enter
					$.publish('ChordEditionView-toggleEditChord');
					stopEvent(evt);
				} else if (keyCode == 9) { // tab
					if (evt.shiftKey) {
						$.publish('ChordEditionView-chordTabEvent', -1);
					} else {
						$.publish('ChordEditionView-chordTabEvent', 1);
					}
					stopEvent(evt);
				} else if (keyCode == 86) { // V
					$.publish('ChordEditionView-toggleChordVisibility');
					stopEvent(evt);
				} else if (keyCode == 67 && evt.ctrlKey) { // Ctrl + c
					$.publish('ChordEditionView-copyChords');
					stopEvent(evt);
				} else if (keyCode == 86 && evt.ctrlKey) { // Ctrl + v
					$.publish('ChordEditionView-pasteChords');
					stopEvent(evt);
				}
				// else console.log(key + " " + keyCode);
			}
		});

		function stopEvent(evt) {
			evt.preventDefault();
			evt.stopPropagation();
		}
	};



	/**
	 * Subscribe to model events
	 */
	ChordEditionView.prototype.initSubscribe = function() {};


	ChordEditionView.prototype.isEditMode = function(mode) {
		if (this.editMode === mode) {
			return true;
		}
		return false;
	};

	ChordEditionView.prototype.getEditMode = function() {
		return this.editMode;
	};

	ChordEditionView.prototype.unactiveView = function(idElement) {
		this.editMode = '';
	};

	ChordEditionView.prototype.activeView = function(idElement) {
		this.editMode = 'chords';
	};

	return ChordEditionView;
});