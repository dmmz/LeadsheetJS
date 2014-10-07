var ChordManagerModel=function(option, chords, cursorChord) {
	this.chords = chords? chords: []; // array of chordModel
	this.cursorChord = cursorChord? cursorChord: [0,0]; // array that represent which chords are selected [startIndex, endIndex]
	this.classSelectedName = 'editableChords';
	this.canvasId = 'canvas_container';
	this.isEditing = false;
	/*this.showSelection = true;*/
	this.scoreEditor = option.scoreEditor;
	this.songModel = option.songModel;
	this.buffer = []; // use for copy paste
};

//Interface functions (this functions are also in NoteManagerModel  )
//@interface
ChordManagerModel.prototype.getTotal = function() {
	return this.chords.length;
};
/**
 * @interface
 * @param  {integer} start 
 * @param  {integer} end   
 * @return {Array}       
 */		
ChordManagerModel.prototype.getBeatIntervalByIndexes = function(start, end) {
	var song = this.songModel;
	var startChord = this.getChord(start);
	var endChord = this.getChord(end);
	var startBeat = song.getBeatsBeforeBarNumber(startChord.getBarNumber())+startChord.getBeat();
	var endBeat = song.getBeatsBeforeBarNumber(endChord.getBarNumber()) + 1 + song.getBeatsFromTimeSignatureAt(endChord.getBarNumber());
	return [startBeat, endBeat];
};

/**
 * @interface
 * 
 * returns a copy of the notes from, pos1, to pos2.
 * @param  {Integer} pos1 
 * @param  {Integer} pos2 
 * @param  {String} type : if "model" returns notes as copies of NoteMode Prototype, if "struct" it returns it in 'struct' fromat
 * @return {[type]}      [description]
 */
ChordManagerModel.prototype.cloneElems = function(pos1,pos2,type) {
	type = type || "model";
	var newChords=[];
	var note;
	var chordsToClone=this.getChords(pos1,pos2);
	
	chordsToClone.forEach(function(chord){
		var cChord;
		if (type == "struct")
			cChord=chord.toChordStruct();
		else
			cChord=chord.clone();
		
		newChords.push(cChord);
	});
	return newChords;
};

/**
 * returns index of chords by beat interval without including the last beat (just like in notes). 
 * E.g.: in a 4/4 song, with one chord per bar,  getIndexesByBeatInterval(1,5) would return [0,0]
 * @param  {Number} startBeat 
 * @param  {Number} endBeat   
 * @return {Array}           [indexStart, indexEnd]
 */
ChordManagerModel.prototype.getIndexesByBeatInterval = function(startBeat, endBeat) {
	var song = this.songModel;
	var pos1 = song.getPositionFromBeat(startBeat);
	var pos2 = song.getPositionFromBeat(endBeat);
	var index1 = this.getChordIndexByPosition(pos1,true);
	var index2 = this.getChordIndexByPosition(pos2);
	if (index2.exact) index2.index--;
	return [index1.index, index2.index];

};
/**
 * used on suggestion, to save suggestion changes, we save the number of measure, so we call chord.exportToMusicCSLJSON(true)
 * @param  {Integer} from 
 * @param  {Integer} to   
 * @return {Array}      array of chords (with barNumber)
 */
ChordManagerModel.prototype.getElemsToMusicCSLJSON = function(from, to) {
	var chords = [];
	this.getChords(from,to + 1).forEach(function(chord){
		chords.push(chord.exportToMusicCSLJSON(true));
	});
	return chords;
};

ChordManagerModel.prototype.getCanvasId = function() {
	return this.canvasId;
}

ChordManagerModel.prototype.drawAllChords = function(context, option) {
	if (typeof context !== "undefined"){
		var visibleChords = this.getVisibleChords();
		for(var i = 0, c = visibleChords.length; i < c; i++) {
			visibleChords[ i ].draw(context, option);
		}
	}
}


ChordManagerModel.prototype.getScoreEditor = function() {
	return this.scoreEditor;
}

// alias
ChordManagerModel.prototype.setScoreEditor = function(scoreEditor) {
	if(typeof scoreEditor !== "undefined" && scoreEditor instanceof ScoreEditor){
		this.scoreEditor = scoreEditor;
	}
}

ChordManagerModel.prototype.getChords = function(from, to) {
	return this.chords.slice(from, to);
};

ChordManagerModel.prototype.isEmpty = function() {
	return this.chords.length==0;
};

