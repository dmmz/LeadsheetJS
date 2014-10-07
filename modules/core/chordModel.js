var ChordModel = function( chord ) {
	if(typeof chord === "undefined") {
		this.note = "";
		this.chordType = "";
		this.base = {}; // base is a chordModel which represent a base note
		this.parenthesis = false;
		this.beat = 1;
		this.barNumber = -1;
		this.position = {x: 10, y: 10, w: 100, h: 30};
		this.selected = false;
		this.visible = true;
		this.editable = true;
		this.constraints = []; // contain all types of constraints
	}
	else {
		this.note = chord.note? chord.note : "";
		this.chordType = chord.chordType? chord.chordType : "";
		this.base = chord.base? chord.base : {}; // base is a chordModel which represent a base note
		this.parenthesis = chord.parenthesis? chord.parenthesis : false;
		this.beat = chord.beat? chord.beat : 1;
		this.barNumber = chord.barNumber? chord.barNumber : -1;
		this.position = chord.position? chord.position : {x: 0, y: 0, w: 100, h: 30};
		this.selected = chord.selected? chord.selected : false;
		this.visible = chord.visible? chord.visible : true;
		this.editable = chord.editable? chord.editable : true;
		this.constraints = []; // contain all types of constraints
	}
	this.chordSymbols = this.setChordSymbols();
};


ChordModel.prototype.importFromMusicCSLJSON = function(JSONChord) {
	this.setNote(JSONChord.p);
	this.setChordType(JSONChord.ch);
	this.setParenthesis(JSONChord.parenthesis);
	this.setBeat(JSONChord.beat);
	if (JSONChord.hasOwnProperty('bp') && JSONChord.bp.length != 0 ) {
		chordModelBase = new ChordModel();
		chordModelBase.setNote(JSONChord.bp);
		chordModelBase.setChordType(JSONChord.bch);
		this.setBase(chordModelBase);
	}
	if (JSONChord.barNumber != null)
		this.barNumber = JSONChord.barNumber;
};



ChordModel.prototype.exportToMusicCSLJSON = function(withNumMeasure) {
	if (withNumMeasure === undefined) withNumMeasure = false;
	return this.toChordStruct(withNumMeasure);
};

ChordModel.prototype.toChordStruct = function(withNumMeasure) 
{
	if (withNumMeasure === undefined) withNumMeasure = false;
	var chord = {};
	chord.p = this.getNote();
	chord.ch = this.getChordType();
	if (this.getParenthesis())
		chord.parenthesis = this.getParenthesis();

	chord.beat = this.getBeat();

	if (this.getBase()){
		chordBase = this.getBase();
		chord.bp = chordBase.getNote();
		chord.bch = chordBase.getChordType();
	}
	if (withNumMeasure)	chord.barNumber = this.barNumber;
	return chord;
};


ChordModel.prototype.clone = function() {
	var chord = new ChordModel();
	chord.importFromMusicCSLJSON(this.toChordStruct(true));
	return chord;
};

/* Basic getter setter */
ChordModel.prototype.getNote = function() {
	return this.note;
};
ChordModel.prototype.setNote = function( note ) {
	if(typeof note !== "undefined"){
		this.note = note;
		this.allNotes = undefined;
		return true;
	}
	return false;
};

ChordModel.prototype.getChordType = function() {
	return this.chordType;
};

ChordModel.prototype.setChordType = function( chordType ) {
	if(typeof chordType !== "undefined"){
		this.chordType = chordType;
		this.allNotes = undefined;
		return true;
	}
	return false;
};

ChordModel.prototype.getBase = function() {
	function isEmpty (obj) {
		return Object.keys(obj).length === 0;
	}
	return (isEmpty(this.base)) ? false : this.base;
};

ChordModel.prototype.setBase = function( chordBase ) {
	if(typeof chordBase !== "undefined" && chordBase instanceof ChordModel){
		this.base = chordBase;
		this.allNotes = undefined;
		return true;
	}
	return false;
};

ChordModel.prototype.getParenthesis = function() {
	return this.parenthesis;
};
ChordModel.prototype.setParenthesis = function( parenthesis ) {
	if(typeof parenthesis !== "undefined"){
		this.parenthesis = parenthesis;
		return true;
	}
	return false;
};

ChordModel.prototype.getBeat = function() {
	return this.beat;
};
ChordModel.prototype.setBeat = function( beat ) {
	if(typeof beat !== "undefined" && !isNaN(beat)){
		this.beat = beat;
		return true;
	}
	return false;
};

