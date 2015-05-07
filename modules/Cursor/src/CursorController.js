define([
	'mustache',
	'modules/core/src/SongModel',
	'utils/UserLog',
	'pubsub',
], function(Mustache, SongModel, UserLog, pubsub) {

	function CursorController(songModel, model, view) {
		this.songModel = songModel;
		this.model = model || new CursorModel();
		this.view = view;
		this.initSubscribe();
	}

	/**
	 * Subscribe to view events
	 */
	CursorController.prototype.initSubscribe = function() {
		var self = this;
		$.subscribe('ToAllCursors-setEditable', function(el, isEditable) {
			self.setEditable(isEditable);
		});
		$.subscribe('CursorView-setCursor' + this.view.id, function(el, index) {
			self.setCursor(index);
		});
		$.subscribe('CursorView-expandSelected' + this.view.id, function(el, inc) {
			self.expandSelected(inc);
		});
		$.subscribe('CursorView-moveCursor' + this.view.id, function(el, inc) {
			self.moveCursor(inc);
		});
	};


	/**
	 * set cursor by index
	 * @param {integer} index
	 * @param {string} editMode "notes" or "chords"
	 */
	CursorController.prototype.setCursor = function(index) {
		if (typeof index === "undefined" || isNaN(index)) {
			throw 'CursorController - setCursor - index is not correct ' + index;
		}

		this.model.setPos(index);
		//TODO: change by 'canvaslayer-refresh', working for notes but cannot do it yet because we need to solve some problems for the chords editions
		$.publish('ToViewer-draw', this.songModel);
	};

	CursorController.prototype.expandSelected = function(inc) {
		if (typeof inc === "undefined" || isNaN(inc)) {
			throw 'CursorController - expandSelected - inc is not correct ' + inc;
		}
		this.model.expand(inc);
		$.publish('ToViewer-draw', this.songModel);
	};

	CursorController.prototype.moveCursor = function(inc) {
		this.setCursor(this.model.getEnd() + inc);
	};

	CursorController.prototype.setEditable = function(isEditable) {
		this.model.setEditable(isEditable);
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