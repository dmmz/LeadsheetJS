define(['underscore'], function(_){
	var RepetitionsHolder = {};

	RepetitionsHolder.init = function(structure) {
		this.repetitions = structure.repetitions;
		//TODO: sort repetitions using backbone or underscore
		//this.repetitions = [];

	};

	RepetitionsHolder.getNextRepetitionIfBefore = function(cursor, target) {
		var self = this;
		function findNextRepetition(cursor) {
			var repetition;
			for (var i = 0; i < self.repetitions.length; i++) {
				repetition = self.repetitions[i];
				if (repetition.config.doIt && repetition.isAfter(cursor)){
					return i;
				}
			}
			return -1;
		}

		var index = findNextRepetition(cursor);
		if (index === -1) {
			return null;
		}
		var repetition = this.repetitions[index];
		var targetPoint = target.point;
		if (!!targetPoint && !targetPoint.hasLabel(EndLabel.END)) {
			repTargetPoint = repetition.getTargetPoint(); 
			if (!repTargetPoint.isBefore(targetPoint))
				return null;
		}
		if (repetition instanceof DaAlRepetition)
			repetitions.splice(index, 1);
		
		return repetition;
	};


});