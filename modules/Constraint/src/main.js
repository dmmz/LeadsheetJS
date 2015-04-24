define([
		"modules/Constraint/src/ConstraintAPI",
		"modules/Constraint/src/ConstraintController",
		"modules/Constraint/src/ConstraintModel",
		"modules/Constraint/src/ConstraintView",
	],
	function(ConstraintAPI, ConstraintController, ConstraintModel, ConstraintView) {
		return {
			"ConstraintAPI": ConstraintAPI,
			"ConstraintController": ConstraintController,
			"ConstraintModel": ConstraintModel,
			"ConstraintView": ConstraintView
		};
	}
);