ChordManagerModel.prototype.setAllChords = function( chords ) {
	if(typeof chords !== "undefined"){
		this.chords = chords;
		return true;
	}
	return false;
}

ChordManagerModel.prototype.getChord = function( index ) {
	if(typeof index !== "undefined" && !isNaN(index)){
		if(this.chords[ index ]){
			return this.chords[ index ];
		}
	}
	return undefined;
}


ChordManagerModel.prototype.getChordIndex = function( chord ) {
	if(typeof chord !== "undefined" && chord instanceof ChordModel){
		for (var i = 0; i < this.chords.length; i++) {
			if(JSON.stringify(this.getChord(i)) === JSON.stringify(chord)) {
				return i;
			}
		}
	}
	return undefined;
}
/**
 * returns next position for a given chord. It's based on a 2 chords per bar grid. 
 * Searches next position in this grid. If it's already filled, does nothing
 * @param  {boolean}		jump (if not defined, jumps by half bars, if true, jumps by bar)
 * @param  {ChordModel}		chord from which we want to get next position
 * @return {Object, null or string}  		Object: two fields: numBar, and numBeat
 *                       					null when next
 */

ChordManagerModel.prototype.getNextPositionForNewChord = function(chord, jumpWholeBar) 
{

	var indexSelectedChord = this.getChordIndex(chord);
	var isLastChord=(indexSelectedChord==this.chords.length-1)
	var nextChord=(isLastChord) ? null : this.getChord(indexSelectedChord+1);

	var isInLastBar=(chord.getBarNumber()==this.songModel.getTotalNumberOfBars()-1);
	
	var timeSig = this.songModel.getTimeSignatureAt(chord.getBarNumber());
	var numBeatsOnTimeSig = this.songModel.getBeatsFromTimeSignature(timeSig);
	var beatOnSecondHalfOfBar=Math.ceil(numBeatsOnTimeSig/2)+1;

	//chord is in 1st half, we create it in 2nd half of same Bar, if empty
	if (chord.getBeat()<beatOnSecondHalfOfBar && !jumpWholeBar){
		
		if (isLastChord || nextChord.getBarNumber()!=chord.getBarNumber()){
			return {
				numBar: chord.getBarNumber(),
				numBeat: beatOnSecondHalfOfBar
			};
		}
	}//chord is in 2nd half, we create it in 1st beat of following bar
	else if((isLastChord || chord.getBarNumber()+1 < nextChord.getBarNumber()) && !isInLastBar){
		return {
			numBar: chord.getBarNumber()+1,
			numBeat: 1
		};
	}
	else if (isLastChord || isInLastBar){
		return null;
	}
	//if next position is filled or we are in the end, return null
	return "filled";
};

ChordManagerModel.prototype.insertChord = function( index, chord ) {
	if(typeof index !== "undefined" && !isNaN(index) ) {
		if(typeof chord === "undefined" || !(chord instanceof ChordModel)) {
			var chord = new ChordModel;
		}
		this.chords.splice(index, 0, chord);
		return true;
	}
	return false;
}

/**
 * Return the duration of a chord in the number of beat
 * @param  {[int]} index of chord in this.chords
 * @return {[int]} number of beat the chord last
 */
ChordManagerModel.prototype.getChordDuration = function( index ) {
	if(typeof index !== "undefined" && !isNaN(index) ) {
		if(typeof this.chords[ index ] !== "undefined"){
			var currentBn = this.chords[ index ].getBarNumber();
			var currentBeat = this.chords[ index ].getBeat();
			var beats = this.songModel.getBeatsFromTimeSignature(this.songModel.getTimeSignatureAt(currentBn));
			if(typeof this.chords[ index + 1 ] !== "undefined"){
				var nextBn = this.chords[ index + 1 ].getBarNumber();
				var nextBeat = this.chords[ index + 1 ].getBeat();
			}
			else{
				/*var nextChord = 0; // case last chords, we set next to the end*/
				var nextBn = currentBn + 1;
				var nextBeat = 1;
			}
			var duration = 0;
			if(nextBn === currentBn){ // if chord are on the same bar
				duration = nextBeat - currentBeat;
			}
			else if(nextBn > currentBn){
				duration =  beats * (nextBn - currentBn) + nextBeat - currentBeat;
			}

			return duration; 
		}
	}
	return false;
}

ChordManagerModel.prototype.setChord = function( index, chord ) {
	if(typeof chord !== "undefined" && chord instanceof ChordModel && typeof index !== "undefined" && !isNaN(index) ) {
		this.chords[ index ] = chord;
		return true;
	}
	return false;
}

