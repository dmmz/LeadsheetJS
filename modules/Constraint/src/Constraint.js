define([
		"modules/Constraint/src/ConstraintAPI",
		"modules/Constraint/src/ConstraintController",
		"modules/Constraint/src/ConstraintModel",
		"modules/Constraint/src/ConstraintView"
	],function(ConstraintAPI, ConstraintController, ConstraintModel, ConstraintView){

	function Constraint(songModel){
		new ConstraintModel();
		new ConstraintController(songModel);
		this.view = new ConstraintView();
	}
	return Constraint;
});