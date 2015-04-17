define(['modules/core/src/SongBarsIterator'], function(SongBarsIterator){
	function WaveDrawer (viewer) {
		this.viewer = viewer;
		this.ctx = viewer.layerCtx;
	}
	WaveDrawer.prototype.drawCursor = function(cursorPos) {
        this.ctx.clearRect(0,0,this.ctx.canvas.width,this.ctx.canvas.height);
        this.ctx.beginPath();
        this.ctx.moveTo(cursorPos.x,cursorPos.y);
        this.ctx.lineTo(cursorPos.x,cursorPos.y+cursorPos.h);
        this.ctx.stroke(); 

	};
	WaveDrawer.prototype.drawAudio = function(song, waveAudio) {
        
        var numBars = song.getComponent("bars").getTotal();
        var songIt = new SongBarsIterator(song);
        var area,dim,bar,barTime = 0,
        sliceSong = 1 / numBars,
        start = 0,
        peaks,
        toggleColor = 0,
        color = ["#55F","#5A5"],
        zoomH = 1.5
        i = 0;
        
        while(songIt.hasNext()){
            barTime = this.getBarTime(songIt,barTime);
            this.barTimes.push(barTime);
            dim = this.viewer.barWidthMng.getDimensions(songIt.getBarIndex());
            area = {
                x: dim.left,
                y: dim.top - this.viewer.LINE_MARGIN_TOP - this.viewer.CHORDS_DISTANCE_STAVE,
                w: dim.width,
                h: this.viewer.LINE_MARGIN_TOP
            };
            this.waveBarDimensions.push(area);
            peaks = waveAudio.getPeaks(area.w,start,start+sliceSong);

            this.drawPeaks(peaks,area,color[toggleColor],this.viewer.ctx,zoomH);
            toggleColor = (toggleColor + 1) % 2;
            
            start += sliceSong;
            songIt.next();
            i++;
        }

        this.drawer.drawCursor(this._getCursorPos(0));
    };
	return WaveDrawer;
});