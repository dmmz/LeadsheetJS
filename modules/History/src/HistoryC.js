define([
	'modules/History/src/HistoryController',
	'modules/History/src/HistoryView',
	'modules/History/src/HistoryModel'
], function(HistoryController, HistoryView, HistoryModel) {

	function HistoryC(songModel, maxHistoryLength, displayTime) {
		var historyM = new HistoryModel(maxHistoryLength);
		var historyV = new HistoryView(displayTime);
		new HistoryController(historyM, songModel);
	}
	return HistoryC;

});