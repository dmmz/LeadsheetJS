define(function(){
	function EditionModuleInterface() {
		this.setEditable = function(editable){
			this.controller.setEditable(editable);
		};
	}

	return EditionModuleInterface;
});