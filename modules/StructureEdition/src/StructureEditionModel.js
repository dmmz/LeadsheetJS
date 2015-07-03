define(['jquery', 'pubsub'], function($, pubsub) {
	function StructureEditionModel() {
		this.decalFromOriginalTonality = 0; // decal in semi tons current tonality
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

	StructureEditionModel.prototype.setDecalFromOriginalTonality = function(decalFromOriginalTonality) {
		this.decalFromOriginalTonality += decalFromOriginalTonality;
		// maybe do a +12 modulo 12 here
	};

	return StructureEditionModel;
});