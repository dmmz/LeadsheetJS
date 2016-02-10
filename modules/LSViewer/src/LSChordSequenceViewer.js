define(['modules/LSViewer/src/LSViewer'],function(LSViewer){
	function LSChordSequenceViewer(divContainer, params){
		params = params || {};
		params.onlyChords = true;
		params.drawStaveNumbers = false;
		params.drawStaveLines = false;
		params.fontChords = "25px Verdana";
		params.chordDistanceStave = -45;
		params.initialLineHeight = 90;
		params.paddingLeftChords = 30;
		params.layer = true;
		return new LSViewer(divContainer, params);
	}
	return LSChordSequenceViewer;
});