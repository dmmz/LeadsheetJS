define(function() {
	/**
	 * Scaler helps decoupling from LSViewer all classes that have to scale
	 * @param {[type]} scale [description]
	 */
	function Scaler(scale){
		if (scale){
			this.setScale(scale);			
		}
	}
	Scaler.prototype.setScale = function(scale) {
		this.scale = scale;
	};
	/**
		 * function to scale plain objects, normally they will be positions
		 * @param  {Object} obj normally in the form of {x: 23, y:130, xe: 33, ye: 23}
		 * @return {[type]}     [description]
		 */
	Scaler.prototype.getScaledObj = function(obj) {
		var r = {};
		for (var prop in obj) {
			r[prop] = obj[prop] * this.scale;
		}
		return r;
	};
	return Scaler;
});