define([
	'mustache',
	'utils/UserLog',
	'jquery',
	'pubsub',
], function(Mustache, UserLog, $, pubsub) {
	/**
	 * History view
	 * @exports History/HistoryView
	 */
	function HistoryView(parentHTML, displayHistory, displayTime) {
		this.el = undefined;
		this.parentHTML = (parentHTML) ? parentHTML : $('#rightPanel');
		this.displayHistory = (typeof displayHistory !== "undefined") ? displayHistory : true;
		this.displayTime = !!displayTime;
		this.isActive = true;
		this.initController();
		this.initKeyboard();
		this.initSubscribe();
		this.render();
		this.activeView();
	}

	/**
	 * Render will build and display a new dom in parentHTML using model historyList
	 */
	HistoryView.prototype.render = function(model) {
		if (this.displayHistory === false || !this.parentHTML) {
			return;
		}

		var history = '';
		history += '<span class="pull-right history-fold">></span>';
		history += '<div class="history-container">';
		history += '<h3>History</h3>';
		history += '<ul class="history_ul">';
		var text = '',
			classCurrent = "";
		// loop through each history state
		if (model) {
			for (var i = 0, c = model.historyList.length; i < c; i++) {
				classCurrent = "";
				if (i == model.currentPosition) {
					classCurrent = "current_history";
				}
				text = '';
				if (model.historyList[i]['title'] !== '') {
					text += model.historyList[i]['title'] + ' ';
				}
				if (this.displayTime) {
					text += model.historyList[i]['time'];
				}
				history += '<li class="' + classCurrent + '" data-history="' + i + '">' + text + '</li>';
			}
		}
		history += '</ul>';
		history += '</div>';
		this.parentHTML.html(history);
		//$.publish('HistoryView-render');
	};

	HistoryView.prototype.initKeyboard = function(evt) {
		$.subscribe('ctrl-z', function(el) {
			$.publish('HistoryView-moveSelectHistory', -1);
		});
		$.subscribe('ctrl-y', function(el) {
			$.publish('HistoryView-moveSelectHistory', 1);
		});
	};

	/**
	 * Publish event after receiving dom events
	 */
	HistoryView.prototype.initController = function() {
		var self = this;
		this.parentHTML.on('click', ".history_ul li", function() {
			var indexItem = parseInt($(this).attr('data-history'), 10);
			$.publish('HistoryView-selectHistory', indexItem);
		});

		this.parentHTML.addClass('history-open');
		this.parentHTML.on('click', ".history-fold", function() {
			if (self.isActive === true) {
				$('.history-fold').html('<');
				self.parentHTML.removeClass('history-open');
				self.parentHTML.addClass('history-close');
				self.parentHTML.find('.history-container').hide();
				self.isActive = false;
			} else {
				$('.history-fold').html('>');
				self.parentHTML.removeClass('history-close');
				self.parentHTML.addClass('history-open');
				self.parentHTML.find('.history-container').show();
				self.isActive = true;
			}
		});
	};

	/**
	 * Subscribe to model events
	 */
	HistoryView.prototype.initSubscribe = function() {
		var self = this;
		$.subscribe('HistoryModel-setCurrentPosition', function(el, model) {
			self.render(model);
		});
		$.subscribe('HistoryModel-addToHistory', function(el, model) {
			self.render(model);
		});
		$.subscribe('toHistoryView-unactiveView', function() {
			self.unactiveView();
		});
		$.subscribe('toHistoryView-activeView', function() {
			self.activeView();
		});
	};

	HistoryView.prototype.unactiveView = function() {
		//$('#rightPanel').hide('slow');
	};

	HistoryView.prototype.activeView = function() {
		$(this.parentHTML).show('slow');
	};

	return HistoryView;
});