define([
	'mustache',
	'modules/core/src/SongModel',
	'utils/UserLog',
	'pubsub',
], function(Mustache, SongModel, UserLog, pubsub) {

	function NoteEditionController(model, view) {
		this.model = model || new SongModel();
		this.view = view;
		this.initSubscribe();
	}

	/**
	 * Subscribe to view events
	 */
	NoteEditionController.prototype.initSubscribe = function() {
		var self = this;
		$.subscribe('NoteEditionView-setCurrKey', function(el, decal) {
			self.setCurrKey(decal);
		});
		$.subscribe('NoteEditionView-addAccidental', function(el, accidental) {
			self.addAccidental();
		});
		$.subscribe('NoteEditionView-setCurrDuration', function(el, duration) {
			self.setCurrDuration();
		});
		$.subscribe('NoteEditionView-setDot', function(el) {
			self.setDot();
		});
		$.subscribe('NoteEditionView-setTie', function(el) {
			self.setTie();
		});
		$.subscribe('NoteEditionView-setTuplet', function(el) {
			self.setTuplet();
		});
		$.subscribe('NoteEditionView-setSilence', function(el) {
			self.setSilence();
		});
		$.subscribe('NoteEditionView-deleteNote', function(el) {
			self.deleteNote();
		});
		$.subscribe('NoteEditionView-addNote', function(el) {
			self.addNote();
		});
		$.subscribe('NoteEditionView-copyNotes', function(el) {
			self.copyNotes();
		});
		$.subscribe('NoteEditionView-pasteNotes', function(el) {
			self.pasteNotes();
		});
	};

	NoteEditionController.prototype.setCurrKey = function(decal) {
		console.log('setCurrKey');
	};
	NoteEditionController.prototype.addAccidental = function(accidental) {
		console.log('addAccidental');
	};
	NoteEditionController.prototype.setCurrDuration = function(duration) {
		console.log('setCurrDuration');
	};
	NoteEditionController.prototype.setDot = function() {
		console.log('setDot');
	};
	NoteEditionController.prototype.setTie = function() {
		console.log('setTie');
	};
	NoteEditionController.prototype.setTuplet = function() {
		console.log('setTuplet');
	};
	NoteEditionController.prototype.setSilence = function() {
		console.log('setSilence');
	};
	NoteEditionController.prototype.deleteNote = function() {
		console.log('deleteNote');
	};
	NoteEditionController.prototype.addNote = function() {
		console.log('addNote');
	};
	NoteEditionController.prototype.copyNotes = function() {
		console.log('copyNotes');
	};
	NoteEditionController.prototype.pasteNotes = function() {
		console.log('pasteNotes');
	};


	return NoteEditionController;
});
