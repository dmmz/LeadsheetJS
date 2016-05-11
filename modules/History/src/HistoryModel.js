define([
	'jquery',
	'utils/UserLog',
	'deepdiff'
], function($, UserLog, deepdiff) {
	/**
	 * HistoryModel is an array of state, it allow a high level management of Historys
	 * @exports History/HistoryModel
	 * @param {object} options
	 */
	var HistoryModel = function(maxHistoryLength) {
		this.init();
		this.maxHistoryLength = maxHistoryLength || 10000;
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

	HistoryModel.prototype.getState = function(position) {
		var leadsheet = $.extend(true, {}, this.lastLeadsheet); //cloning,so that this.lastLeadsheet is not affected
		
		for (var i = this.historyList.length - 1; i > position; i--) {
			var differences = this.historyList[i].differences;
			for (var j = 0; j < differences.length; j++){
				deepdiff.applyChange(leadsheet, this.lastLeadsheet, differences[j]);	
			}
		}
		return leadsheet;
	};

	HistoryModel.prototype.getCurrentItem = function() {
		return this.historyList[this.currentPosition];
	};

	HistoryModel.prototype.getCurrentState = function() {
		return this.getState(this.currentPosition);
	};

	HistoryModel.prototype.setCurrentPosition = function(position) {
		if (!isNaN(position) && position >= -1 && position < this.historyList.length) {
			this.currentPosition = position;
			$.publish('HistoryModel-setCurrentPosition', this);
		}
	};

	/**
	 * Add a state to History
	 * @param {Object} leadsheet contain a state, it's often a leadsheet
	 * @param {string} title     state name, view can display this message to user.
	 * @param {Boolean} updateLastEntry     if updating last entry, true, this is common when changing pitch note, first time pitch is changed, we add a new entry entry, 
	 *                                      but if pitch is changed many times in the same note without moving the cursor, we just update it in order to not have very long historics
	 * @param {mixed} extraData extraData that needs to be stored. Optionnal.
	 */
	HistoryModel.prototype.addToHistory = function(leadsheet, title, updateLastEntry, extraData) {

		var time = new Date().toLocaleString();
		title = title ? title : '';
		var differences;
		var leadsheetToCompareTo;



		//first time lastLeadsheet will be null so there will be no delta to obtain
		if (this.lastLeadsheet) {
			var pos = updateLastEntry ? this.currentPosition - 1 : this.currentPosition;
			leadsheetToCompareTo = this.getState(pos); //get previous leadsheet, as we want delta to get to previous leadsheet, not the last
			differences = deepdiff.diff(leadsheet, leadsheetToCompareTo);
			if (!differences) { //in case there was no change (not probable)
				return;
			}
		} else {
			differences = null;
		}

		var newHistorical = {
			differences: differences,
			title: title,
			time: time,
			extraData: extraData
		};
		if (updateLastEntry) {
			this.historyList[this.historyList.length - 1] = newHistorical;
		} else {
			this.historyList = this.historyList.slice(0, this.currentPosition + 1);
			this.historyList.push(newHistorical);
			if (this.historyList.length > this.maxHistoryLength) {
				this.historyList.splice(0, 1);
			}
			this.setCurrentPosition(this.currentPosition + 1);
		}
		this.lastLeadsheet = leadsheet;
		$.publish('HistoryModel-addToHistory', this);

	};

	return HistoryModel;
});