define([
	'jquery',
	'mustache',
	'modules/core/src/SongModel',
	'utils/UserLog',
	'utils/NoteUtils',
	'pubsub',
	'text!modules/NoteEdition/src/NoteEditionTemplate.html',
], function($, Mustache, SongModel, UserLog, NoteUtils, pubsub, NoteEditionTemplate) {

	function NoteEditionView(imgPath) {
		this.el = undefined;
		this.imgPath = imgPath;
		this.initKeyboard();
	}

	NoteEditionView.prototype.render = function(parentHTML, callback) {
		//if (typeof this.el === "undefined" || (typeof this.el !== "undefined" && force === true)) {
		var rendered = Mustache.render(NoteEditionTemplate, {
			'imgPath': this.imgPath
		});
		if (typeof parentHTML !== "undefined") {
			parentHTML.innerHTML = rendered;
		}
		this.el = rendered;
		if (typeof callback === "function") {
			callback();
		}
		return;
	};

	/**
	 * manages events that come from the keyboard
	 */
	NoteEditionView.prototype.initKeyboard = function() {
		$.subscribe('updown-arrows', function(el, inc) {
			fn = 'setPitch';
			$.publish('NoteEditionView', [fn, inc]);
		});
		$.subscribe('pitch-letter-key', function(el, key) {
			fn = 'setPitch';
			$.publish('NoteEditionView', [fn, key]);
		});
		$.subscribe('accidental-key', function(el, acc) {
			fn = 'addAccidental';
			$.publish('NoteEditionView', [fn, [acc, false]]);
		});
		$.subscribe('shift-accidental-key', function(el, acc) {
			fn = 'addAccidental';
			$.publish('NoteEditionView', [fn, [acc, true]]);
		});
		$.subscribe('number-key', function(el, key) {
			fn = 'setCurrDuration';
			$.publish('NoteEditionView', [fn, key]);
		});
		$.subscribe('dot-key', function(el) {
			fn = 'setDot';
			$.publish('NoteEditionView', fn);
		});
		$.subscribe('shift-t-key', function(el) {
			fn = 'setTuplet';
			$.publish('NoteEditionView', fn);
		});
		$.subscribe('t-key', function(el) {
			fn = 'setTie';
			$.publish('NoteEditionView', fn);
		});
		$.subscribe('R-key', function(el) {
			fn = 'setSilence';
			$.publish('NoteEditionView', fn);
		});
		$.subscribe('supr-key', function(el) {
			fn = 'setSilence';
			$.publish('NoteEditionView', fn);
		});
		$.subscribe('enter-key', function(el) {
			fn = 'addNote';
			$.publish('NoteEditionView', fn);
		});
		$.subscribe('ctrl-c-key', function(el) {
			fn = 'copyNotes';
			$.publish('NoteEditionView', fn);
		});
		$.subscribe('ctrl-v-key', function(el) {
			fn = 'pasteNotes';
			$.publish('NoteEditionView', fn);
		});

	};
	/**
	 * Manages events clicked from the menu
	 * this function is called by MainMenuView, after view is rendered
	 *
	 */
	NoteEditionView.prototype.initController = function() {
		// pitch
		var fn;
		$('#aug-note').click(function() {
			fn = 'setPitch';
			$.publish('NoteEditionView', [fn, 1]);
		});
		$('#sub-note').click(function() {
			fn = 'setPitch';
			$.publish('NoteEditionView', [fn, -1]);
		});

		// Alteration
		$('#double_flat').click(function() {
			fn = 'addAccidental';
			$.publish('NoteEditionView', [fn, ['b', true]]);
		});
		$('#flat').click(function() {
			fn = 'addAccidental';
			$.publish('NoteEditionView', [fn, ['b', false]]);
		});
		$('#natural').click(function() {
			fn = 'addAccidental';
			$.publish('NoteEditionView', [fn, ['n', false]]);
		});
		$('#sharp').click(function() {
			fn = 'addAccidental';
			$.publish('NoteEditionView', [fn, ['#', false]]);
		});
		$('#double_sharp').click(function() {
			fn = 'addAccidental';
			$.publish('NoteEditionView', [fn, ['#', true]]);
		});
		// Rhythm
		$('#whole-note').click(function() {
			fn = 'setCurrDuration';
			$.publish('NoteEditionView', [fn, 7]);
		});
		$('#half-note').click(function() {
			fn = 'setCurrDuration';
			$.publish('NoteEditionView', [fn, 6]);
		});
		$('#quarter-note').click(function() {
			fn = 'setCurrDuration';
			$.publish('NoteEditionView', [fn, 5]);
		});
		$('#eight-note').click(function() {
			fn = 'setCurrDuration';
			$.publish('NoteEditionView', [fn, 4]);
		});
		$('#sixteenth-note').click(function() {
			fn = 'setCurrDuration';
			$.publish('NoteEditionView', [fn, 3]);
		});
		$('#thirty-second-note').click(function() {
			fn = 'setCurrDuration';
			$.publish('NoteEditionView', [fn, 2]);
		});
		$('#sixty-four-note').click(function() {
			fn = 'setCurrDuration';
			$.publish('NoteEditionView', [fn, 1]);
		});
		$('#dot').click(function() {
			fn = 'setDot';
			$.publish('NoteEditionView', fn);
		});

		// Symbol
		$('#tie-note').click(function() {
			fn = 'setTie';
			$.publish('NoteEditionView', fn);
		});
		$('#tuplet').click(function() {
			fn = 'setTuplet';
			$.publish('NoteEditionView', fn);
		});

		// Note
		$('#silent-note').click(function() {
			fn = 'setSilence';
			$.publish('NoteEditionView', fn);
		});
		$('#regular-note').click(function() {
			fn = 'setPitch';
			$.publish('NoteEditionView', [fn, 0]);
		});
		$('#delete-note').click(function() {
			// in our editor we want to replace note by silence and not delete note
			fn = 'setSilence';
			$.publish('NoteEditionView', fn);
		});
		$('#add-note').click(function() {
			fn = 'addNote';
			$.publish('NoteEditionView', fn);
		});

		// Selection
		$('#copy-note').click(function() {
			fn = 'copyNotes';
			$.publish('NoteEditionView', fn);
		});
		$('#paste-note').click(function() {
			fn = 'pasteNotes';
			$.publish('NoteEditionView', fn);
		});
	};

	//TODO: not verified, nor tested, nor used
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