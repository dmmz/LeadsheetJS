define(function(){
	function WaveBarView (x,y,w,h) {
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
	}
	WaveBarView.prototype.getArea = function() {
		return  {
			x: this.x,
			y: this.y,
			w: this.w,
			h: this.h
		};
	};
	return WaveBarView;
});