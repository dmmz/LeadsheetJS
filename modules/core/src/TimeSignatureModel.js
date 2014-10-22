define(function(){
	function TimeSignatureModel(timeSig)
	{
		var re = /\d\/\d/;
		if (!timeSig.match(re)){
			throw "Time signature not valid "+timeSig;
		}

		timeSigArr = timeSig.split("/");
		
		this.numBeats = parseInt(timeSigArr[0],10);
		this.beatUnit = parseInt(timeSigArr[1],10);
	}
	TimeSignatureModel.prototype.getBeats = function() {
		return this.numBeats;
	};
	TimeSignatureModel.prototype.getBeatUnitQuarter = function() {
		return 4 / this.beatUnit;
	};
	TimeSignatureModel.prototype.getQuarterBeats = function() {
		return (4 / this.beatUnit) * this.numBeats;
	};
	return TimeSignatureModel;
});