ChordModel.prototype.getBarNumber = function() {
	return this.barNumber;
};

ChordModel.prototype.setBarNumber = function( barNumber ) {
	if(typeof barNumber !== "undefined" && !isNaN(barNumber)){
		this.barNumber = barNumber;
		return true;
	}
	return false;
};

ChordModel.prototype.getPosition = function() {
	return this.position;
};

/**
 * like getPosition but returns the y as the top of the chord, not the middel
  * @return {Object}                
 */
ChordModel.prototype.getPositionForSelecting = function() {		
	return {
		x: this.position.x,
		y: this.position.y-this.position.h/2,
		w: this.position.w,
		h: this.position.h
	};
};

ChordModel.prototype.setPosition = function( position ) {
	if(typeof position !== "undefined"){
		if(position.x){
			this.position.x = position.x;
		}
		if(position.y){
			this.position.y = position.y;
		}
		if(position.w){
			this.position.w = position.w;
		}
		if(position.h){
			this.position.h = position.h;
		}
		return true;
	}
	return false;
};

// ChordModel.prototype.isSelected = function() {
// 	return this.selected;
// }
// ChordModel.prototype.select = function() {
// 	this.selected = true;
// };
// ChordModel.prototype.unselect = function() {
// 	this.selected = false;
// };

ChordModel.prototype.displayChordInDiv = function(id_HTMLElement) {
	if(typeof NoteTools !== "undefined" && typeof VexFlowHelper !== "undefined"){
		// This should probably be done outside the object
		var self = this;
		this.getChordNotes( 4, function(chordNotes){
			if(typeof chordNotes !== "undefined"){
			
				var chordKey = NoteTools.addSlashFromChordArray(chordNotes);
				var chordAccidental = NoteTools.getAccidentalFromChord(chordNotes);
				
				var canvas = $('<canvas height="100" width="180"/>',{'id':'chordTypeCanvas'});
				VexFlowHelper.drawChordType(chordKey, chordAccidental, canvas, 'chord_helper_container');
				$('#' + id_HTMLElement).prepend('<div id="chord_helper_container_chordName">' + self.toString() + '</div>');
			}
		});
	}
};


ChordModel.prototype.playChord = function(chordNotes) {
	if(typeof chordNotes !== "undefined"){
		this.allNotes = chordNotes;
	}
	this.getAllMidiNotes(function(notes){
		for(var i = 0; i < notes.length; i++){
			if(typeof notes[ i ] !== "undefined"){
				MIDI.noteOn(0, notes[ i ]-12, 75);
				MIDI.noteOff(0, notes[ i ]-12, 1);
			}
		}
	});
};


ChordModel.prototype.isVisible = function() {
	return this.visible;
}
ChordModel.prototype.show = function() {
	this.visible = true;
}
ChordModel.prototype.hide = function() {
	this.visible = false;
};

ChordModel.prototype.isEditable = function() {
	return this.editable;
}
ChordModel.prototype.allowEdition = function() {
	this.editable = true;
}
ChordModel.prototype.lockEdition = function() {
	this.editable = false;
}
/* End of basic getter setter */


ChordModel.prototype.toString = function() {
	var base = this.getBase();
	var string = this.getNote() +" "+ this.formatChordType(this.getChordType());
	if(!$.isEmptyObject(base) &&  base.getNote()!="")
	{
		string += "/"+base.getNote() +" "+ this.formatChordType(base.getChordType());
	}
	if(this.getParenthesis()){
		string = '(' + string + ')';
	}
	return string;

}
ChordModel.prototype.toUnformatedString = function() {
	var base = this.getBase();
	if(($.isEmptyObject(base))){
		var string = this.getNote() + this.getChordType();
		if(this.getParenthesis()){
			string = '(' + string + ')';
		}
		return string;
	}
	else{
		var string = this.getNote() + this.getChordType() + "/" + base.getNote() + base.getChordType();
		if(this.getParenthesis()){
			string = '(' + string + ')';
		}
		return string;
	}
};

ChordModel.prototype.toUnformatedStringWithSpace = function() {
	var base = this.getBase();
	var string = this.getNote() +" "+ this.getChordType();
	if(($.isEmptyObject(base))){
		if(this.getParenthesis()){
			string = '(' + string + ')';
		}
		return string;
	}
	else{
		string += "/" + base.getNote() +" "+ base.getChordType();
		if(this.getParenthesis()){
			string = '(' + string + ')';
		}
		return string;
	}
}

