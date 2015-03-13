define([
	'mustache',
	'modules/core/src/SongModel',
	'utils/UserLog',
	'utils/NoteUtils',
	'pubsub',
], function(Mustache, SongModel, UserLog, NoteUtils, pubsub) {

	function NoteEditionView(parentHTML) {
		this.el = undefined;
		this.initSubscribe();
		this.initKeyboard();
	}

	NoteEditionView.prototype.render = function(parentHTML, force, callback) {
		force = force || false;
		// case el has never been rendered
		var self = this;
		if (typeof this.el === "undefined" || (typeof this.el !== "undefined" && force === true)) {
			this.initView(parentHTML, function() {
				self.initController();
				$.publish('NoteEditionView-render');
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

	NoteEditionView.prototype.initView = function(parentHTML, callback) {
		var self = this;
		$.get('/modules/NoteEdition/src/NoteEditionTemplate.html', function(template) {
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
	NoteEditionView.prototype.initController = function() {
		// pitch
		$('#aug-note').click(function() {
			$.publish('NoteEditionView-setPitch', 1);
		});
		$('#sub-note').click(function() {
			$.publish('NoteEditionView-setPitch', -1);
		});

		// Alteration
		$('#double_flat').click(function() {
			$.publish('NoteEditionView-addAccidental', {'acc':'b','double':true});
		});
		$('#flat').click(function() {
			$.publish('NoteEditionView-addAccidental', 'b');
		});
		$('#natural').click(function() {
			$.publish('NoteEditionView-addAccidental', 'n');
		});
		$('#sharp').click(function() {
			$.publish('NoteEditionView-addAccidental', '#');
		});
		$('#double_sharp').click(function() {
			$.publish('NoteEditionView-addAccidental', {'acc':'#','double':true});
		});

		// Rhythm
		$('#whole-note').click(function() {
			$.publish('NoteEditionView-setCurrDuration', 7);
		});
		$('#half-note').click(function() {
			$.publish('NoteEditionView-setCurrDuration', 6);
		});
		$('#quarter-note').click(function() {
			$.publish('NoteEditionView-setCurrDuration', 5);
		});
		$('#eight-note').click(function() {
			$.publish('NoteEditionView-setCurrDuration', 4);
		});
		$('#sixteenth-note').click(function() {
			$.publish('NoteEditionView-setCurrDuration', 3);
		});
		$('#thirty-second-note').click(function() {
			$.publish('NoteEditionView-setCurrDuration', 2);
		});
		$('#sixty-four-note').click(function() {
			$.publish('NoteEditionView-setCurrDuration', 1);
		});
		$('#dot').click(function() {
			$.publish('NoteEditionView-setDot');
		});

		// Symbol
		$('#tie-note').click(function() {
			$.publish('NoteEditionView-setTie');
		});
		$('#tuplet').click(function() {
			$.publish('NoteEditionView-setTuplet', true);
		});

		// Note
		$('#silent-note').click(function() {
			$.publish('NoteEditionView-setSilence');
		});
		$('#regular-note').click(function() {
			$.publish('NoteEditionView-setPitch', 0);
		});
		$('#delete-note').click(function() {
			$.publish('NoteEditionView-deleteNote');
		});
		$('#add-note').click(function() {
			$.publish('NoteEditionView-addNote');
		});

		// Selection
		$('#copy-note').click(function() {
			$.publish('NoteEditionView-copyNotes');
		});
		$('#paste-note').click(function() {
			$.publish('NoteEditionView-pasteNotes');
		});
	};

	NoteEditionView.prototype.initKeyboard = function(evt) {
		var self = this;
		var ACC_KEYS = {
			"s": "#",
			"v": "b",
			"n": "n"
		};
		$(document).keydown(function(evt) {
			if (self.editing === false) {
				return;
			}
			var keyCode = (evt === null) ? event.keyCode : evt.keyCode;
			var key = String.fromCharCode(keyCode).toLowerCase();
			var metaKey = !!evt.metaKey;

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

			//Functions for Notes
			if (self.isEditMode("notes")) {
				if (keyCode == 38 || keyCode == 40) { // up & down arrows
					var inc = (keyCode == 38) ? 1 : -1;
					$.publish('NoteEditionView-setPitch', inc);
					stopEvent(evt);
				} else if (NoteUtils.getValidPitch(key) != -1 && (!evt.ctrlKey)) {
					$.publish('NoteEditionView-setPitch', key.toUpperCase());
					stopEvent(evt);
				} else if (ACC_KEYS.hasOwnProperty(key) && (!evt.ctrlKey)) {
					var acc = ACC_KEYS[key];
					// console.log(acc);
					$.publish('NoteEditionView-addAccidental', {'acc':acc,'double':evt.shiftKey});
					stopEvent(evt);
				} else if (parseInt(key, null) >= 1 && parseInt(key, null) <= 9) {
					$.publish('NoteEditionView-setCurrDuration', key);
					stopEvent(evt);
				} else if (keyCode == 190) {
					$.publish('NoteEditionView-setDot', evt.shiftKey);
					stopEvent(evt);
				} else if (keyCode == 84) { // T be carefull, set key to t will be call on F5 also
					if (evt.shiftKey) {
						$.publish('NoteEditionView-setTuplet');
					} else {
						$.publish('NoteEditionView-setTie');
					}
					stopEvent(evt);
				} else if (keyCode == 82) { // R
					$.publish('NoteEditionView-setSilence');
					stopEvent(evt);
				} else if (keyCode == 46) { //supr
					$.publish('NoteEditionView-deleteNote');
					stopEvent(evt);
				} else if (keyCode == 13) { //enter
					$.publish('NoteEditionView-addNote');
					stopEvent(evt);
				} else if ((keyCode == 67 && evt.ctrlKey) || (keyCode == 67 && metaKey)) { // Ctrl + c or Command + c (mac or windows specific key)
					$.publish('NoteEditionView-copyNotes');
					stopEvent(evt);
				} else if ((keyCode == 86 && evt.ctrlKey) || (keyCode == 86 && metaKey)) { // Ctrl + v or Command + v (mac or windows specific key)
					$.publish('NoteEditionView-pasteNotes');
					stopEvent(evt);
				}
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
	NoteEditionView.prototype.initSubscribe = function() {};


	NoteEditionView.prototype.isEditMode = function(mode) {
		if (this.editMode === mode) {
			return true;
		}
		return false;
	};

	NoteEditionView.prototype.getEditMode = function() {
		return this.editMode;
	};

	NoteEditionView.prototype.unactiveView = function(idElement) {
		this.editMode = '';
		$.publish('NoteEditionView-unactiveView');
	};

	NoteEditionView.prototype.activeView = function(idElement) {
		this.editMode = 'notes';
		$.publish('NoteEditionView-activeView', 'notes');
	};

	return NoteEditionView;
});