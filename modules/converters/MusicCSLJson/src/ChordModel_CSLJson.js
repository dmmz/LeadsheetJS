define(['modules/core/src/ChordModel'], function(ChordModel) {
	var ChordModel_CSLJson = {};

	ChordModel_CSLJson.importFromMusicCSLJSON = function(JSONChord, chordModel) {
		chordModel.setNote(JSONChord.p);
		chordModel.setChordType(JSONChord.ch);
		chordModel.setParenthesis(JSONChord.parenthesis);
		chordModel.setBeat(JSONChord.beat);
		if (JSONChord.hasOwnProperty('bp') && JSONChord.bp.length != 0) {
			chordModelBase = new ChordModel();
			chordModelBase.setNote(JSONChord.bp);
			chordModelBase.setChordType(JSONChord.bch);
			chordModel.setBase(chordModelBase);
		}
		if (JSONChord.barNumber != null)
			chordModel.barNumber = JSONChord.barNumber;
	};



	ChordModel_CSLJson.exportToMusicCSLJSON = function(chordModel, withNumMeasure) {
		if (withNumMeasure === undefined) withNumMeasure = false;
		var chord = {};
		if (typeof chordModel !== "undefined" && chordModel instanceof ChordModel) {
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
		}
		return chord;
	};

	return ChordModel_CSLJson;
});