ChordModel.prototype.setChordFromString = function( stringChord ) {

	function validateSimpleChord(cChord) {
		var pitchClasses = ["C", "C#", "Cb", "D", "D#", "Db", "E", "E#", "Eb", "F", "F#", "Fb", "G", "G#", "Gb", "A", "A#", "Ab", "B", "B#", "Bb", "%", "%%", "NC"];
		
		var chordTypes = NoteTools.getCollection('chordtype');
		var nChord = jQuery.trim(cChord);
		var pos;
		if (nChord.charAt(1) == "b" || nChord.charAt(1) == "#" || nChord.charAt(1) == "%")	
			pos = 2;
		else if (nChord == "NC")	
			pos = nChord.length;
		else
			pos = 1;

		var pitchClass = nChord.substring(0, pos);
		var chordType = nChord.substring(pos, nChord.length);

		if ((pitchClasses.indexOf(pitchClass) == -1 || chordTypes.indexOf(chordType) == -1) && cChord.length!=0) {
			//error            
			return {
				err: true,
				msg: "incorrect chord " + pitchClass + " " + chordType
			};
		} else return {note: pitchClass, chordType: chordType};
	}

	// Looking for base chord
	stringChord = stringChord.split('/');
	var note,chordType;

	var stringChordRoot = stringChord[ 0 ];

	if(stringChord.length >= 2){

		var stringChordBase = stringChord[ 1 ];
		
		if($.isEmptyObject(this.base)){
			this.base = new ChordModel();
		}
		this.base.setChordFromString(stringChordBase);
	}	
	// Set current chord note and chordtype
	stringChordRoot = stringChordRoot.replace(/\s/g, '');

	var r = validateSimpleChord(stringChordRoot);
	this.setNote(r.note);
	this.setChordType(r.chordType);	

	//We set allMidiNotes to undefined because otherwise they won't be updated
	this.allMidiNotes = undefined;
	editor.update.call(editor);
	return !r.err;
};

ChordModel.prototype.draw = function( context, option ) {
	if(this.isVisible() && typeof context !== "undefined"){
		context.font = "18px Verdana"; // font for chords
		context.textBaseline = "middle"; // font for chords
		context.fillText(this.toString(), this.position.x + 5, this.position.y);
		var showSelected = false;
		if(typeof option !== "undefined" && option.showSelected === true){
			showSelected = true;
		}
		context.textBaseline = "alphabetic"; // font for chords
	}
};

ChordModel.prototype.editChord = function( id_HTMLElement, classSelectedName, offset, scale ) {
	if(typeof scale === "undefined"){
		scale = 1;
	}
	if(this.isEditable() && typeof id_HTMLElement !== "undefined" && id_HTMLElement.length && typeof classSelectedName !== "undefined" && classSelectedName.length) {
		// Build input with correct position
		var chordPosition = this.getPosition();
		if(typeof offset === "undefined" || isNaN(offset.top) || isNaN(offset.left)){
			offset = {top: 0, left: 0};
		}
		chordPosition.w = chordPosition.w * scale;
		chordPosition.x = chordPosition.x * scale;
		chordPosition.y = chordPosition.y * scale;
		var top = chordPosition.y - chordPosition.h / 2 + offset.top;
		var left = chordPosition.x + offset.left;
		var width = 50;
		if(chordPosition.w > 10){
			width = (chordPosition.w + 10);
		}

		var input = $('<input/>').attr({ type: 'text', style:"position:absolute; z-index: 11;left:" + left + "px;top:"+ top + "px; width:" + width + "px", autocomplete: 'off', class: classSelectedName }).prependTo('#' + id_HTMLElement);
		input.val(this.toUnformatedString());
		input.focus();
		input.select();
		// TODO use same prediction that in edit.php
		var prediction = new Prediction();
		var cm = editor.getChordManager();
		var currentChordIndex = cm.getChordIndex(this);
		var previousChord = [];
		var pastChord;
		for (var i = 1; i < 5; i++) {
			pastChord = cm.getChord(currentChordIndex - i);
			if(pastChord){
				previousChord.push(pastChord.toString());
			}
		}
		if(typeof NoteTools.allChords === "undefined"){
			NoteTools.getAllChords();
		}
		
		var myconf = prediction.buildAutoComplete(NoteTools.allChords);
		
		input.autocomplete(myconf.autocompleteParams);
		input.contextmenu();

		var self = this;
		$('.' + classSelectedName).keyup(function(evt){
			var ok = self.setChordFromString($(this).val());
			if (evt.keyCode == 13)
			{
				if (ok){
					editor.toggleEditingMode();
				}else{
					//code to show warning (and to avoid )
					var msg="<span class=\"message warning\">Invalid chord</span>";
					$(".message").remove();
					$(msg).appendTo($("#save").parent().next()).fadeOut(3000,function(){
						$(this).remove();
					});
				}
			}
		});
		$('.acResults').click(function(evt){
			self.setChordFromString($('.' + classSelectedName).val());
		});

		return true;
	}
	return false;
};

