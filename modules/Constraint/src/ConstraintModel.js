define([
	'mustache',
	'modules/core/src/SongModel',
	'utils/UserLog',
	'pubsub',
], function(Mustache, SongModel, UserLog, pubsub) {
	/**
	 * ConstraintModel is an array of constraints, it allow a high level management of constraints
	 * @param {songModel} songModel
	 * @param {object} options
	 */
	var ConstraintModel = function(songModel, options) {
		this.songModel = (typeof songModel !== "undefined") ? songModel : undefined;
		this.scoreHistory = [];
		this.currentPositionHistory = 0;
		this.init();
	};

	ConstraintModel.prototype.init = function() {
		this.constraints = [];
	};

	ConstraintModel.prototype.setCurrentPositionHistory = function(position) {
		if (!isNaN(position) && position >= 0 && position < this.scoreHistory.length) {
			this.currentPositionHistory = position;
		}
	};

	ConstraintModel.prototype.addToHistory = function(leadsheet) {
		this.scoreHistory = this.scoreHistory.slice(0, this.currentPositionHistory + 1);
		var time = (new Date()).toLocaleString();
		var newHistorical = {
			'leadsheet': leadsheet,
			'time': time
		};
		this.scoreHistory.push(newHistorical);
	};


	ConstraintModel.prototype.addMusicCSLJSON = function(request) {
		if (typeof editor === "undefined") {
			return request;
		}
		var leadsheet = editor.getSong().exportToMusicCSLJSON();
		var ls = {
			'incompleteLeadsheet': JSON.stringify(leadsheet),
		};
		$.extend(true, request, ls);
		return request;
	};


	ConstraintModel.prototype.compareObj2 = function(obj1, obj2) {
		var same = true;
		var sameChord = true;
		var sameNote = true;
		var section = false;
		var bars = false;
		var existMelody = false;
		var existChords = false;

		var colorDiff = "blue";
		/*console.log(obj1);
		console.log(obj2);*/
		if (typeof obj2 !== "undefined") {
			if (typeof obj1 === "undefined") {
				//console.log('object undefined');
				same = false;
			} else {
				same = true;
			}
			if (typeof obj2.changes !== "undefined") {
				if (same === true) {
					if (typeof obj1.changes === "undefined") {
						//console.log('no changes ');
						same = false;
					} else {
						same = true;
					}
				}
				for (var i in obj2.changes) {
					var JSONSection = obj2.changes[i];
					if (section === true) {
						same = true;
						section = false;
					}
					if (same === true) {
						if (typeof obj1.changes[i] === "undefined") {
							//console.log('no section ' + i);
							section = true;
							same = false;
						} else {
							same = true;
						}
					}
					// console.log(JSONSection);
					if (typeof JSONSection.bars !== "undefined") {
						if (same === true) {
							if (typeof obj1.changes[i].bars === "undefined") {
								//console.log('no bars in section ' + i);
								same = false;
							} else {
								same = true;
							}
						}
						for (var j in JSONSection.bars) {
							if (bars === true) {
								same = true;
								bars = false;
							}
							var JSONBar = JSONSection.bars[j];
							if (same === true) {
								if (typeof obj1.changes[i].bars[j] === "undefined") {
									//console.log('no bar ' + j);
									same = false;
									bars = true;
								} else {
									same = true;
								}
							}
							// console.log(j, JSONBar);
							if (typeof JSONBar.chords !== "undefined") {
								if (existChords === true) {
									same = true;
									existChords = false;
								}
								if (same === true) {
									if (typeof obj1.changes[i].bars[j].chords === "undefined") {
										//console.log('enter at bar chords ' + j);
										same = false;
										existChords = true;
									} else {
										same = true;
									}
								}
								for (var k in JSONBar.chords) {
									var JSONChord = JSONBar.chords[k];
									if (same === true) {
										sameChord = true;
										if (typeof obj1.changes[i].bars[j].chords[k] === "undefined" ||
											obj1.changes[i].bars[j].chords[k]['p'] != JSONChord['p'] ||
											obj1.changes[i].bars[j].chords[k]['ch'] != JSONChord['ch'] ||
											obj1.changes[i].bars[j].chords[k]['beat'] != JSONChord['beat']) {
											//console.log('if chords');
											sameChord = false;
										}
									}
									if (same === false || sameChord === false) {
										JSONChord['color'] = colorDiff;
										sameChord = true;
									}
								}
							}
							if (typeof JSONBar.melody !== "undefined") {
								if (existMelody === true) {
									same = true;
									existMelody = false;
								}
								if (same === true) {
									if (typeof obj1.changes[i].bars[j].melody === "undefined") {
										//console.log('enter at bar melody ' + j);
										same = false;
										existMelody = true;
									} else {
										same = true;
									}
								}
								for (var k in JSONBar.melody) {
									var JSONNote = JSONBar.melody[k];
									if (same === true) {
										sameNote = true;
										if (typeof obj1.changes[i].bars[j].melody[k] === "undefined" ||
											obj1.changes[i].bars[j].melody[k]['duration'] != JSONNote['duration'] ||
											obj1.changes[i].bars[j].melody[k]['keys'][0] != JSONNote['keys'][0]) {
											//console.log('if notes');
											sameNote = false;
										}
									}
									if (same === false || sameNote === false) {
										JSONNote['color'] = colorDiff;
										sameNote = true;
									}
								}
							}
						}
					}
				}
			}
		}
		return obj2;
	};
	return ConstraintModel;
});