define([], function() {
	function ChordModel_CSLJson(MusicCSLJSON) {

	};

	ChordModel_CSLJson.prototype.musicCSLJson2SongModel = function(JSONChord) {
		this.setNote(JSONChord.p);
		this.setChordType(JSONChord.ch);
		this.setParenthesis(JSONChord.parenthesis);
		this.setBeat(JSONChord.beat);
		if (JSONChord.hasOwnProperty('bp') && JSONChord.bp.length != 0) {
			chordModelBase = new ChordModel();
			chordModelBase.setNote(JSONChord.bp);
			chordModelBase.setChordType(JSONChord.bch);
			this.setBase(chordModelBase);
		}
		if (JSONChord.barNumber != null)
			this.barNumber = JSONChord.barNumber;
	};



	ChordModel_CSLJson.prototype.songModel2MusicCSLJson = function(songModel, withNumMeasure) {
		if (withNumMeasure === undefined) withNumMeasure = false;
		var chord = {};
		chord.p = this.getNote();
		chord.ch = this.getChordType();
		if (this.getParenthesis())
			chord.parenthesis = this.getParenthesis();

		chord.beat = this.getBeat();

		if (this.getBase()) {
			chordBase = this.getBase();
			chord.bp = chordBase.getNote();
			chord.bch = chordBase.getChordType();
		}
		if (withNumMeasure) chord.barNumber = this.barNumber;
		return chord;
	};

	return ChordModel_CSLJson;
});