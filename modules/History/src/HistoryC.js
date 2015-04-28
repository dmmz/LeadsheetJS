define([
	'modules/History/src/HistoryController',
	'modules/History/src/HistoryView',
	'modules/History/src/HistoryModel'
	],	function(HistoryController, HistoryView, HistoryModel){

	function HistoryC (songModel) {
		var historyM = new HistoryModel();
		var historyV = new HistoryView();
		new HistoryController(historyM, songModel);
	}
	return HistoryC;

});