define([],function(){
	function WaveManagerView(parentHTML){
		this.parentHTML = parentHTML;
		this.playId = "audio-play";
		this.pauseId = "audio-pause";
	}
	WaveManagerView.prototype.render = function(callback) {
		
		// case el has never been rendered
		var self = this;
		this.initView(this.parentHTML, function() {
			self.initController();
		});
		
	};
	WaveManagerView.prototype.initView = function(parentHTML, callback) {
		//create div for buttons
		var divButtons = $("<div></div>");
		divButtons.css({
			position:'absolute'
		});
		divButtons.prependTo($(parentHTML));
		
		$("<button id="+ this.playId +">Play</button>").appendTo(divButtons);
		$("<button id="+ this.pauseId +">Pause</button>").appendTo(divButtons);
		
		callback();
	};

	WaveManagerView.prototype.initController = function() {
		var self = this;
		$("#"+ this.playId).click(function(e){
			e.preventDefault();
			$.publish('ToPlayer-play');
		});
		$("#"+this.pauseId).click(function(e){
			e.preventDefault();
			$.publish('ToPlayer-pause');
		});
	};
	return WaveManagerView;
});