ChordModel.prototype.isInPath = function( x, y ) {
	if(typeof x !== "undefined" && !isNaN(x) && typeof y !== "undefined" && !isNaN(y)){
		var chordPosition = this.getPosition();
		if( chordPosition.x <= x  && x <= (chordPosition.x + chordPosition.w) && (chordPosition.y - chordPosition.h / 2) <= y  
			&& y <= (chordPosition.y + chordPosition.h / 2) ){
			return true;
		}
	}
	return false;
}

/**
 * 
 * @param  {Object}  area Object with porperties xi,xe,yi,ye
 * @return {Boolean}      
 */
ChordModel.prototype.isInPathArea = function( area ) 
{
	var chPos = this.getPosition();
	var xe=chPos.x+chPos.w;
	var ye=chPos.y+chPos.h/2;
	var yi=chPos.y-chPos.h/2;
	return (area.xi<xe && area.xe>chPos.x ) && (area.yi<ye && area.ye>yi );
};

ChordModel.prototype.setChordSymbols=function(){
	function htmlDecode(value) {
		var div = document.createElement('div');
		div.innerHTML = value;
		return div.firstChild.nodeValue;
	}
	var maps={
			"halfdim":"&#248;",//ø   //216 -> Ø
			//"maj7":"&#916;",//Δ
			"dim":"&#959;"
	};
	for (var prop in maps) {
		maps[prop]=htmlDecode(maps[prop]);
	}
	return maps;
};

/*
 * The function transform a chordType String to symbols according chordSymbols maps
 * Example: halfdim become ø
 */
ChordModel.prototype.formatChordType = function(chordTypeName) {
	for(var props in this.chordSymbols)	{
		chordTypeName = chordTypeName.replace(props,this.chordSymbols[props]);
	}
	return chordTypeName;
};

ChordModel.prototype.unformatChordType = function(chordTypeName) {
	for(var props in this.chordSymbols){
		chordTypeName = chordTypeName.replace(this.chordSymbols[props],props);
	}
	return chordTypeName;
};


ChordModel.prototype.getChordNotes = function( octave, callback ) {
	var note = this.getNote();
	if(note === "NC"){
		this.allMidiNotes = [];
		if(typeof callback !== "undefined") {
			callback([]);
		}
		return;
	}
	var chordType = this.unformatChordType(this.getChordType());

	/**
	 * We first try to know if this chord is already known
	 */
	if(typeof chordTypeToNote[chordType] !== "undefined") {
		var chordNotes = chordTypeToNote[chordType];
		if(note !== "C" || octave != 4) {
			transposeNoteList(note, octave, chordNotes.join(','), function(data){
				if(typeof data.result !== "undefined"){
					var chordNotes = NoteTools.transformStringNote2ArrayNote(data.result);
					if(typeof callback !== "undefined"){
						callback(chordNotes);
					}
				}
			});
		}
		else{
			if(typeof callback !== "undefined"){
				callback(chordNotes);
			}
		}
	}
	else{
		/**
		 * Otherwise we query database
		 */
		if(chordType === "") {
			chordType = "M";
		}
		getChordTypeFromDB(chordType, note, function(data){
			if(typeof data !== "undefined") {
				if(note !== "C" || octave != 4) {
					transposeNoteList(note, octave, data.chordNotes, function(data){
						if(typeof data.result !== "undefined"){
							var chordNotes = NoteTools.transformStringNote2ArrayNote(data.result);
							if(typeof callback !== "undefined"){
								callback(chordNotes);
							}
						}
					});
				}
				else {
					if(typeof data.chordNotes !== "undefined"){
						var chordNotes = NoteTools.transformStringNote2ArrayNote(data.chordNotes);
						if(typeof callback !== "undefined") {
							callback(chordNotes);
						}
					}
				}
			}
		});
	}
};

