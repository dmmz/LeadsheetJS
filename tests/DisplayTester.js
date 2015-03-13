define(function() {
	function DisplayTester () {
		this.numTest = 0;
	}

	DisplayTester.prototype._createDivComments = function(comments) {
		var idDivComments = "testComments" + this.numTest;
		var newDivComments = $('<div>').attr("id",idDivComments);
		var ul = $('<ul>');

		for (var i = 0; i < comments.length; i++) {
			$('<li>').html(comments[i]).appendTo(ul);
		}
		ul.appendTo(newDivComments);
		return newDivComments;
	};
	/**
	 *		
	 * @param  {Object} size     e.g: {width: 1200, height:1000}
	 * @param  {String} title    
	 * @param  {Array} comments ["comment1","comment2"]
	 * @return {domObject}          
	 */
	DisplayTester.prototype._createDiv = function(divSize,title, comments) {
		this.numTest++;
		var divTests = $("#tests");
		var idDiv = "test" + this.numTest;
		var newDiv = $('<div>').attr("id",idDiv);
		var css = {
			border:'1px solid'
		};
		if (divSize){
			if (divSize.width != null)		css.width = divSize.width;
			if (divSize.height != null)		css.height = divSize.height;
		}
		newDiv.css(css);
		
		$("<p>").html(title).appendTo(divTests);
		if (comments){
			this._createDivComments(comments).appendTo(divTests);
		}
		newDiv.appendTo(divTests);		
		return newDiv;
	};

	DisplayTester.prototype.runTest = function(func, divSize, title, comments) {
		func(this._createDiv(divSize,title,comments));
	};
	return DisplayTester;
});