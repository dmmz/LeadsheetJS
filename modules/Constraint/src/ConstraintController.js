define([
	'mustache',
	'modules/core/src/SongModel',
	'modules/Constraint/src/ConstraintAPI',
	'utils/UserLog',
	'pubsub',
], function(Mustache, SongModel, ConstraintAPI, UserLog, pubsub) {

	function ConstraintController(model, view) {
		this.model = model || new ConstraintModel();
		this.view = view;
		var self = this;
		$.subscribe('ConstraintView-compute', function(el, songset, composer, timeSignature, source, numberOfBars) {
			self.computeConstraint(songset, composer, timeSignature, source, numberOfBars);
		});
	}

	ConstraintController.prototype.constraint2API = function(songset, composer, timeSignatureFilter, source, numberOfBars, constraint, controller) {
		var self = this;
		var tempo = 120;
		var timeSignature = "4/4";
		var leadsheet = {};
		if (typeof editor !== "undefined" && typeof editor.getSong() !== "undefined") {
			tempo = editor.player.getTempo();
			timeSignature = editor.getSong().getTimeSignature();
			leadsheet = editor.getSong().exportToMusicCSLJSON();
		}
		//var request = this.allConstraints2API(constraints, tempo, timeSignature, numberOfBars, songset);

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

		if (typeof editor !== "undefined" && typeof editor.getSong() !== "undefined") {
			var leadsheet = editor.getSong().exportToMusicCSLJSON();
			this.model.addToHistory(leadsheet);
			this.model.setCurrentPositionHistory(this.model.scoreHistory.length - 1);
		}
		self.view.displayHistory();
		//test();

		var logId = UserLog.log('info', 'Computing ...');

		capi.constraintAPI(request, function(data) {
			UserLog.removeLog(logId);
			if (typeof data.success === true) {
				self.model.addToHistory(data.result);
				self.model.setCurrentPositionHistory(self.model.scoreHistory.length - 1);
				self.view.displayHistory();

				self.model.compareObj2(leadsheet, data.result);
				//console.log(data.result);
				var songModel = new SongModel(data.result);
				if (typeof editor !== "undefined") {
					editor.setSong(songModel);
					if (editor.player instanceof ModelPlayer) {
						editor.player.setSongModel(songModel);
					}
					editor.update();
					editor.viewer.draw(editor);
				}
				if (typeof data.tags !== "undefined") {
					var harm = new HarmonicAnalysis(editor);
					harm.drawAreaFromJSON(data.tags);
				}
				UserLog.logAutoFade('success', 'Constraint is finished');
				this.view.updateConstraintView(data.sequence);

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

	ConstraintController.prototype.loadHistory = function(indexDiff) {
		var currentHistory = this.model.currentPositionHistory + indexDiff;
		if (typeof this.scoreHistory[currentHistory] === "undefined") {
			UserLog.logAutoFade('error', "No history available");
			return;
		}
		this.setCurrentPositionHistory(currentHistory);
		var newLeadsheet = this.scoreHistory[currentHistory]['leadsheet'];
		var songModel = new SongModel(newLeadsheet);
		editor.setSong(songModel);
		if (editor.player instanceof ModelPlayer) {
			editor.player.setSongModel(songModel);
		}
		editor.update();
		editor.viewer.draw(editor);
	};

	return ConstraintController;
});