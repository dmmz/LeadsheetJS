define([
	'mustache',
	'modules/core/src/SongModel',
	'modules/Cursor/src/CursorModel',
	'utils/UserLog',
	'jquery',
	'pubsub',
], function(Mustache, CursorModel, SongModel, UserLog, $, pubsub) {

	function ChordEditionController(songModel, cursor, chordSpaceMng) {
		if (!songModel || !cursor || !chordSpaceMng){
			throw "ChordEditionController params are wrong";
		}
		this.songModel = songModel;
		this.cursor = cursor;
		this.chordSpaceMng = chordSpaceMng;
		this.initSubscribe();
	}

	/**
	 * Subscribe to view events
	 */
	ChordEditionController.prototype.initSubscribe = function() {
		var self = this;
		
		$.subscribe('ChordEditionView', function(el, fn, param) {

			if (self.chordSpaceMng.isEnabled()) {
				self[fn].call(self, param);
				$.publish('ToViewer-draw', self.songModel);
			}
		});
	};

	ChordEditionController.prototype.deleteChords = function() {
		/**
		 * @param  {positon} argument 
		 * @return {Object}          position as {numBar: valBar, numBeat: valBeat}
		 */
		
		var chordMng = this.songModel.getComponent('chords');
		var self = this;
		function removeChordIfExists(cursorIndex) {
			
			var chordSpace = self.chordSpaceMng.chordSpace[cursorIndex];
			var pos = {
				numBeat: chordSpace.beatNumber,
				numBar: chordSpace.barNumber
			};
			var r = chordMng.getChordIndexByPosition(pos);
			if (r.exact){
				chordMng.removeChordByIndex(r.index);
			}
		}
		for (var i = this.cursor.getStart(); i <= this.cursor.getEnd(); i++) {
			removeChordIfExists(i);		
		}
		
	};
	/*ChordEditionController.prototype.addChord = function() {
		console.log('addChord');
		// editor.addChord();
	};*/
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

	return ChordEditionController;
});