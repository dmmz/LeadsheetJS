define([
	'mustache',
	'utils/UserLog',
	'pubsub',
], function(Mustache, SongModel, UserLog, pubsub) {

	function HistoryView(model, parentHTML) {
		this.model = (model) ? model : new HistoryModel();
		this.el = undefined;
		this.parentHTML = (parentHTML) ? parentHTML : $('#rightPanel');
		this.initController();
		this.initSubscribe();
	}

	/**
	 * Render will build and display a new dom in parentHTML using model historyList
	 * @return {[type]} [description]
	 */
	HistoryView.prototype.render = function() {
		if (typeof this.parentHTML === "undefined") {
			return;
		}
		var history = '<h3>History</h3>';
		history += '<ul class="history_ul">';
		var text = '', classCurrent = "";
		// loop through each history state
		for (var i = 0, c = this.model.historyList.length; i < c; i++) {
			classCurrent = "";
			if (i == this.model.currentPosition) {
				classCurrent = "current_history";
			}
			text = '';
			if(this.model.historyList[i]['title'] !== '') {
				text += this.model.historyList[i]['title'] + ' ';
			}
			text += this.model.historyList[i]['time'];
			history += '<li class="' + classCurrent + '" data-history="' + i + '">' + text + '</li>';
		}
		history += '</ul>';
		this.parentHTML.html(history);
		$.publish('HistoryView-render');
	};

	/**
	 * Publish event after receiving dom events
	 */
	HistoryView.prototype.initController = function() {
		var self = this;
		this.parentHTML.on('click', ".history_ul li", function() {
			var indexItem = $(this).attr('data-history');
			$.publish('HistoryView-selectHistory', indexItem);
		});
	};

	/**
	 * Subscribe to model publish
	 */
	HistoryView.prototype.initSubscribe = function() {
		var self = this;
		$.subscribe('HistoryModel-setCurrentPosition', function() {
			self.render();
		});
		$.subscribe('HistoryModel-addToHistory', function() {
			self.render();
		});
	};

	HistoryView.prototype.unactiveView = function() {
		$('#rightPanel').hide('slow');
	};

	HistoryView.prototype.activeView = function() {
		$('#rightPanel').show('slow');
		this.render();
	};

	return HistoryView;
});