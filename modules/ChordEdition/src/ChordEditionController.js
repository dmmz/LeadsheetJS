define([
	'mustache',
	'modules/core/src/SongModel',
	'utils/UserLog',
	'pubsub',
], function(Mustache, SongModel, UserLog, pubsub) {

	function ChordEditionController(model, view) {
		this.model = model || new SongModel();
		this.view = view;
		this.initSubscribe();
	}

	/**
	 * Subscribe to view events
	 */
	ChordEditionController.prototype.initSubscribe = function() {
		var self = this;
		$.subscribe('ChordEditionView-toggleChordVisibility', function(el) {
			self.toggleChordVisibility();
		});
		$.subscribe('ChordEditionView-deleteChord', function(el) {
			self.deleteChord();
		});
		$.subscribe('ChordEditionView-addChord', function(el) {
			self.addChord();
		});
		$.subscribe('ChordEditionView-toggleEditChord', function(el) {
			self.toggleEditChord();
		});
		$.subscribe('ChordEditionView-copyChords', function(el) {
			self.copyChords();
		});
		$.subscribe('ChordEditionView-pasteChords', function(el) {
			self.pasteChords();
		});
		$.subscribe('ChordEditionView-chordTabEvent', function(el, way) {
			self.chordTabEvent(way);
		});
	};

	
	ChordEditionController.prototype.toggleChordVisibility = function() {
		console.log('toggleChordVisibility');
		// editor.toggleChordVisibility();
	};
	ChordEditionController.prototype.deleteChord = function() {
		console.log('deleteChord');
		// editor.deleteChord();
	};
	ChordEditionController.prototype.addChord = function() {
		console.log('addChord');
		// editor.addChord();
	};
	ChordEditionController.prototype.toggleEditChord = function() {
		console.log('toggleEditChord');
	};
	ChordEditionController.prototype.copyChords = function() {
		console.log('copyChords');
		// self.run("copyChords");
	};
	ChordEditionController.prototype.pasteChords = function() {
		console.log('pasteChords');
		// self.run("pasteChords",'', true);
	};
	ChordEditionController.prototype.chordTabEvent = function(way) {
		console.log('chordTabEvent', way);
	};

	return ChordEditionController;
});