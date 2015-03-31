define([
	'modules/converters/MusicCSLJson/src/SongModel_CSLJson',
	'mustache',
	'utils/UserLog',
	'pubsub',
], function(SongModel_CSLJson, Mustache, UserLog, pubsub) {

	function HistoryController(model, songModel) {
		this.model = model || new HistoryModel();
		this.songModel = songModel;
		this.initSubscribe();
	}

	/**
	 * Subscribe to view events
	 */
	HistoryController.prototype.initSubscribe = function() {
		var self = this;
		$.subscribe('HistoryView-selectHistory', function(el, indexItem) {
			self.loadHistory(indexItem);
		});
		$.subscribe('HistoryView-moveSelectHistory', function(el, inc) {
			self.moveSelectHistory(inc);
		});
		$.subscribe('ToHistory-add', function(el, itemObject) {
			var item = '';
			var title = '';
			if (typeof itemObject === "string") {
				item = itemObject;
			} else {
				item = itemObject.item;
				title = itemObject.title;
			}
			self.addToHistory(item, title);
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
		SongModel_CSLJson.importFromMusicCSLJSON(this.model.getCurrentState().leadsheet, this.songModel);
		$.publish('ToViewer-draw', this.songModel);
		// $.publish('toSongModel-load', this.model.getCurrentState().leadsheet); // TODO must work! this or this.songModel
	};

	/**
	 * Function is call to load the state of one history before or after (typically, ctrl+z or ctrl+y)
	 * @param  {int} inc represent the decal of history relative to currentHistory to be loaded
	 */
	HistoryController.prototype.moveSelectHistory = function(inc) {
		if (isNaN(inc)) {
			throw 'HistoryController - moveSelectHistory - inc must be an int ' + inc;
		}
		console.log('load', this.model.getCurrentPosition(), inc)
		this.loadHistory(this.model.getCurrentPosition() + inc);
	};

	/**
	 * Function is call to save a state to history
	 * @param  {item} represent the item of history that will be inserted
	 */
	HistoryController.prototype.addToHistory = function(item, title) {
		this.model.addToHistory(item, title);
		this.model.setCurrentPosition(this.model.historyList.length - 1);
	};

	return HistoryController;
});