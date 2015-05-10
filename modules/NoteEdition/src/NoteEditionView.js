define([
	'mustache',
	'modules/core/src/SongModel',
	'utils/UserLog',
	'utils/NoteUtils',
	'pubsub',
	'text!modules/NoteEdition/src/NoteEditionTemplate.html',
], function(Mustache, SongModel, UserLog, NoteUtils, pubsub, NoteEditionTemplate) {

	function NoteEditionView(imgPath) {
		this.el = undefined;
		this.imgPath = imgPath;
		this.initSubscribe();
		this.initController();
	}

	NoteEditionView.prototype.render = function(parentHTML, callback) {
		//if (typeof this.el === "undefined" || (typeof this.el !== "undefined" && force === true)) {
		var rendered = Mustache.render(NoteEditionTemplate, {'imgPath': this.imgPath});
		if (typeof parentHTML !== "undefined") {
			parentHTML.innerHTML = rendered;
		}
		this.el = rendered;
		
		//$.publish('NoteEditionView-render');
		if (typeof callback === "function") {
			callback();
		}
		return;
		//}
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
			$.publish('NoteEditionView-addAccidental', {
				'acc': 'b',
				'double': true
			});
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
			$.publish('NoteEditionView-addAccidental', {
				'acc': '#',
				'double': true
			});
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
			$.publish('NoteEditionView-setSilence'); // in our editor we want to replace note by silence and not delete note
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
		var fn;
		$.subscribe('updown-arrows', function(el,inc){
			fn = 'setPitch';
			$.publish('NoteEditionView', [fn, inc]);
		});
		$.subscribe('pitch-letter-key', function(el,key){
			fn = 'setPitch';
			$.publish('NoteEditionView', [fn, key]);
		});
		$.subscribe('accidental-key', function(el,acc){
			fn = 'addAccidental';
			$.publish('NoteEditionView', [fn, [acc, false]]);
		});
		$.subscribe('shift-accidental-key', function(el,acc){
			fn = 'addAccidental';
			$.publish('NoteEditionView', [fn, [acc, true]]);
		});
		$.subscribe('number-key', function(el,key){
			fn = 'setCurrDuration';
			$.publish('NoteEditionView', [fn, key]);
		});
		$.subscribe('dot-key', function(el,inc){
			fn = 'setDot';
			$.publish('NoteEditionView', [fn, inc]);
		});
		$.subscribe('shift-t-key', function(el){
			fn = 'setTuplet';
			$.publish('NoteEditionView', fn);
		});
		$.subscribe('t-key', function(el){
			fn = 'setTie';
			$.publish('NoteEditionView', fn);
		});
		$.subscribe('R-key', function(el){
			fn = 'setSilence';
			$.publish('NoteEditionView', fn);
		});
		$.subscribe('supr-key', function(el){
			fn = 'setSilence';
			$.publish('NoteEditionView', fn);
		});
		$.subscribe('enter-key', function(el){
			fn = 'addNote';
			$.publish('NoteEditionView', fn);
		});
		$.subscribe('ctrl-c-key', function(el){
			fn = 'copyNotes';
			$.publish('NoteEditionView', fn);
		});	
		$.subscribe('ctrl-v-key', function(el){
			fn = 'pasteNotes';
			$.publish('NoteEditionView', fn);
		});
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