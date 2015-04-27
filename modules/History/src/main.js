define([
		"modules/History/src/HistoryController",
		"modules/History/src/HistoryModel",
		"modules/History/src/HistoryView",
	],
	function(HistoryController, HistoryModel, HistoryView) {
		return {
			"HistoryController": HistoryController,
			"HistoryModel": HistoryModel,
			"HistoryView": HistoryView
		};
	}
);