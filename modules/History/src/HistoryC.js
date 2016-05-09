define([
	'modules/History/src/HistoryController',
	'modules/History/src/HistoryView',
	'modules/History/src/HistoryModel'
], function(HistoryController, HistoryView, HistoryModel) {
	/**
    * History constructor
    * @exports History/HistoryC
    */
   	/**
   	 * [HistoryC description]
   	 * @param {SongModel} songModel   
   	 * @param {HTMLelemeny} parentHTML  e.g. $('#rightPanel')
   	 * @param {CursorModel} notesCursor 
   	 * @param {Object} options     properties: maxHistoryLength, displayHistory, displayTime
   	 */
	function HistoryC(songModel, parentHTML, notesCursor, options) {
		options = options || {};
		var historyM = new HistoryModel(options.maxHistoryLength);
		var historyV = new HistoryView(parentHTML, options.displayHistory, options.displayTime);
		new HistoryController(historyM, songModel, notesCursor);
	}
	return HistoryC;

});