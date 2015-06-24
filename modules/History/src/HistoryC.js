define([
	'modules/History/src/HistoryController',
	'modules/History/src/HistoryView',
	'modules/History/src/HistoryModel'
], function(HistoryController, HistoryView, HistoryModel) {

	function HistoryC(songModel, parentHTML, maxHistoryLength, displayHistory, displayTime) {
		var historyM = new HistoryModel(maxHistoryLength);
		var historyV = new HistoryView(parentHTML, displayHistory, displayTime);
		new HistoryController(historyM, songModel);
	}
	return HistoryC;

});