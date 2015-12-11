define([
	'modules/History/src/HistoryController',
	'modules/History/src/HistoryView',
	'modules/History/src/HistoryModel'
], function(HistoryController, HistoryView, HistoryModel) {
	/**
    * History constructor
    * @exports History/HistoryC
    */
	function HistoryC(songModel, parentHTML, modelOptions, displayHistory, displayTime) {
		var historyM = new HistoryModel(modelOptions);
		var historyV = new HistoryView(parentHTML, displayHistory, displayTime);
		new HistoryController(historyM, songModel);
	}
	return HistoryC;

});