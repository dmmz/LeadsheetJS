define([
	'jquery',
	'mustache',
	'modules/core/src/SongModel',
	'utils/UserLog',
	'utils/NoteUtils',
	'pubsub',
	'text!modules/NoteEdition/src/NoteEditionTemplate.html',
], function($, Mustache, SongModel, UserLog, NoteUtils, pubsub, NoteEditionTemplate) {
	/**
	 * NoteEditionView creates notes edition template and link event from html to controller
	 * @exports NoteEdition/NoteEditionView
	 */
	function NoteEditionView(imgPath) {
		this.el = undefined;
		this.imgPath = imgPath;
		this.initKeyboard();
		this.render();
	}

	NoteEditionView.prototype.render = function(parentHTML, callback) {
		this.el = Mustache.render(NoteEditionTemplate, {
			'imgPath': this.imgPath
		});
	};

	/**
	 * manages events that come from the keyboard
	 */
	NoteEditionView.prototype.initKeyboard = function() {
		$.subscribe('updown-arrows', function(el, inc, evt) {
			fn = 'setPitch';
			$.publish('NoteEditionView', [fn, inc, evt.shiftKey]);
		});
		$.subscribe('pitch-letter-key', function(el, key) {
			fn = 'setPitch';
			$.publish('NoteEditionView', [fn, key]);
		});
		$.subscribe('accidental-key', function(el, acc) {
			fn = 'addAccidental';
			$.publish('NoteEditionView', [fn, acc]);
		});
		$.subscribe('shift-accidental-key', function(el, acc) {
			fn = 'addAccidental';
			$.publish('NoteEditionView', [fn, acc + acc]);
		});
		$.subscribe('number-key', function(el, key) {
			fn = 'setCurrDuration';
			$.publish('NoteEditionView', [fn, key]);
		});
		$.subscribe('dot-key', function(el) {
			fn = 'setDot';
			$.publish('NoteEditionView', fn);
		});
		$.subscribe('colon-key', function(el) {
			fn = 'setDoubleDot';
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
	 * this function is called by MainMenuView
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
			$.publish('NoteEditionView', [fn, 'bb']);
		});
		$('#flat').click(function() {
			fn = 'addAccidental';
			$.publish('NoteEditionView', [fn, 'b']);
		});
		$('#natural').click(function() {
			fn = 'addAccidental';
			$.publish('NoteEditionView', [fn, 'n']);
		});
		$('#sharp').click(function() {
			fn = 'addAccidental';
			$.publish('NoteEditionView', [fn, '#']);
		});
		$('#double_sharp').click(function() {
			fn = 'addAccidental';
			$.publish('NoteEditionView', [fn, '##']);
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
		$('#double-dot').click(function() {
			fn = 'setDoubleDot';
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
	return NoteEditionView;
});