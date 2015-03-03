define([
	'mustache',
	'modules/core/src/SongModel',
	'modules/Cursor/src/CursorModel',
	'utils/UserLog',
	'pubsub',
], function(Mustache, CursorModel, SongModel, UserLog, pubsub) {

	function ChordEditionController(songModel, cursor, view) {
		this.songModel = songModel || new SongModel();
		this.cursor = cursor || new CursorModel();
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
		/*$.subscribe('ChordEditionView-chordTabEvent', function(el, way) {
			self.chordTabEvent(way);
		});*/
		$.subscribe('ChordEditionView-activeView', function(el) {
			self.changeEditMode(true);
			myApp.viewer.draw(self.songModel);
		});
		$.subscribe('ChordEditionView-unactiveView', function(el) {
			self.changeEditMode(false);
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
	/*ChordEditionController.prototype.chordTabEvent = function(way) {
		console.log('chordTabEvent', way);
	};*/

	ChordEditionController.prototype.getSelectedChords = function() {
		var chordManager = this.songModel.getComponent('chords');
		var selectedChords = chordManager.getChords(this.cursor.getStart(), this.cursor.getEnd() + 1);
		return selectedChords;
	};

	ChordEditionController.prototype.changeEditMode = function(isEditable) {
		this.cursor.setEditable(isEditable);
	};

	return ChordEditionController;
});