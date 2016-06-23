define([
		'modules/Unfold/src/Repetition',
		'modules/Unfold/src/RepeatPoint',
		'modules/Unfold/src/StartLabel',
	], function(Repetition, RepeatPoint, StartLabel){
	var DaAlRepetition = Object.assign(Repetition,{
		al: undefined,
		da: undefined
	});
	DaAlRepetition.setDa = function(da) {
		this.da = da;
		this.setToPoint(this.structure.getStartLabel(this.da));
	};

	DaAlRepetition.setAl = function(al) {
		this.al = al;
	};

	DaAlRepetition.getDaPoint = function() {
		return this.getToPoint();
	};

	DaAlRepetition.initValues = function(leadsheetStructure, sublabel, section, bar, playIndex){
		
		var invalidRepetitionException = "Invalid repetition";
		var repeatPoint = Object.create(RepeatPoint);
		repeatPoint.callInitValues(leadsheetStructure, sublabel, section, bar, playIndex);

		this.setValuesFromPoint(repeatPoint);
		
		var parts = sublabel.split(" ");
		var numTokens = parts.length;
		if (numTokens != 3){
			throw invalidRepetitionException;
		}

		this.setDa(StartLabel.fromString(parts[0]));
		if (!this.getDaPoint()){
			throw invalidRepetitionException;
		}
		if (numTokens === 3){
			if (parts[1].toLowerCase() !== 'al') {
				throw invalidRepetitionException;		
			}
			this.setAl(parts[2]);
		}

	};

	return DaAlRepetition;

});