ChordManagerModel.prototype.getChordsByBeat = function( beat ) {
	var chordsByBeat = [];
	if(typeof beat !== "undefined" && !isNaN(beat)){
		var currentChord;
		for(var i = 0, c = this.chords.length; i < c; i++) {
			currentChord = this.chords[ i ];
			if(currentChord.getBeat() === beat) {
				chordsByBeat.push(currentChord);
			}
		}
	}
	return chordsByBeat;
}

ChordManagerModel.prototype.getChordsByBarNumber = function( barNumber ) {
	var chordsByBarNumber = [];
	if(typeof barNumber !== "undefined" && !isNaN(barNumber)){
		var currentChord;
		for(var i = 0, c = this.chords.length; i < c; i++) {
			currentChord = this.chords[ i ];
			if(currentChord.getBarNumber() === barNumber) {
				chordsByBarNumber.push(currentChord);
			}
		}
	}
	return chordsByBarNumber;
};
/**
 * returns the index of the chord in the demanded position. If there is no chord with that exact position , it returns the closest previous one (or the following one, depending on 'next' param)
 * returns also if it found the exact one or not
 * @param  {Object} pos {	numBar: valNumBar,
 *                      	numBeat: valNumBeat}
 * @param  {boolean} next 	if true, when there is no chord found at the exact position we get the next one, if false or undefined, we get the previous one
 * @return {Object}     {
 *         					index: number
 *         					exact: boolean
 *         					}
 */
ChordManagerModel.prototype.getChordIndexByPosition = function(pos, next) 
{
	function equalPosition (pos,chord) {
		return pos.numBar == chord.getBarNumber() && pos.numBeat == chord.getBeat();
	}
	//greater than
	function posGtChordPos(pos,chord){
		return pos.numBar > chord.getBarNumber() || (pos.numBar == chord.getBarNumber() && pos.numBeat > chord.getBeat());	
	}
	//less than
	function posLtChordPos(pos,chord){
		return pos.numBar < chord.getBarNumber() || (pos.numBar == chord.getBarNumber() && pos.numBeat < chord.getBeat());	
	}
	
	var chords = this.getChords();
	var r;
	for (var i = 0; i < chords.length; i++) 
	{
		if (equalPosition(pos,chords[i])){
			r = "equal";
			break;
		}
		else if(posGtChordPos(pos,chords[i])){
			if (i+1==chords.length || posLtChordPos(pos,chords[i+1])){
				r = "greater";
				break;
			}
		} 
	}
	if (next && r != "equal") i++;
	return {index:i, exact: r == "equal"};		
};

ChordManagerModel.prototype.getStartTimeFromBarNumber = function( barNumber ) {
	var duration, currentTime = 0;
	if(typeof this.chords !== "undefined" && typeof barNumber !== "undefined" && !isNaN(barNumber)){
		for (var i = 0; i < this.chords.length; i++) {
			if(this.chords[ i ].getBarNumber() == barNumber){
				return currentTime;
			}
			duration = this.getChordDuration(i);
			currentTime += duration;
		}
	}
}


ChordManagerModel.prototype.getDurationFromBarNumber = function( barNumber ) {
	var duration = 0;
	if(typeof this.chords !== "undefined" && typeof barNumber !== "undefined" && !isNaN(barNumber)){
		var bar = this.getChordsByBarNumber( barNumber );
		for (var i = 0, c = bar.length; i < c; i++) {
			duration += this.getChordDuration(this.getChordIndex(bar[ i ]));
		}
	}
	return duration;
}

ChordManagerModel.prototype.addChord = function( chord ) {
	if(typeof chord !== "undefined" && chord instanceof ChordModel) {
		this.chords.push(chord);
		return true;
	}
	else{
		this.chords.push( new ChordModel );
		return true;
	}
	return false;
}

ChordManagerModel.prototype.removeChord = function( chord ) {
	var chordIndex = this.getChordIndex( chord );
	this.removeChordByIndex(chordIndex);
};


ChordManagerModel.prototype.removeChordByIndex = function( index ) {
	if(typeof index !== "undefined" && !isNaN(index)){
		if(this.chords[ index ]){
			var deletedChords = this.chords.splice(index, 1);
			delete deletedChords;
			// TODO, recalculate duration of previous chord
			return true;
		}
		else{
			console.info('ChordManagerModel.prototype.getChord - Trying to remove index which not exist');
		}
	}
	return false;
};


