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
		// editor.interactor.run('setCurrKey', 1);
		// editor.interactor.run('setCurrKey', -1);
		// editor.interactor.run('setCurrKey', 'B');
	};
	NoteEditionController.prototype.addAccidental = function(accidental) {
		console.log('addAccidental');
		// editor.interactor.run('addAccidental', 'b');
		// editor.interactor.run('addAccidental', 'n');
		// editor.interactor.run('addAccidental', '#');
	};
	NoteEditionController.prototype.setCurrDuration = function(duration) {
		console.log('setCurrDuration');
		// editor.interactor.run('setCurrDuration', 7);
		// editor.interactor.run('setCurrDuration', 6);
		// editor.interactor.run('setCurrDuration', 5);
		// editor.interactor.run('setCurrDuration', 4);
		// editor.interactor.run('setCurrDuration', 3);
		// editor.interactor.run('setCurrDuration', 2);
		// editor.interactor.run('setCurrDuration', 1);
	};
	NoteEditionController.prototype.setDot = function() {
		console.log('setDot');
		// editor.interactor.run('setDot', '', true);
	};
	NoteEditionController.prototype.setTie = function() {
		console.log('setTie');
		// editor.interactor.run('setTie');
	};
	NoteEditionController.prototype.setTuplet = function() {
		console.log('setTuplet');
		// editor.interactor.run('setTuplet', '', true);
	};
	NoteEditionController.prototype.setSilence = function() {
		console.log('setSilence');
		// editor.interactor.run('setSilence', '');
	};
	NoteEditionController.prototype.deleteNote = function() {
		console.log('deleteNote');
		// editor.interactor.run('deleteNote', '', true);
	};
	NoteEditionController.prototype.addNote = function() {
		console.log('addNote');
		// editor.interactor.run('addNote', '', true);
	};
	NoteEditionController.prototype.copyNotes = function() {
		console.log('copyNotes');
		// editor.interactor.run("copyNotes");
	};
	NoteEditionController.prototype.pasteNotes = function() {
		console.log('pasteNotes');
		// editor.interactor.run("pasteNotes",'', true);
	};


	return NoteEditionController;
});
