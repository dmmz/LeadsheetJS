define([
	'jquery',
	'underscore',
	'utils/UserLog',
	'store'
], function($, _, UserLog, store) {
	/**
	 * HistoryModel is an array of state, it allow a high level management of Historys
	 * @exports History/HistoryModel
	 * @param {object} options
	 */
	var HistoryModel = function(options) {
		options = options || {};
		this.init();
		this.maxHistoryLength = options.maxHistoryLength || 10000;
		this.autoSave = options.autoSave || false;
		this.recoverMsg = 'We\'ve recovered unsaved modifications, would you like to load them?';

		if (this.autoSave) {
			var self = this;
			$.subscribe('ToHistoryModel-modificationsSaved', function(){
				self.deleteSavedHistory.apply(self);
			});
		}
	};

	/**
	 * Initialise historyList by cleaning historyList
	 * By default currentPosition is on 0
	 */
	HistoryModel.prototype.init = function() {
		this.lastLeadsheet = null;
		this.currentPosition = -1; // current Position start at 0
	};

	HistoryModel.prototype.getLastLeadsheetId = function() {
		return this.lastLeadsheet !== null ? this.lastLeadsheet._id : false;
	};	

	HistoryModel.prototype.deleteSavedHistory = function(leadsheetId) {
		leadsheetId = leadsheetId ? leadsheetId : this.getLastLeadsheetId();
		if (leadsheetId) {
			var localHistory = this.getLocalHistoryCollection();
			delete localHistory[leadsheetId];
			this.setLocalHistoryCollection(localHistory);
			localHistory = null;
		}
	};

	HistoryModel.prototype.setLocalHistoryCollection = function(historyCollectionToSave) {
		store.set('savedHistory', historyCollectionToSave);
	};

	HistoryModel.prototype.getLocalHistoryCollection = function() {
		var localHistory = store.get('savedHistory');
		return localHistory ? localHistory : {};
	};

	HistoryModel.prototype.setSavedHistory = function(historyToSave, leadsheetId) {
		leadsheetId = leadsheetId || this.getLastLeadsheetId();
		var localHistory = this.getLocalHistoryCollection();
		localHistory[leadsheetId] = historyToSave;
		this.setLocalHistoryCollection(localHistory);
		// free memory before gc
		localHistory = null;
	};

	HistoryModel.prototype.getSavedHistory = function(leadsheetId) {
		leadsheetId = leadsheetId ? leadsheetId : this.getLastLeadsheetId();
		var localHistoryCollection = this.getLocalHistoryCollection();
		return leadsheetId && localHistoryCollection[leadsheetId] ? localHistoryCollection[leadsheetId] : [];
	};

	HistoryModel.prototype.getCurrentPosition = function() {
		return this.currentPosition;
	};

	HistoryModel.prototype.getState = function(position) {
		var states = this.getSavedHistory();
		return states && states[position] ? states[position].leadsheet : false;
	};

	HistoryModel.prototype.getCurrentItem = function() {
		return this.getSavedHistory()[this.currentPosition];
	};

	HistoryModel.prototype.getCurrentState = function() {
		return this.getState(this.currentPosition);
	};

	HistoryModel.prototype.setCurrentPosition = function(position) {
		if (!isNaN(position) && position >= -1 && position < this.getSavedHistory().length) {
			this.currentPosition = position;
			$.publish('HistoryModel-setCurrentPosition', this);
		}
	};

	HistoryModel.prototype.reloadHistory = function(leadsheetId) {
		var actualHistory = this.getSavedHistory(leadsheetId);
		if (!this.lastLeadsheet) {
			// first item, look for unsaved modifications
			if (this.autoSave) {
				if (!_.isEmpty(actualHistory) && actualHistory.length > 1) {
					if (window.confirm(this.recoverMsg)) {
						historyReloaded = true;
					} else {
						actualHistory = [];
						this.deleteSavedHistory(leadsheetId);
					}
				}
			} else {
				actualHistory = [];
			}
		}
		return actualHistory;
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
		var position = 0;
		var actualHistory = this.reloadHistory(leadsheet._id);
		
		if (this.lastLeadsheet || (!this.lastLeadsheet && actualHistory.length === 0)) {
			var newHistorical = {
				leadsheet: leadsheet,
				title: title ? title : '',
				time: new Date().toLocaleString(),
				extraData: extraData
			};
			if (updateLastEntry) {
				actualHistory[actualHistory.length - 1] = newHistorical;
				position = this.currentPosition;
			} else {
				actualHistory = actualHistory.slice(0, this.currentPosition + 1);
				actualHistory.push(newHistorical);
				if (actualHistory.length > this.maxHistoryLength) {
					actualHistory.splice(0, 1);
				}
				position = this.currentPosition + 1;
			}
			this.setSavedHistory(actualHistory, leadsheet._id);
		}
		this.lastLeadsheet = leadsheet;
		this.setCurrentPosition(position);
		$.publish('HistoryModel-addToHistory', this);
	};

	return HistoryModel;
});