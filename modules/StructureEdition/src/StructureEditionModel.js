define(['jquery', 'pubsub'], function($, pubsub) {
	function StructureEditionModel() {
		this.unfolded = false;
		this.selectedSection = undefined;
		this.selectedBar = undefined;
		this.keySignature = undefined;
		this.timeSignature = undefined;
	}

	StructureEditionModel.prototype.setUnfolded = function(value) {
		this.unfolded = !!value;
		$.publish('StructureEditionModel-setUnfolded', this.unfolded);
	};

	StructureEditionModel.prototype.setSelectedBarAndSignatures = function(bar, keySignature, timeSignature) {
		if (typeof bar === "undefined") {
			throw 'StructureEditionModel - setSelectedBar - bar is not defined';
		}
		if (this.selectedBar != bar) {
			this.selectedBar = bar;
			$.publish('StructureEditionModel-setSelectedBar', bar);
		}
		if (this.keySignature !== keySignature) {
			this.keySignature = keySignature;
			$.publish('StructureEditionModel-setKeySignature', keySignature);
		}
		if (this.timeSignature !== timeSignature) {
			this.timeSignature = timeSignature;
			$.publish('StructureEditionModel-setTimeSignature', timeSignature);
		}
	};

	StructureEditionModel.prototype.setSelectedSection = function(section) {
		if (typeof section === "undefined") {
			throw 'StructureEditionModel - setSelectedSection - section is not defined';
		}
		this.selectedSection = section;
		$.publish('StructureEditionModel-setSelectedSection', section);
	};

	StructureEditionModel.prototype.toggleUnfolded = function() {
		var unfolded = !this.unfolded;
		this.setUnfolded(unfolded);
	};

	return StructureEditionModel;
});