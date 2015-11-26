define([
	'mustache',
	'jquery',
	'utils/UserLog',
	'pubsub',
	'JsonDelta'
], function(Mustache, $, UserLog, pubsub, JSON_delta) {
		/**
	 * HistoryModel is an array of state, it allow a high level management of Historys
	 * @param {object} options
	 */
	var HistoryModel = function(options) {
		this.init();
		this.maxHistoryLength = options && !isNaN(options.maxHistoryLength) ? options.maxHistoryLength : 20;
		this.lastLeadsheet = null;
	};

	/**
	 * Initialise historyList by cleaning historyList
	 * By default currentPosition is on 0
	 */
	HistoryModel.prototype.init = function() {
		this.historyList = []; // state list
		this.currentPosition = -1; // current Position start at 0
	};

	HistoryModel.prototype.getCurrentPosition = function() {
		return this.currentPosition;
	};

	HistoryModel.prototype.getCurrentState = function() {
		var leadsheet = this.lastLeadsheet;
		for (var i = this.historyList.length - 1; i >= this.currentPosition; i--) {
			leadsheet = JSON_delta.patch(leadsheet,this.historyList[i].invertedDelta);
		}

		return leadsheet;
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
		var time = new Date().toLocaleString();
		title = title ? title : '';

		if (this.lastLeadsheet){

			var invertedDelta = JSON_delta.diff(leadsheet, this.lastLeadsheet);
			
			if (invertedDelta.length === 0){ //in case there was no change (not probable)
				return;
			}
			
			var newHistorical = {
				'invertedDelta': invertedDelta,
				'title': title,
				'time': time
			};
			this.historyList.push(newHistorical);
			if (this.historyList.length > this.maxHistoryLength){
				this.historyList.splice(0,1);	
			}
		}
		this.lastLeadsheet = leadsheet;
		$.publish('HistoryModel-addToHistory', this);	
		
		
	};

	return HistoryModel;
});