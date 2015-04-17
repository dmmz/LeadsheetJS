define(['modules/WaveManager/src/WaveAudio',
        'modules/WaveManager/src/WaveDrawer'
        ],function(SongBarsIterator, WaveAudio, WaveDrawer) {
	function WaveManager(song,cModel,viewer) {

		this.buffer = null;
		this.source = null;
		this.pixelRatio = window.devicePixelRatio;
        this.waveBarDimensions = [];
        this.barTimes = [];
       
        this.ctx = null;
        this.currBar = 0;
        this.song = song;
        this.cursorModel = cModel;
        this.audio = new WaveAudio();
        console.log(viewer);
        this.drawer = new WaveDrawer(viewer);
        

    }
    WaveManager.prototype.load = function(url) {
		var xhr = new XMLHttpRequest();
		var self = this;

		
		xhr.open("GET", url);
		xhr.responseType = 'arraybuffer';

		xhr.onload = function() {
			var audioData = xhr.response;
            self.audio.load(audioData,self);
		};
		xhr.send();
	};

    WaveManager.prototype.restartAnimationLoop = function() {
        var self = this;
        var noteMng = this.song.getComponent('notes');
        var iNote = 0, prevINote = 0;
        var minBeatStep = this.audio.beatDuration / 32;//we don't want to update notes cursor as often as we update audio cursor, to optimize we only update note cursor every 1/32 beats
        var requestFrame = window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame;
        this.startTime = this.audio.audioCtx.currentTime;
        var timeStep = 0;
        var frame = function () {
            if (!self.isPause) {

                if (self.getPlayedTime() >= timeStep + minBeatStep){
                    iNote = noteMng.getPrevIndexNoteByBeat(self.getPlayedTime() / self.audio.beatDuration + 1);
                    if (iNote != prevINote)
                    {
                        self.cursorModel.setPos(iNote);
                        $.publish('ToViewer-draw',self.song);    
                        prevINote = iNote;
                    }
                    timeStep += minBeatStep;    
                }
                
                self.drawer.drawCursor(this._getCursorPos(self.getPlayedTime()));
                requestFrame(frame);
            }
        };
        frame();
    };
    WaveManager.prototype.play = function() {

        this.isPause = false;
        this.restartAnimationLoop();
        this.audio.play();         
        
    };
    WaveManager.prototype.pause = function() {
        this.isPause = true;
        this.audio.pause();
        this.currBar = 0;
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
            //Comment these 3 lines if we only want to print the superior half
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
            var prevBarTime = (currBar === 0) ? 0 : self.barTimes[currBar-1];
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
        time = time || 0;
        var currBar = getBarByTime(time);
        var dim = getCursorDims(currBar,time);
        return  dim;

    };
  

    WaveManager.prototype.getPlayedTime = function() {
         //var dur = this.buffer.duration;
         return this.audio.audioCtx.currentTime - this.startTime;
    };
    WaveManager.prototype.getBarTime = function(songIt,barTime) {

        return barTime + songIt.getBarTimeSignature().getBeats() * this.audio.beatDuration;
    };
	return WaveManager;
});