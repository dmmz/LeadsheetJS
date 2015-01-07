define([
	'mustache',
	'utils/UserLog',
	'pubsub',
], function(Mustache, SongModel, HistoryAPI, UserLog, pubsub) {

	function HistoryController(model, view) {
		this.model = model || new HistoryModel();
		this.view = view;
		this.initSubscribe();
	}

	/**
	 * Subscribe to view events
	 */
	HistoryView.prototype.initSubscribe = function() {
		var self = this;
		$.subscribe('HistoryView-selectHistory', function(el, indexItem) {
			self.loadHistory(indexItem);
		});
	};
	
	/**
	 * Function is call to load the state of one history
	 * @param  {int} currentHistory represent the index of history that will be loaded
	 */
	HistoryController.prototype.loadHistory = function(currentHistory) {
		if (typeof this.model.historyList[currentHistory] === "undefined") {
			UserLog.logAutoFade('error', "No history available");
			return;
		}
		this.model.setCurrentPosition(currentHistory);
		this.view.render();
	};

	return HistoryController;
});