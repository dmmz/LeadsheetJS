define(function() {
	/**
	 * Scaler helps decoupling from LSViewer all classes that have to scale
	 * @exports LSViewer/Scaler
	 * @param {Float} scaler that will be multiplied by all positions
	 */
	function Scaler(scale) {
		if (scale) {
			this.setScale(scale);
		}
	}
	Scaler.prototype.setScale = function(scale) {
		this.scale = scale;
	};
	/**
	 * function to scale plain objects, normally they will be positions
	 * @param  {Object} obj normally in the form of {x: 23, y:130, xe: 33, ye: 23}
	 * @return {Object} in the form of {x: 23, y:130, xe: 33, ye: 23}
	 */
	Scaler.prototype.getScaledObj = function(obj) {
		if (obj instanceof Object) {
			var r = {};
			for (var prop in obj) {
				r[prop] = obj[prop] * this.scale;
			}
			return r;
		} else if (!isNaN(parseFloat(obj)) && isFinite(obj)) {
			return obj * this.scale;
		} else {
			throw "Scaler only accept obj or number";
		}
	};
	return Scaler;
});