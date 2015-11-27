define(['modules/Edition/src/ElementView'],function(ElementView){
	function WaveBarView (position,viewerScaler) {
		this.position = position;
		this.scaler = viewerScaler;
	}
	WaveBarView.prototype.isInPath = function(coords) {
		return ElementView.isInPath(coords,this.position,this.scaler);
	};
	WaveBarView.prototype.isBetweenYs = function(coords) {
		return ElementView.isBetweenYs(coords,this.position,this.scaler);
	};
	WaveBarView.prototype.getArea = function() {
		return  this.position;
	};
	return WaveBarView;
});