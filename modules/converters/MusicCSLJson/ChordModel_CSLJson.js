define([], function() {
	function ChordModel_CSLJson(MusicCSLJSON) {

	};

	ChordModel_CSLJson.prototype.importFromMusicCSLJSON = function(JSONChord) {
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



	ChordModel_CSLJson.prototype.exportToMusicCSLJSON = function(chordModel, withNumMeasure) {
		if (withNumMeasure === undefined) withNumMeasure = false;
		var chord = {};
		chord.p = chordModel.getNote();
		chord.ch = chordModel.getChordType();
		if (chordModel.getParenthesis())
			chord.parenthesis = chordModel.getParenthesis();

		chord.beat = chordModel.getBeat();
		if (!chordModel.isEmptyBase()) {
			chordBase = chordModel.getBase();
			chord.bp = chordBase.getNote();
			chord.bch = chordBase.getChordType();
		}
		if (withNumMeasure) chord.barNumber = chordModel.barNumber;
		return chord;
	};

	return ChordModel_CSLJson;
});