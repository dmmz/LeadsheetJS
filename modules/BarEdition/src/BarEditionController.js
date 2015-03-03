define([
	'mustache',
	'modules/Cursor/src/CursorModel',
	'modules/core/src/SongModel',
	'modules/core/src/BarModel',
	'utils/UserLog',
	'pubsub',
], function(Mustache, CursorModel, SongModel, BarModel, UserLog, pubsub) {

	function BarEditionController(songModel, cursor, view) {
		this.songModel = songModel || new SongModel();
		this.cursor = cursor || new CursorModel();
		this.view = view;
		this.initSubscribe();
	}

	/**
	 * Subscribe to view events
	 */
	BarEditionController.prototype.initSubscribe = function() {
		var self = this;
		$.subscribe('BarEditionView-addBar', function(el) {
			self.addBar();
		});
		$.subscribe('BarEditionView-removeBar', function(el) {
			self.removeBar();
		});
		$.subscribe('BarEditionView-timeSignature', function(el, timeSignature) {
			self.timeSignature(timeSignature);
		});
		$.subscribe('BarEditionView-tonality', function(el, tonality) {
			self.tonality(tonality);
		});
		$.subscribe('BarEditionView-ending', function(el, ending) {
			self.ending(ending);
		});
		$.subscribe('BarEditionView-style', function(el, style) {
			self.style(style);
		});
		$.subscribe('BarEditionView-label', function(el, label) {
			self.label(label);
		});
		$.subscribe('BarEditionView-sublabel', function(el, sublabel) {
			self.subLabel(sublabel);
		});
	};

	BarEditionController.prototype.addBar = function() {
		this.songModel.getComponent('bars').addBar();

		// Update section number of bars
		sectionNumber = this.songModel.getSections().length - 1;
		section = this.songModel.getSection(sectionNumber);
		section.setNumberOfBars(section.getNumberOfBars() + 1);

		myApp.viewer.draw(this.songModel);
	};

	BarEditionController.prototype.removeBar = function() {
		var selBars = this._getSelectedBars();
		if (selBars.length === 0) {
			return;
		}
		var bm = this.songModel.getComponent('bars');
		var sectionNumber;
		for (var i = selBars.length - 1; i > 0; i--) {
			sectionNumber = this.songModel.getSectionNumberFromBarNumber(selBars[i]);
			section = this.songModel.getSection(sectionNumber);
			section.setNumberOfBars(section.getNumberOfBars() - 1);
			bm.removeBar(selBars[i]);
		}
		myApp.viewer.draw(this.songModel);
	};

	BarEditionController.prototype.timeSignature = function(timeSignature) {
		var selBars = this._getSelectedBars();
		if (selBars.length === 0) {
			return;
		}
		for (var i = 0, c = selBars.length; i < c; i++) {
			if (timeSignature === "none") {
				timeSignature = undefined;
			}
			this.songModel.getComponent("bars").getBar(selBars[i]).setTimeSignature(timeSignature);
		}
		myApp.viewer.draw(this.songModel);
		// TODO check notes duration
	};

	BarEditionController.prototype.tonality = function(tonality) {
		var selBars = this._getSelectedBars();
		if (selBars.length === 0) {
			return;
		}
		for (var i = 0, c = selBars.length; i < c; i++) {
			this.songModel.getComponent("bars").getBar(selBars[i]).setTonality(tonality);
		}
		myApp.viewer.draw(this.songModel);
	};

	BarEditionController.prototype.ending = function(ending) {
		var selBars = this._getSelectedBars();
		if (selBars.length === 0) {
			return;
		}
		for (var i = 0, c = selBars.length; i < c; i++) {
			if (ending === "none") {
				ending = undefined;
			}
			this.songModel.getComponent("bars").getBar(selBars[i]).setEnding(ending);
		}
		myApp.viewer.draw(this.songModel);
	};

	BarEditionController.prototype.style = function(style) {
		var selBars = this._getSelectedBars();
		if (selBars.length === 0) {
			return;
		}
		for (var i = 0, c = selBars.length; i < c; i++) {
			if (style === "none") {
				style = undefined;
			}
			this.songModel.getComponent("bars").getBar(selBars[i]).setStyle(style);
		}
		myApp.viewer.draw(this.songModel);
	};

	BarEditionController.prototype.label = function(label) {
		var selBars = this._getSelectedBars();
		if (selBars.length === 0) {
			return;
		}
		for (var i = 0, c = selBars.length; i < c; i++) {
			if (label === "none") {
				label = '';
			}
			this.songModel.getComponent("bars").getBar(selBars[i]).setLabel(label);
		}
		myApp.viewer.draw(this.songModel);
	};

	BarEditionController.prototype.subLabel = function(sublabel) {
		var selBars = this._getSelectedBars();
		if (selBars.length === 0) {
			return;
		}
		for (var i = 0, c = selBars.length; i < c; i++) {
			if (sublabel === "none") {
				sublabel = undefined;
			}
			this.songModel.getComponent("bars").getBar(selBars[i]).setSublabel(sublabel);
		}
		myApp.viewer.draw(this.songModel);
	};

	BarEditionController.prototype._getSelectedBars = function() {
		var selectedBars = [];
		selectedBars[0] = this.songModel.getComponent('notes').getNoteBarNumber(this.cursor.getStart(), this.songModel);
		selectedBars[1] = this.songModel.getComponent('notes').getNoteBarNumber(this.cursor.getEnd(), this.songModel);
		return selectedBars;
	};

	return BarEditionController;
});