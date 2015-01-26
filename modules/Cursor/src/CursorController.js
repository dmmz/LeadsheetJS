define([
	'mustache',
	'modules/core/src/SongModel',
	'utils/UserLog',
	'pubsub',
], function(Mustache, SongModel, UserLog, pubsub) {

	function CursorController(model, view) {
		this.model = model || new CursorModel();
		this.view = view;
		this.initSubscribe();
	}

	/**
	 * Subscribe to view events
	 */
	CursorController.prototype.initSubscribe = function() {
		var self = this;
		$.subscribe('CursorView-setCursor', function(el, index) {
			self.setCursor(index);
		});
		$.subscribe('CursorView-expandSelected', function(el, inc) {
			self.expandSelected(inc);
		});
		$.subscribe('CursorView-moveCursor', function(el, inc) {
			self.moveCursor(inc);
		});
	};


	/**
	 * set cursor by index
	 * @param {integer} index
	 * @param {string} editMode "notes" or "chords"
	 */
	CursorController.prototype.setCursor = function(index, editMode) {
		if (typeof index === "undefined" || isNaN(index)) {
			throw 'CursorController - setCursor - index is not correct ' + index;
		}

		// function check if cursor index is correct
		function controlIndex(index, min, max) {
			if (!(index instanceof Array)) index = [index, index];
			for (var i = 0; i < index.length; i++) {
				if (index[i] < min) index[i] = min;
				if (index[i] >= max) index[i] = max - 1;
			}
			return index;
		}

		console.log("CursorController - setCursor " + index);
		//var manager = this.songModel.getComponent(editMode);
		//index = controlIndex(index, 0, manager.getTotal());
		this.model.setPos(index);
	};

	CursorController.prototype.expandSelected = function(inc, editMode) {
		if (typeof inc === "undefined" || isNaN(inc)) {
			throw 'CursorController - expandSelected - inc is not correct ' + inc;
		}
		console.log("CursorController - expandSelected " + inc);
		/*var manager = this.songModel.getComponent(editMode);
		this.model.expand(inc, manager.getTotal());*/
		this.model.expand(inc, 10);
	};

	CursorController.prototype.moveCursor = function(inc) {
		console.log("CursorController - moveCursor " + inc);
		this.model.setPos(this.model.getEnd() + inc);
	};


/*
	CursorController.prototype.setCursorByCoords = function(coords, selectingMode) {
		if (coords == null) return;

		var minMax;
		var notes = chords = false;
		var notesMinMax;


		//selectingMode refers to when mouse is down and we are still selecting, 
		//console.log("selectingMode "+selectingMode);
		if (this.forceBarsEditMode) {
			minMax = this.songModel.getComponent("bars").findMinMaxBarsByCoords(coords, this.viewer.staves);
			if (minMax[0] != null && minMax[1] != null) {
				this.cursor.setPos(minMax);
				this.interactor.setEditMode("bars");
			}
		} else {
			if ((!selectingMode || selectingMode == "notes")) {
				minMax = this.getNoteManager().findMinMaxNotesByCoords(coords);
				if (minMax[0] != null && minMax[1] != null) {
					notes = true;
					notesMinMax = minMax;
					//this.cursor.setPos(minMax);
					this.setCursor(minMax, "notes");
				}
			}

			if ((!selectingMode || selectingMode == "chords")) {
				minMax = this.getChordManager().findMinMaxChordsByCoords(coords);
				if (minMax[0] != null && minMax[1] != null) {

					this.setCursor(minMax, "chords");
					window.clearTimeout(this.timeoutUpdate);
					var self = this;
					this.timeoutUpdate = window.setTimeout(function() {
						//TODO: move to interactor
						self.getChordManager().getChord(minMax[0]).displayChordInDiv('chord_helper_container');
					}, 100);
					chords = true;
				}
			}
			if (notes) {
				this.interactor.setEditMode("notes");
			} else if (chords)
				this.interactor.setEditMode("chords");
		}
		return notes ? "notes" : chords ? "chords" : null;

	};
*/
/*
	//NOT USED FOR THE MOMENT
	CursorController.prototype.tabEvent = function(inc) {
		var cm = this.getChordManager();
		cm.tabEvent(inc);
		if (typeof mainMenu !== "undefined") {
			mainMenu.startChordSubstitution(this, cm.getSelectedChords());
			mainMenu.updateFromSelectedChord(cm, cm.getSelectedChords());
		}
		cm.getChord(cm.getCursorChord()[0]).playChord();
	};*/



	return CursorController;
});