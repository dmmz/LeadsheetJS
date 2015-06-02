define([
		"jquery",
		"pubsub",
		"modules/Constraint/src/ConstraintAPI",
		"modules/Constraint/src/ConstraintController",
		"modules/Constraint/src/ConstraintModel",
		"modules/Constraint/src/ConstraintView"
	],function($, pubsub, ConstraintAPI, ConstraintController, ConstraintModel, ConstraintView){

	function Constraint(songModel, noteSpaceMng){
		new ConstraintModel();
		new ConstraintController(songModel, noteSpaceMng);
		this.view = new ConstraintView();
	}
	return Constraint;
});