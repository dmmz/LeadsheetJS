define(['modules/core/src/BarModel'], function(BarModel) {
	var BarModel_CSLJson = {};
	
	/////////////////////////
	//  Advanced function  //
	/////////////////////////

	BarModel_CSLJson.importFromMusicCSLJSON = function(JSONBar) {
		var bar = new BarModel();
		var labels = ["segno", "segno2", "fine", "coda", "coda2", "on cue"];
		labels.forEach(function(label) {
			if (JSONBar.hasOwnProperty(label)) {
				bar.setLabel(label);
			}
		});
		//so far now we allow only one label per bar in the DB, but this code is prepared to allow more than one, as an array
		if (JSONBar.hasOwnProperty('ending')) bar.setEnding(JSONBar.ending);
		if (JSONBar.hasOwnProperty('sublabel')) bar.setSublabel(JSONBar.sublabel);
		if (JSONBar.hasOwnProperty('timeSignature')) bar.setTimeSignatureChange(JSONBar.timeSignature);
		return bar;
	};

	BarModel_CSLJson.exportToMusicCSLJSON = function(barModel) {
		var bar = {};

		if (barModel.getLabel())
			bar[barModel.getLabel()] = 1;

		if (barModel.getEnding())
			bar.ending = barModel.getEnding();

		if (barModel.getSublabel())
			bar.sublabel = barModel.getSublabel();

		if (barModel.getTimeSignatureChange())
			bar.timeSignature = barModel.getTimeSignatureChange();

		return bar;
	};
	return BarModel_CSLJson;
});
	