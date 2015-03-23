define([
	'mustache',
	'modules/core/src/SongModel',
	'modules/Tag/src/TagManager',
	'modules/converters/MusicCSLJson/src/SongModel_CSLJson',
	'modules/Constraint/src/ConstraintAPI',
	'utils/UserLog',
	'pubsub',
], function(Mustache, SongModel, TagManager, SongModel_CSLJson, ConstraintAPI, UserLog, pubsub) {

	function ConstraintController(songModel) {
		this.songModel = songModel || new SongModel();
		this.initSubscribe();
	}

	/**
	 * Subscribe to view events
	 */
	ConstraintController.prototype.initSubscribe = function() {
		var self = this;
		$.subscribe('ConstraintView-compute', function(el, opts) {
			self.computeConstraint(opts.songset, opts.composer, opts.timeSignature, opts.source, opts.numberOfBars);
		});
	};

	ConstraintController.prototype.constraint2API = function(songset, composer, timeSignatureFilter, source, numberOfBars, constraint, controller) {
		var self = this;
		var tempo = 120;
		var timeSignature = "4/4";
		var leadsheet = {};
		leadsheet = SongModel_CSLJson.exportToMusicCSLJSON(this.songModel);
		timeSignatureFilter = "all";
		var request = {
			'incompleteLeadsheet': JSON.stringify(leadsheet),
			'timesigFilter': timeSignatureFilter,
		};
		var comp = {};
		if (songset !== "" && songset !== null) {
			comp = {
				'songSet': songset,
			};
			$.extend(true, request, comp);
		}
		if (composer !== "" && composer !== null) {
			comp = {
				'composer': composer,
			};
			$.extend(true, request, comp);
		}
		if (source !== "" && source !== null) {
			comp = {
				'source': source,
			};
			$.extend(true, request, comp);
		}
		return request;
	};

	ConstraintController.prototype.computeConstraint = function(songset, composer, timeSignature, source, numberOfBars) {
		var self = this;
		var capi = new ConstraintAPI();
		var request = {};
		request = this.constraint2API(songset, composer, timeSignature, source, numberOfBars);

		//this.model.addToHistory(request.leadsheet);
		//this.model.setCurrentPositionHistory(this.model.scoreHistory.length - 1);
		//self.view.displayHistory();

		var logId = UserLog.log('info', 'Computing ...');

		capi.constraintAPI(request, function(data) {
			UserLog.removeLog(logId);
			console.log(data);
			if (data.success === true) {
				//self.model.addToHistory(data.result);
				//self.model.setCurrentPositionHistory(self.model.scoreHistory.length - 1);
				//self.view.displayHistory();

				self._compareObj(request.leadsheet, data.result);

				//console.log(data.result);
				SongModel_CSLJson.importFromMusicCSLJSON(data.result, self.songModel);

				if (typeof data.tags !== "undefined") {
					var tags = new TagManager(self.songModel, data.tags);
				}
				$.publish('ToViewer-draw', self.songModel);
				UserLog.logAutoFade('success', 'Constraint is finished');
			} else {
				var message = 'Unknown error';
				if (typeof data.error !== "undefined") {
					message = data.error;
				} else if (typeof data.message !== "undefined") {
					message = data.message;
				}
				UserLog.logAutoFade('error', message);
			}
		});

	};

	/**
	 * Function compares two leadsheets and add a color "colorDiff" to item that change
	 * @param  {[type]} obj1 [description]
	 * @param  {[type]} obj2 [description]
	 * @return {[type]}      [description]
	 */
	ConstraintController.prototype._compareObj = function(obj1, obj2) {
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
	return ConstraintController;
});