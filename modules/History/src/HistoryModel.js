define([
	'mustache',
	'jquery',
	'utils/UserLog',
	'pubsub',
], function(Mustache, $, UserLog, pubsub) {
	/**
	 * HistoryModel is an array of state, it allow a high level management of Historys
	 * @param {object} options
	 */
	var HistoryModel = function(options) {
		this.init();
		this.maxHistoryLength = (typeof options !== "undefined" && !isNaN(options.maxHistoryLength)) ? options.maxHistoryLength : 20;
	};

	/**
	 * Initialise historyList by cleaning historyList
	 * By default currentPosition is on 0
	 */
	HistoryModel.prototype.init = function() {
		this.historyList = []; // state list
		this.currentPosition = 0; // current Position start at 0
	};

	HistoryModel.prototype.getCurrentPosition = function() {
		return this.currentPosition;
	};

	HistoryModel.prototype.getCurrentState = function() {
		return this.historyList[this.currentPosition];
	};

	HistoryModel.prototype.setCurrentPosition = function(position) {
		if (!isNaN(position) && position >= 0 && position < this.historyList.length) {
			this.currentPosition = position;
			$.publish('HistoryModel-setCurrentPosition', this);
		}
	};

	/**
	 * Add a state to History
	 * @param {Object} leadsheet contain a state, it's often a leadsheet
	 * @param {string} title     state name, view can display this message to user.
	 * A date paramateres will automatically be added to history
	 */
	HistoryModel.prototype.addToHistory = function(leadsheet, title) {
		this.historyList = this.historyList.slice(0, this.currentPosition + 1);
		var time = (new Date()).toLocaleString();
		title = title ? title : '';
		var newHistorical = {
			'leadsheet': leadsheet,
			'title': title,
			'time': time
		};
		this.historyList.push(newHistorical);
		var safety = 1000;
		while (this.historyList.length > this.maxHistoryLength && safety > 0) {
			safety--;
			this.historyList.shift();
		}
		$.publish('HistoryModel-addToHistory', this);
	};

	return HistoryModel;
});