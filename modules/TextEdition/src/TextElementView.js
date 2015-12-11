define(['modules/Edition/src/ElementView'], function(ElementView) {
	/**
	 * Allow text in canvas to be selected
	 * @exports TextEdition/TextElementView
	 * @param {Object} position {x:439.25, y:33,w:10,h:10} //position
	 * @param {Scaler} viewerScaler  Scaler
	 */
	function TextElementView(position, viewerScaler) {
		this.position = position;
		this.scaler = viewerScaler;
	}
	/**
	 * @interface
	 * @param  {Object}  coords [description]
	 * @return {Boolean}        [description]
	 */
	TextElementView.prototype.isInPath = function(coords) {
		return ElementView.isInPath(coords, this.position, this.scaler);
	};
	
	/**
	 * @interface
	 */
	TextElementView.prototype.getArea = function() {
		return this.position;
	};

	return TextElementView;
});