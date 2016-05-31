define(function(){
	function EditionControllerInterface() {

		this.editable = true;

		this.isEditable = function(){
			return this.editable;
		};

		this.setEditable = function(editable){
			this.editable = editable;
		};
	}

	return EditionControllerInterface;
});