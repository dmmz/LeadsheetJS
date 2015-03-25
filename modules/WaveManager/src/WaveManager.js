define(function() {
	function WaveManager() {
		this.buffer = null;
		this.source = null;
		this.pixelRatio = window.devicePixelRatio;
	}
	WaveManager.prototype.load = function(url,ctx,song) {
		var xhr = new XMLHttpRequest();
		var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
		var source =  audioCtx.createBufferSource();
		var self = this;
		
		xhr.open("GET", url);
		xhr.responseType = 'arraybuffer';

		xhr.onload = function() {
			var audioData = xhr.response;
			audioCtx.decodeAudioData(audioData, function(buffer) {
				
			    self.buffer = buffer;
			    //songLength = buffer.duration;
			    source.buffer = self.buffer;
			    //source.playbackRate.value = playbackControl.value;
			    source.connect(audioCtx.destination);
			    
			    //source.start(0)
			    $.publish('WaveManager-loadedSound',[self,song]);
			   

			  },
			  function(e){
			  	"Error with decoding audio data" + e.err
			});			
		}
		xhr.send();
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
	return WaveManager;
});