/*ChordManagerModel.prototype.getCursorChord = function( index ) {
	if(!isNaN(index)){
		if(index === 0){
			return this.cursorChord[ 0 ];
		}
		if(index === 1){
			return this.cursorChord[ 1 ];
		}
	}
	return this.cursorChord;
}


ChordManagerModel.prototype.setCursorChord = function( indexStart, indexEnd ) {
	if(typeof indexStart !== "undefined" && !isNaN(indexStart)){
		if(indexStart < 0){
			indexStart = 0;
		}
		if(indexStart >= this.chords.length){
			indexStart = this.chords.length - 1;
		}
		this.cursorChord[ 0 ] = indexStart;
		// if indexEnd is not define, then we set it equal to indexstart
		if(typeof indexEnd !== "undefined" && !isNaN(indexEnd)){
			if(indexEnd < 0){
				indexEnd = 0;
			}
			if(indexEnd >= this.chords.length){
				indexEnd = this.chords.length - 1;
			}
			this.cursorChord[ 1 ] = indexEnd;
		}
		else{
			this.cursorChord[ 1 ] = indexStart;
		}
		this.updateSelectedChords();
		return true;
	}
	this.cursorChord=[];
	return false;
}

ChordManagerModel.prototype.moveCursorChord = function( inc ) {
	var side = (inc>0) ? 1 : 0;
	var pos = this.getCursorChord(side);
	var newPos = pos + inc;

	if (newPos>=0 && newPos<this.chords.length){ 
		pos=newPos;
	}
	this.setCursorChord(pos);
}

ChordManagerModel.prototype.expandCursorChord = function( inc ) {
	if (this.getCursorChord(1)==this.getCursorChord(0)){
		this.sideSel= (inc>0) ? 1 : 0;
	}
	var cursorTmp = this.cursorChord.slice(0);
	var newPos = this.getCursorChord(this.sideSel) + inc;
	if (newPos>=0 && newPos<this.chords.length){
		cursorTmp[this.sideSel]=newPos;
	}
	this.setCursorChord(cursorTmp[ 0 ], cursorTmp[ 1 ]);
}*/
/*
ChordManagerModel.prototype.updateSelectedChords = function() {
	this.unSelectAllChords();
	for(var i = this.cursorChord[ 0 ]; i <= this.cursorChord[ 1 ]; i++) {
		this.chords[ i ].select();
	}
	if(this.getIsEditing() ){
		this.editSelectedChords(this.canvasId, this.scoreEditor.viewer.getScale());
	}
}
*/
/*ChordManagerModel.prototype.unSelectAllChords = function() {
	for (var i = 0, c = this.chords.length; i < c; i++) {
		this.chords[ i ].unselect();
	}
}*/

ChordManagerModel.prototype.getVisibleChords = function() {
	var visibleChords = [];
	for(var i = 0, c = this.chords.length; i < c; i++) {
		if(typeof this.chords[ i ] !== "undefined"){
			var currentChord = this.chords[ i ];
			if(currentChord.isVisible()) {
				visibleChords.push(currentChord);
			}
		}
	}
	return visibleChords;
}

// ChordManagerModel.prototype.getSelectedChords = function() {
// 	var selectedChords = [];
// 	for(var i = this.cursorChord[ 0 ]; i <= this.cursorChord[ 1 ]; i++) {
// 		if(typeof this.chords[ i ] !== "undefined"){
// 			var currentChord = this.chords[ i ];
// 			if(currentChord.isSelected()) {
// 				selectedChords.push(currentChord);
// 			}
// 		}
// 	}
// 	return selectedChords;
// }

/**
 * Return the index of numberOfChords chords before and after the selected chords
 * @param  {[type]} numberOfChords [description]
 * @return {[type]}                 [description]
 */
ChordManagerModel.prototype.getContextOfSelectedChords = function( cursor, numberOfChords ) {
	var leftContext = [];
	var rightContext = [];
	for (var i = 1; i <= numberOfChords; i++) {
		if(cursor.getStart() - i >= 0){
			leftContext.push(cursor.getStart() - i);
		}
		if(cursor.getEnd() + i < this.chords.length){
			rightContext.push(cursor.getEnd() + i);
		}
	}
	return [leftContext, rightContext];
}
//NOT USED
ChordManagerModel.prototype.copyChords = function() {
	this.buffer = this.getSelectedChords();
}
/*
	Params:
		arr1: array to which insert another array2
		cursor: array with start (cursor[0]) and end (cursor[1]) positions to override with new array2 
		arr2: array2 to be inserted
	returns resulting array
*/
ChordManagerModel.prototype.arraySplice = function(arr1,cursor,arr2) {
	var part1=arr1.slice(0,cursor[0]);
	var part2=arr1.slice(cursor[1]+1,arr1.length);	//selected chords are removed
	return part1.concat(arr2,part2);
}
ChordManagerModel.prototype.pasteChords = function(cursor, buffer) {
	buffer = buffer || this.buffer;
	this.chords = this.arraySplice(this.chords, cursor, buffer);
	//this.cursorChord[ 1 ] = this.cursorChord[ 0 ] + this.buffer.length-1;
}

