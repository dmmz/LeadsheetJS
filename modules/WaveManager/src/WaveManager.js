define(['modules/core/src/SongBarsIterator'],function(SongBarsIterator) {
	function WaveManager() {
		this.buffer = null;
		this.source = null;
		this.pixelRatio = window.devicePixelRatio;
        this.waveBarDimensions = [];
        this.barTimes = [];
        this.beatDuration = 0;
        this.ctx = null;
        this.currBar = 0;
	}
	WaveManager.prototype.load = function(url,viewer,song) {

		var xhr = new XMLHttpRequest();
		this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
		this.source =  this.audioCtx.createBufferSource();
		var self = this;
		
		xhr.open("GET", url);
		xhr.responseType = 'arraybuffer';

		xhr.onload = function() {
			var audioData = xhr.response;
			self.audioCtx.decodeAudioData(audioData, function(buffer) {
				
            self.buffer = buffer;
            self.beatDuration = self.buffer.duration / song.getSongTotalBeats();
            self.source.buffer = self.buffer;
            //source.playbackRate.value = playbackControl.value;
            self.source.connect(self.audioCtx.destination);
            self.drawAudio(viewer,song);
            //source.start(0)
            },
			function(e){
                throw "Error with decoding audio data" + e.err;
            });			
		};
		xhr.send();
	};
    WaveManager.prototype.play = function() {
        this.startTime = this.audioCtx.currentTime;
        this.isPause = false;
        var requestFrame = window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame;
        var self = this;

        this.source.start(0);
        var frame = function () {
            if (!self.isPause) {
            //  my.drawer.progress(my.backend.getPlayedPercents());
                self.drawCursor(self.getPlayedTime());
                requestFrame(frame);
            }
        };
        frame();
    };
    WaveManager.prototype.pause = function() {
        this.isPause = true;
        this.source.stop();
    };
	WaveManager.prototype.getPeaks = function(length, startPoint, endPoint) {
		
        startPoint = startPoint || 0;
        endPoint = endPoint || 1;

        var sampleStart =  ~~(startPoint * this.buffer.length);
        var sampleEnd =  ~~(endPoint * this.buffer.length);
        var sampleSize = (sampleEnd-sampleStart) / length;
        // var sampleSize = this.buffer.length / length;
        var sampleStep = ~~(sampleSize / 10) || 1;
        var channels = this.buffer.numberOfChannels;
        var splitPeaks = [];
        var mergedPeaks = [];

        for (var c = 0; c < channels; c++) {
            var peaks = splitPeaks[c] = [];
            var chan = this.buffer.getChannelData(c);
            
            for (var i = 0; i < length; i++) {
                var start = ~~((i * sampleSize) + sampleStart);
                var end = ~~(start + sampleSize);
                var max = 0;
                for (var j = start; j < end; j += sampleStep) {
                    var value = chan[j];
                    if (value > max) {
                        max = value;
                    // faster than Math.abs
                    } else if (-value > max) {
                        max = -value;
                    }
                }
                peaks[i] = max;

                if (c == 0 || max > mergedPeaks[i]) {
                    mergedPeaks[i] = max;
                }
            }
        }
        return mergedPeaks;

	};

	WaveManager.prototype.drawPeaks = function(peaks,area,color,ctx) {
        // Split channels
        if (peaks[0] instanceof Array) {
            var channels = peaks;
            if (this.params.splitChannels) {
                this.setHeight(channels.length * this.params.height * this.pixelRatio);
                channels.forEach(this.drawPeaks, this);
                return;
            } else {
                peaks = channels[0];
            }
        }

        // A half-pixel offset makes lines crisp
        var $ = 0.5 / this.pixelRatio;
        // A margin between split waveforms
        //var height = this.params.height * this.params.pixelRatio;
        //var offsetY = height * area || 0;
        var width = area.w;
        var height = area.h;
        var offsetY = area.y;
        var halfH = height / 2;
        var length = peaks.length;
        var scale = 1;
        // if (this.params.fillParent && width != length) {
        //     scale = width / length;
        // }
        scale = width / length;
        ctx.fillStyle = color;
        if (this.progressCc) {
            this.progressCc.fillStyle = this.params.progressColor;
        }

        [ ctx, this.progressCc ].forEach(function (cc) {
            if (!cc) { return; }

            cc.beginPath();
            
            cc.moveTo(area.x + $, halfH + offsetY);
            for (var i = 0; i < length; i++) {
                var h = Math.round(peaks[i] * halfH);   
                cc.lineTo(area.x + i * scale + $, halfH + h + offsetY);
            }

            
            cc.lineTo(area.x + width + $, halfH + offsetY);
            cc.moveTo(area.x + $, halfH + offsetY);
            

            for (var i = 0; i < length; i++) {
                var h = Math.round(peaks[i] * halfH);
                cc.lineTo(area.x + i * scale + $, halfH - h + offsetY);
            }

            cc.lineTo(area.x + width + $, halfH + offsetY);
            cc.closePath();
            cc.fill();
            // Always draw a median line
            cc.fillRect(area.x, halfH + offsetY - $, width, $);
        }, this);
  
	};
    WaveManager.prototype._getCursorPos = function(time) {
        var self = this;
        function getBarByTime(time){
            while (self.currBar < self.barTimes.length && self.barTimes[self.currBar] < time){
                self.currBar++;
            }
            return self.currBar;
        }
        function getCursorDims(currBar,time){
            var newDim = {};
            var dim = self.waveBarDimensions[currBar];
            var prevBarTime = (currBar===0) ? 0 : self.barTimes[currBar-1];
            var barTime = self.barTimes[currBar];
            var timeDist = barTime - prevBarTime;
            
            var percent = (time - prevBarTime) / (barTime - prevBarTime);

            var marginCursor = 20;
            newDim.y = dim.y + marginCursor;
            newDim.h = dim.h - marginCursor * 2;
            newDim.x = dim.x +  percent * dim.w; 
            newDim.w = dim.w;
            return newDim;
        }
        var currBar = getBarByTime(time);
        var dim = getCursorDims(currBar,time);
        return  dim;

    };
    WaveManager.prototype.drawCursor = function(time) {
        time = time || 0;
        
        dim = this._getCursorPos(time);
       
        this.ctx.clearRect(0,0,this.ctx.canvas.width,this.ctx.canvas.height);
        this.ctx.beginPath();
        this.ctx.moveTo(dim.x,dim.y);
        this.ctx.lineTo(dim.x,dim.y+dim.h);
        this.ctx.stroke(); 

    };
    WaveManager.prototype.drawAudio = function(viewer,song) {
        this.ctx = viewer.layerCtx;
        var numBars = song.getComponent("bars").getTotal();
        var songIt = new SongBarsIterator(song);
        var area,dim,bar,barTime = 0,
        sliceSong = 1 / numBars,
        start = 0,
        peaks,
        toggleColor = 0,
        color = ["#55F","#5A5"],
        i = 0;
        
        while(songIt.hasNext()){
            barTime = this.getBarTime(songIt,barTime);
            this.barTimes.push(barTime);
            dim = viewer.barWidthMng.getDimensions(songIt.getBarIndex());
            area = {
                x: dim.left,
                y: dim.top - viewer.LINE_MARGIN_TOP - viewer.CHORDS_DISTANCE_STAVE,
                w: dim.width,
                h: viewer.LINE_MARGIN_TOP
            };
            this.waveBarDimensions.push(area);
            peaks = this.getPeaks(area.w,start,start+sliceSong);

            this.drawPeaks(peaks,area,color[toggleColor],viewer.ctx);
            toggleColor = (toggleColor + 1) % 2;
            
            start += sliceSong;
            songIt.next();
            i++;
        }
        this.drawCursor(0);
    };
    WaveManager.prototype.getPlayedTime = function() {
         //var dur = this.buffer.duration;
         return this.audioCtx.currentTime - this.startTime;
    };
    WaveManager.prototype.getBarTime = function(songIt,barTime) {

        return barTime + songIt.getBarTimeSignature().getBeats() * this.beatDuration;
    };
	return WaveManager;
});