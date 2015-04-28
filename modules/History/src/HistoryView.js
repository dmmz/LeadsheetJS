define([
	'mustache',
	'utils/UserLog',
	'pubsub',
], function(Mustache, SongModel, UserLog, pubsub) {

	function HistoryView(parentHTML) {
		this.el = undefined;
		this.parentHTML = (parentHTML) ? parentHTML : $('#rightPanel');
		this.initController();
		this.initKeyboard();
		this.initSubscribe();
		this.render();
	}

	/**
	 * Render will build and display a new dom in parentHTML using model historyList
	 * @return {[type]} [description]
	 */
	HistoryView.prototype.render = function(model) {
		if (typeof this.parentHTML === "undefined") {
			return;
		}
		var history = '<h3>History</h3>';
		history += '<ul class="history_ul">';
		var text = '',
			classCurrent = "";
		// loop through each history state
		if (typeof model !== "undefined") {
			for (var i = 0, c = model.historyList.length; i < c; i++) {
				classCurrent = "";
				if (i == model.currentPosition) {
					classCurrent = "current_history";
				}
				text = '';
				if (model.historyList[i]['title'] !== '') {
					text += model.historyList[i]['title'] + ' ';
				}
				text += model.historyList[i]['time'];
				history += '<li class="' + classCurrent + '" data-history="' + i + '">' + text + '</li>';
			}
		}
		history += '</ul>';
		this.parentHTML.html(history);
		//$.publish('HistoryView-render');
	};

	HistoryView.prototype.initKeyboard = function(evt) {
		var self = this;
		$(document).keydown(function(evt) {
			if (self.editing === false) {
				return;
			}
			var keyCode = (evt === null) ? event.keyCode : evt.keyCode;
			var key = String.fromCharCode(keyCode).toLowerCase();

			//prevent backspace
			if (keyCode === 8) {
				var doPrevent = false;
				var d = evt.srcElement || evt.target;
				if (d.tagName.toUpperCase() === 'TEXTAREA' || (d.tagName.toUpperCase() === 'INPUT' && (d.type.toUpperCase() === 'TEXT' || d.type.toUpperCase() === 'PASSWORD' || d.type.toUpperCase() === 'FILE'))) {
					doPrevent = d.readOnly || d.disabled;
				} else {
					doPrevent = true;
				}
				if (doPrevent) {
					stopEvent(evt);
				}
			}

			if (keyCode === 90 && evt.ctrlKey) { // Ctrl + z
				$.publish('HistoryView-moveSelectHistory', -1);
				stopEvent(evt);
			} else if (keyCode === 89 && evt.ctrlKey) { // Ctrl + y
				$.publish('HistoryView-moveSelectHistory', 1);
				stopEvent(evt);
			}
			// else console.log(key + " " + keyCode);
		});

		function stopEvent(evt) {
			evt.preventDefault();
			evt.stopPropagation();
		}
	};

	/**
	 * Publish event after receiving dom events
	 */
	HistoryView.prototype.initController = function() {
		var self = this;
		this.parentHTML.on('click', ".history_ul li", function() {
			var indexItem = parseInt($(this).attr('data-history'),10);
			$.publish('HistoryView-selectHistory', indexItem);
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
		$('#rightPanel').hide('slow');
	};

	HistoryView.prototype.activeView = function() {
		$('#rightPanel').show('slow');
	};

	return HistoryView;
});