ChordManagerModel.prototype.getIsEditing = function() {
	return this.isEditing;
}
ChordManagerModel.prototype.setIsEditing = function( editing ) {
	if(typeof editing !== "undefined"){
		this.isEditing = editing;
		return true;
	}
	return false;
}

ChordManagerModel.prototype.toggleEditing = function() {
	if(this.isEditing === true){
		this.isEditing = false;
	}
	else{
		this.isEditing = true;
	}
	return this.isEditing;
}

ChordManagerModel.prototype.editLastSelectedChord = function( id_HTMLELement, scale, cursor ) {
	
	this.setIsEditing(true);
	var lastSelectedChord = this.getChord(cursor.getEnd());
	var offset = $("canvas#" + this.scoreEditor.id).offset();
	lastSelectedChord.editChord(id_HTMLELement, this.classSelectedName, offset, scale);
};

ChordManagerModel.prototype.getSelectedChordsDuration = function(cursor) {
	var selectedChords = this.getChords(cursor.getStart(),cursor.getEnd()+1);
	var duration = 0;
	for (var i = 0; i < selectedChords.length; i++) {
		duration += this.getChordDuration(this.getChordIndex(selectedChords[ i ]));
	}
	return duration;
};

ChordManagerModel.prototype.removeSelectedChords = function(cursor) {
	var selectedChords = this.getChords(cursor.getStart(),cursor.getEnd()+1);
	for(var i = 0, c = selectedChords.length; i < c; i++ ) {

		if (selectedChords[i].getBeat()==1 && selectedChords[i].getBarNumber()==0){
			cursor.setPos(0);
			console.warn("Can't delete first chord (just modify it)");
			continue;
		}
		if (this.chords.length == 1){
			cursor.setPos(0);
			console.warn("Only one chord left, can't delete it");
			return;
		}
		this.removeChord( selectedChords[ i ] );
	}
	if (this.chords.length <= cursor.getEnd())	
		cursor.increment(-1);

};

ChordManagerModel.prototype.hideAllChords = function() {
	var chords = this.getChords();
	for(var i = 0, c = chords.length; i < c; i++ ) {
		chords[ i ].hide();
	}
	this.scoreEditor.viewer.draw(this.scoreEditor);
}

ChordManagerModel.prototype.showAllChords = function() {
	var chords = this.getChords();
	for(var i = 0, c = chords.length; i < c; i++ ) {
		chords[ i ].show();
	}
	this.scoreEditor.viewer.draw(this.scoreEditor);
}
/**
 * @param  {Object}  area Object with porperties xi,xe,yi,ye
 * @return {Array}        [min,max]
 */
ChordManagerModel.prototype.findMinMaxChordsByCoords = function(coords) {
	var chord, min=null, max=null;

	for (var i in this.chords) {
		chord=this.chords[i];
		if (chord.isInPathArea(coords)){
			if (min==null)	min=Number(i);
			if (max==null || max<i)	max=Number(i);	
		}
	}
	return [min,max];
	
};
ChordManagerModel.prototype.isInPath = function( x, y ){
	if(typeof x !== "undefined" && !isNaN(x) && typeof y !== "undefined" && !isNaN(y)){
		var inPathChord = [];
		var currentChord;
		for(var i = 0, c = this.chords.length; i < c; i++) {
			currentChord = this.chords[ i ];
			if(currentChord.isVisible()) {
				if(currentChord.isInPath(x, y)){
					inPathChord.push(currentChord);
				}
			}
		}
		return inPathChord;
	}
}


ChordManagerModel.prototype.unfocusChord = function( cursor )
{
	
	if(typeof this.classSelectedName !== "undefined"){
		$('.' + this.classSelectedName).each(function(){
			$(this).remove();
		});
		$('.acResults').each(function(){
			$(this).remove();
		});
	}
	
	var chords = this.getChords(cursor.getStart(),cursor.getEnd()+1)

	if (chords.length == 1 && chords[0].getNote()==""){
		this.removeChordByIndex(cursor.getStart());
		cursor.increment(-1);
	}
	this.setIsEditing(false);
	
}


