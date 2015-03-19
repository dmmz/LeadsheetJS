define(['pubsub'], function() {
	function StructureEditionModel() {
		this.unfolded = false;
	}
	StructureEditionModel.prototype.toggleUnfolded = function() {
		this.unfolded = !this.unfolded;
		$.publish('StructureEditionModel-toggleUnfolded',this.unfolded);
	};
	return StructureEditionModel;
});