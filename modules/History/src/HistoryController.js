define([
	'mustache',
	'utils/UserLog',
	'pubsub',
], function(Mustache, SongModel, HistoryAPI, UserLog, pubsub) {

	function HistoryController(model, view) {
		this.model = model || new HistoryModel();
		this.view = view;
		var self = this;
		$.subscribe('HistoryView-selectHistory', function(el, indexItem) {
			self.loadHistory(indexItem);
		});
	}

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