ChordModel.prototype.setPitchFromMidiAddition = function( midiDecal ) {
	if(typeof NoteTools !== "undefined" && typeof MidiHelper !== "undefined" && !isNaN(midiDecal)){
		var pitch2Midi = NoteTools.pitch2Number(this.getNote());
		var newPitch = NoteTools.number2Pitch( pitch2Midi + midiDecal );
		this.setNote( newPitch );
		MidiHelper.transposeMidiNotes(this.allMidiNotes, midiDecal);
	}
};

ChordModel.prototype.getAllMidiNotes = function(callback) {
	if(typeof this.allMidiNotes !== "undefined"){
		// case midinotes have already been computed
		if(typeof callback !== "undefined"){
			callback(this.allMidiNotes);
		}
		return this.allMidiNotes;
	}
	else if(typeof this.allNotes !== "undefined") {
		// case notes are known but midinotes have never been computed
		this.convertNotesToMidi();
		if(typeof callback !== "undefined") {
			callback(this.allMidiNotes);
		}
		return this.allMidiNotes;
	}
	else{
		// case notes and midinotes are unknown
		var chordTypesNotes = this.getChordTypesNotes();
		if(typeof chordTypesNotes !== "undefined") {
			// case chordTypeNotes in C are known
			var midiNotes = MidiHelper.convertNotesToMidi(chordTypesNotes);
			var decal = NoteTools.pitch2Number(this.getNote());
			this.allMidiNotes = MidiHelper.transposeMidiNotes(midiNotes, decal);
			if(typeof callback !== "undefined") {
				callback(this.allMidiNotes);
			}
			return this.allMidiNotes;
		}
		else{
			// case chordTypeNotes in C are not know, we query good notes and then transpose them
			var self = this;
			this.getChordNotes( 4, function(chordNotes) {
				self.allNotes = chordNotes;
				self.convertNotesToMidi();
				if(typeof callback !== "undefined") {
					callback(self.allMidiNotes);
				}
				return self.allMidiNotes;
			});
		}
	}
};

ChordModel.prototype.getChordTypesNotes = function() {
	var note = this.getNote();
	if(note === "NC"){
		this.allMidiNotes = [];
		if(typeof callback !== "undefined") {
			callback([]);
		}
		return;
	}
	var chordType = this.unformatChordType(this.getChordType());

	/**
	 * We first try to know if this chord is already known
	 */
	if(typeof chordTypeToNote[chordType] !== "undefined") {
		var chordNotes = chordTypeToNote[chordType];
		return chordNotes;
	}
	return;
}


ChordModel.prototype.convertNotesToMidi = function(){
	this.allMidiNotes = MidiHelper.convertNotesToMidi(this.allNotes);
	return this.allMidiNotes;
};

ChordModel.prototype.getAllConstraints = function(){
	return this.constraints;
};

ChordModel.prototype.getAllConstraintsFromType = function( type ){
	var typedConstraints;
	for (var i = 0; i < this.constraints.length; i++) {
		if(this.constraints[ i ].type === type){
			typedConstraints = this.constraints[ i ];
		}
	}
	return typedConstraints;
};

ChordModel.prototype.setConstraint = function( type, value ){
	var found = false;
	// case the type already exist
	for (var i = 0; i < this.constraints.length; i++) {
		if(this.constraints[ i ].type === type){
			this.constraints[ i ].values.push( value );
			found = true;
		}
	}
	// case we are creating the first constraint for this type
	if(!found){
		this.constraints.push({
			"type" : type,
			"values" : [value]
		});
	}
};

ChordModel.prototype.isAConstrain = function( type, value ){
	for (var i = 0; i < this.constraints.length; i++) {
		if(this.constraints[ i ].type === type){
			for (var j = 0; j < this.constraints[ i ].values.length; j++) {
				if(this.constraints[ i ].values[ j ] === value){
					return true;
				}
			}
		}
	}
	return false;
};

ChordModel.prototype.deleteConstraint = function( type, value ){
	var deleted = false;
	for (var i = this.constraints.length - 1; i >= 0 ; i--) {
		if(this.constraints[ i ].type === type){
			for (var j = this.constraints[ i ].values.length - 1; j >= 0; j--) {
				if(this.constraints[ i ].values[ j ] === value){
					this.constraints[ i ].values.splice(j, 1);
					if(this.constraints[ i ].values.length === 0 ){
						// case there was only one from this type
						this.constraints.splice(i, 1);
					}
					deleted = true;
				}
			}
		}
	}
	return deleted;
}
