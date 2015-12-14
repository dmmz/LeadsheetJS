define([
	'modules/core/src/SongModel',
	'modules/converters/MusicCSLJson/src/SongModel_CSLJson',
	'mustache',
	'utils/UserLog',
	'jquery',
	'pubsub',
], function(SongModel, SongModel_CSLJson, Mustache, UserLog, $, pubsub) {
	/**
	 * History constroller
	 * @exports History/HistoryController
	 */
	function HistoryController(model, songModel) {
		this.model = model || new HistoryModel();
		this.songModel = songModel || new SongModel();
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
		$.subscribe('ToHistory-add', function(el, title, updateLastEntry) {
			self.addToHistory(title, updateLastEntry);
		});
		$.subscribe('ToHistory-updateLastEntry', function() {
			self.updateLastEntry();
		});

	};


	/**
	 * Function is called to load the state of one history
	 * @param  {int} currentHistory represent the index of history that will be loaded
	 */
	HistoryController.prototype.loadHistory = function(currentHistory) {
		if (typeof this.model.historyList[currentHistory] === "undefined") {
			UserLog.logAutoFade('error', "No history available");
			return;
		}
		this.model.setCurrentPosition(currentHistory);
		if (this.songModel) {
			var retrievedLeadsheet = this.model.getCurrentState();
			if (retrievedLeadsheet) {
				SongModel_CSLJson.importFromMusicCSLJSON(retrievedLeadsheet, this.songModel);
				$.publish('ToLayers-removeLayer');
				$.publish('ToViewer-draw', this.songModel);
			}
		}
	};

	/**
	 * Function is called to load the state of one history before or after (typically, ctrl+z or ctrl+y)
	 * @param  {int} inc represent the decal of history relative to currentHistory to be loaded
	 */
	HistoryController.prototype.moveSelectHistory = function(inc) {
		if (isNaN(inc)) {
			throw 'HistoryController - moveSelectHistory - inc must be an int ' + inc;
		}
		this.loadHistory(this.model.getCurrentPosition() + inc);
	};

	/**
	 * Function is called to save a state to history
	 */
	HistoryController.prototype.addToHistory = function(title, updateLastEntry) {
		var JSONSong = SongModel_CSLJson.exportToMusicCSLJSON(this.songModel); // Exporting current songModel to json
		this.model.addToHistory(JSONSong, title, updateLastEntry);
	};

	/**
	 * Function is called to update last entry songModel state, but title is merged, it's used to not create another entry in history state
	 */
	HistoryController.prototype.updateLastEntry = function() {
		var JSONSong = SongModel_CSLJson.exportToMusicCSLJSON(this.songModel); // Exporting current songModel to json
		this.model.getCurrentState().leadsheet = JSONSong;
	};

	return HistoryController;
});