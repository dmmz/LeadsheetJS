define(['jquery', 'pubsub'], function($, pubsub) {
	function StructureEditionModel() {
		this.unfolded = false;
	}

	StructureEditionModel.prototype.setUnfolded = function(value) {
		this.unfolded = !!value;
		$.publish('StructureEditionModel-setUnfolded', this.unfolded);
	};

	StructureEditionModel.prototype.toggleUnfolded = function() {
		var unfolded = !this.unfolded;
		this.setUnfolded(unfolded);
	};

	return StructureEditionModel;
});