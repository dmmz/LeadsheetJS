define([
	'mustache',
	'modules/core/src/SongBarsIterator',
	'utils/UserLog',
	'jquery',
	'pubsub',
], function(Mustache, SongBarsIterator, UserLog, $, pubsub) {
	/**
	 * ChordEditionController manages all chords edition function
	 * @exports ChordEdition/ChordEditionController
	 */
	function ChordEditionController(songModel, cursor, chordSpaceMng) {
		if (!songModel || !cursor || !chordSpaceMng) {
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
		// console.log('deleteChords');
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
			if (r.exact) {
				chordMng.removeChordByIndex(r.index);
			}
		}
		for (var i = this.cursor.getStart(); i <= this.cursor.getEnd(); i++) {
			removeChordIfExists(i);
		}
		$.publish('ToHistory-add', 'Remove chord');
	};

	/*ChordEditionController.prototype.addChord = function() {
		console.log('addChord');
		// editor.addChord();
	};*/
	ChordEditionController.prototype.toggleEditChord = function() {
		console.log('toggleEditChord');
	};

	ChordEditionController.prototype.copyChords = function() {
		this.buffer = this.getSelectedChordsBeats();
		//this.buffer now equals to [startBeat, endBeat]
	};

	ChordEditionController.prototype.pasteChords = function() {
		if (!this.buffer || this.buffer.length === 0) {
			return;
		}
		var chordMng = this.songModel.getComponent('chords');
		var arrBeatChords = chordMng.getBeatsBasedChordIndexes(this.songModel);
		var indexesBeats = chordMng.getChordsRelativeToBeat(this.songModel,this.buffer[0], this.buffer[1], arrBeatChords);
		// indexesBeat is an array of objects {index: 1, beat: 2} (with the index of the chord, and the beat differents to start beat of selected sections)

		if (indexesBeats.length === 0){
			//no chords selected
			return;
		}

		var pos1 = indexesBeats[0].index;
		var pos2 = indexesBeats[indexesBeats.length - 1].index;

		var copiedChords = chordMng.cloneElems(pos1, pos2 + 1);
		var startPasteBeat = this.getSelectedChordsBeats()[0];
		var endPasteBeat = startPasteBeat + this.buffer[1] - this.buffer[0] - 1;

		// remove chords in affected chordspaces
		var firstChordSpace = chordMng.getBarNumAndBeatFromBeat(this.songModel,startPasteBeat);
		var lastChordSpace = chordMng.getBarNumAndBeatFromBeat(this.songModel,endPasteBeat);
		chordMng.removeChordsBetweenPositions(firstChordSpace.barNumber, firstChordSpace.beatNumber, lastChordSpace.barNumber, lastChordSpace.beatNumber);

		//we copy chords
		var pasteBeat, numBarAndBeat, barNumAndBeat;
		for (var i = 0; i < indexesBeats.length; i++) {
			pasteBeat = indexesBeats[i].beat + startPasteBeat;
			barNumAndBeat = chordMng.getBarNumAndBeatFromBeat(this.songModel,pasteBeat);
			if (!barNumAndBeat.notExactBeat){
				copiedChords[i].setBarNumber(barNumAndBeat.barNumber);
				copiedChords[i].setBeat(barNumAndBeat.beatNumber);
				chordMng.addChord(copiedChords[i]);
			}
		}
		
		var ch, str;
		for (var i = 0; i < chordMng.getChords().length; i++) {
			ch = chordMng.getChords()[i]
			str=ch.toString()+" "+ch.getBarNumber()+ " ..  " +ch.getBeat() ;
		}
		
		$.publish('ToHistory-add', 'Paste chord');
	};

	/*ChordEditionController.prototype.chordTabEvent = function(way) {
		console.log('chordTabEvent', way);
	};*/

	/**
	 * returns start and end beats of chords taking into account cursor, depending on chordSpaces selected
	 * @return {Array} [startBeat, endBeat]
	 */
	ChordEditionController.prototype.getSelectedChordsBeats = function() {
		var songIt = new SongBarsIterator(this.songModel);
		var startChordSpace = this.chordSpaceMng.chordSpace[this.cursor.getStart()];
		var startBarNum = startChordSpace.barNumber;

		songIt.setBarIndex(startBarNum);
		var beatInc = 4 / songIt.getBarTimeSignature().getBeatUnit(); //will be 1 for x/4 time signatures, 2 for x/2, and 0.5 for x/8
		var barBeatOffset = (startChordSpace.beatNumber - 1) * beatInc;
		var startBeat = this.songModel.getStartBeatFromBarNumber(startBarNum) + barBeatOffset;
		var iBeat = startBeat;

		for (var i = this.cursor.getStart(); i <= this.cursor.getEnd(); i++) {
			if (barBeatOffset === songIt.getBarTimeSignature().getQuarterBeats() && songIt.hasNext()) {
				songIt.next();
				beatInc = 4 / songIt.getBarTimeSignature().getBeatUnit();
				barBeatOffset = 0;
			} else if (barBeatOffset > songIt.getBarTimeSignature().getQuarterBeats()) {
				console.warn("barBeatOffset > total bar duration"); //should never enter here
			}
			iBeat += beatInc;
			barBeatOffset += beatInc;
		}
		return [startBeat, iBeat];
	};

	ChordEditionController.prototype.getSelectedChordsIndexes = function() {
		var chordManager = this.songModel.getComponent('chords');
		var selectedChords = [];
		for (var cursorIndex = this.cursor.getStart(); cursorIndex <= this.cursor.getEnd(); cursorIndex++) {
			var chordSpace = this.chordSpaceMng.chordSpace[cursorIndex];
			var pos = {
				numBeat: chordSpace.beatNumber,
				numBar: chordSpace.barNumber
			};
			var r = chordManager.getChordIndexByPosition(pos);
			if (r.exact) {
				selectedChords.push(r.index);
			}
		}
		return selectedChords;
	};

	return ChordEditionController;
});