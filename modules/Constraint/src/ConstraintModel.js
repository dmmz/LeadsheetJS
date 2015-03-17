define([
	'mustache',
	'modules/core/src/SongModel',
	'utils/UserLog',
	'pubsub',
], function(Mustache, SongModel, UserLog, pubsub) {
	/**
	 * ConstraintModel is an array of constraints, it allow a high level management of constraints
	 * @param {object} options
	 */
	var ConstraintModel = function(options) {
		this.init();
	};

	ConstraintModel.prototype.init = function() {
		this.constraints = [];
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

	
	return ConstraintModel;
});