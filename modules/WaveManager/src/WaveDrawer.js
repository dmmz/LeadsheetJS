define(['modules/core/src/SongBarsIterator'], function(SongBarsIterator){
	function WaveDrawer (viewer, params) {
		params  = params || {};
        if (!params.pixelRatio){
            throw "WaveDrawer - pixelRatio not defined";
        }
        this.pixelRatio = params.pixelRatio;
        this.showHalfWave = params.showHalfWave;
        this.marginCursor = params.marginCursor || 20;

        this.waveBarDimensions = [];
        this.viewer = viewer;
		this.ctx = viewer.layerCtx;
	}
    /**
     * @params like in drawCursor
     * @return {Object}  {x: val  , y: valy, w: valw, h: valh };
     */
    WaveDrawer.prototype._getCursorDims = function(bar, barTimes, time) {
        var newDim = {};
        var dim = this.waveBarDimensions[bar];
        var prevBarTime = (bar === 0) ? 0 : barTimes[bar-1];
        var barTime = barTimes[bar];
        var timeDist = barTime - prevBarTime;
        var percent = (time - prevBarTime) / (barTime - prevBarTime);

        newDim.y = dim.y + this.marginCursor;
        newDim.h = dim.h - this.marginCursor * 2;
        newDim.x = dim.x + percent * dim.w; 
        newDim.w = dim.w;
        return newDim;
    };

    /**
     * 
     * @param  {Integer} bar     number of current bar
     * @param  {Array} barTimes  array in which for each position there is the time in which the bar finishes. e.g. at 60 bpm we should have [1,2,3,4,5...etc.]
     * @param {Float} time played (in milleconds) 
     * @
     */
	WaveDrawer.prototype.drawCursor = function(bar, barTimes, time) {
        var cursorPos = this._getCursorDims(bar,barTimes,time);
        this.ctx.clearRect(0,0,this.ctx.canvas.width,this.ctx.canvas.height);
        this.ctx.beginPath();
        this.ctx.moveTo(cursorPos.x,cursorPos.y);
        this.ctx.lineTo(cursorPos.x,cursorPos.y+cursorPos.h);
        this.ctx.stroke(); 

	};
	WaveDrawer.prototype.drawAudio = function(waveMng) {
        
        var numBars = waveMng.song.getComponent("bars").getTotal();
        var songIt = new SongBarsIterator(waveMng.song);
        var area,dim,bar,barTime = 0,
        sliceSong = 1 / numBars,
        start = 0,
        peaks,
        toggleColor = 0,
        color = ["#55F","#5A5"],
        i = 0;
        
        while(songIt.hasNext()){
            barTime = waveMng.getBarTime(songIt,barTime);
            waveMng.barTimes.push(barTime);
            dim = this.viewer.barWidthMng.getDimensions(songIt.getBarIndex());
            area = {
                x: dim.left,
                y: dim.top - this.viewer.LINE_MARGIN_TOP - this.viewer.CHORDS_DISTANCE_STAVE,
                w: dim.width,
                h: this.viewer.LINE_MARGIN_TOP
            };
            this.waveBarDimensions.push(area);
            peaks = waveMng.audio.getPeaks(area.w,start,start+sliceSong);

            this.drawPeaks(peaks,area,color[toggleColor],this.viewer.ctx);
            toggleColor = (toggleColor + 1) % 2;
            
            start += sliceSong;
            songIt.next();
            i++;
        }

        this.drawCursor(waveMng.currBar,waveMng.barTimes,0);
    };

    WaveDrawer.prototype.drawPeaks = function(peaks,area,color,ctx) {
        
        // A half-pixel offset makes lines crisp
        var $ = 0.5 / this.pixelRatio;
        var width = area.w;
        var height = area.h;
        var offsetY = area.y;
        var halfH = height / 2;
        var length = peaks.length;
        var scale = 1;
        var i,h;
        // if (this.params.fillParent && width != length) {
        //     scale = width / length;
        // }
        scale = width / length;
        ctx.fillStyle = color;
        ctx.beginPath();
            
        ctx.moveTo(area.x + $, halfH + offsetY);
        //Comment these 3 lines if we only want to print the superior half
        if (!this.showHalfWave){
            for (i = 0; i < length; i++) {
                h = Math.round(peaks[i] * halfH);   
                ctx.lineTo(area.x + i * scale + $, halfH + h + offsetY);
            }
        }
       
        ctx.lineTo(area.x + width + $, halfH + offsetY);
        ctx.moveTo(area.x + $, halfH + offsetY);

        for (i = 0; i < length; i++) {
            h = Math.round(peaks[i] * halfH);
            ctx.lineTo(area.x + i * scale + $, halfH - h + offsetY);
        }

        ctx.lineTo(area.x + width + $, halfH + offsetY);
        ctx.closePath();
        ctx.fill();
        // Always draw a median line
        ctx.fillRect(area.x, halfH + offsetY - $, width, $);
    };
	return WaveDrawer;
});