ChordManagerModel.prototype.tabEvent = function( inc ){
	this.moveCursorChord( inc );
}


ChordManagerModel.prototype.wheel = function( event, editor, cursor, delta){
	var chords = editor.getChordManager().getChords(cursor.getStart(),cursor.getEnd()+1);
	if(chords.length > 0){
		for (var i = 0; i < chords.length; i++) {
				chords[ i ].setPitchFromMidiAddition( delta );
		}
		var chordIndex = this.getChordIndex(chords[ 0 ]);
		this.getChord(chordIndex).playChord();
		event.preventDefault();
		var self = this;
		this.timeoutUpdate = window.setTimeout(function(){
			self.scoreEditor.update.call(self.scoreEditor);
		}, 1000);
		editor.viewer.draw( editor );
	}
}

ChordManagerModel.prototype.getMidiChord4Player = function( playerModel ) {
	var midiChord = [];
	var midiNotes = [];
	var currentTime = 0;
	var countReturn = 0;
	playerModel.playableSongModel.removeAllChord();

	if(typeof this.chords !== "undefined") {
		for (var i = 0; i < this.chords.length; i++) {
			duration = this.getChordDuration(i);
			midiChord[ i ] = new MidiSoundModel({
				"type" : "chord",
				"currentTime" : currentTime,
				"duration" : duration,
			});
			currentTime += duration;

			if(this.chords[ i ].getNote() === "%"){
				midiNotes = this.chords[ i-1 ].getAllMidiNotes();
			}
			else{
				midiNotes = this.chords[ i ].getAllMidiNotes();
			}
		};
	}
}

ChordManagerModel.prototype.importFromMusicCSLJSON = function( MusicCSLJSON ) {
	if(typeof MusicCSLJSON !== "undefined"){
		var chordsSection = [];
		var chordModel;
		var barNumber = 0;
		console.log(MusicCSLJSON);
		for (var i = 0; i < MusicCSLJSON.sections.length; i++) {
			if(typeof MusicCSLJSON.sections[ i ].chords !== "undefined"){
				if (MusicCSLJSON.sections[ i ].hasOwnProperty('chords')){
					chordsSection = Utils.clone(MusicCSLJSON.sections[ i ].chords);
				}
			}

			if (chordsSection) {
				console.log("yes chordSection");
				for (var j = 0; j < chordsSection.length; j++) {
					for (var k = 0; k < chordsSection[j].length; k++) {
						chordModel = new ChordModel();
						chordModel.importFromMusicCSLJSON(chordsSection[j][k])
						chordModel.setBarNumber(barNumber);
						this.addChord(chordModel);
					}
					barNumber++;
				}
			}
		}
	}
	return this;
}

ChordManagerModel.prototype.exportToMusicCSLJSON = function() {
	var chords = [];
	if(typeof this.chords !== "undefined" && this.chords.length){
		var currentChord, currentBn;
		for (var i = 0; i < this.chords.length; i++) {
			currentChord = this.getChord(i);
			currentBn = currentChord.getBarNumber();
			if(typeof chords[ currentBn ] === "undefined"){
				chords[ currentBn ] = [];
			}
			var existsBase=!$.isEmptyObject(currentChord.getBase());

			var jsonChord={
				"beat" : currentChord.getBeat(),
				"p" : currentChord.getNote(),
				"ch" : currentChord.getChordType(),
			};
			if (existsBase){
				jsonChord.bp=currentChord.getBase().getNote();
				jsonChord.bch=currentChord.getBase().getChordType();
			}
			if (currentChord.getParenthesis()){
				jsonChord.parenthesis=currentChord.getParenthesis();
			}
			chords[ currentBn ].push(jsonChord);
		}
	}
	return chords;
}

ChordManagerModel.prototype.getAllConstraints = function() {
	var constraints = [];
	if(typeof this.chords !== "undefined" && this.chords.length){
		var currentChord;
		var allConstraints = [];
		for (var i = 0, c = this.chords.length; i < c; i++) {
			currentChord = this.getChord(i);
			allConstraints = currentChord.getAllConstraints();
			for (var j = 0; j < allConstraints.length; j++) {
				constraints.push({
					position: i,
					type: allConstraints[j].type,
					values: allConstraints[j].values
				});
			}
		}
	}
	return constraints;
}

ChordManagerModel.prototype.getChordsSubstitution = function() {}