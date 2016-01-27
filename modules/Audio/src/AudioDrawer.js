define([ 'modules/Wave/src/BarTimesManager',
		'modules/core/src/SongBarsIterator',
		'modules/Audio/src/AudioLJSAdapter',
		'modules/Wave/src/WaveBarView',
		'jquery',
		'pubsub'
	], function (BarTimesManager, SongBarsIterator, AudioLJSAdapter, WaveBarView, $, pubsub){

	function AudioDrawer(songModel, viewer, tempo, params){
		params = params || {};

		this.songModel = songModel;
		this.viewer = viewer;
		this.tempo = tempo;
		this.barTimesMng = new BarTimesManager();
		this.audio = null;
		this.color = ["#55F", "#99F"];
		//params
		this.showHalfWave = !!params.showHalfWave;
		this.topAudio = params.topAudio || 80;
		this.heightAudio = params.heightAudio || 100;
		this.pixelRatio = params.pixelRatio || window.devicePixelRatio;
		this.drawMargins = !!params.drawMargins; //for debugging
		this.marginCursor = params.marginCursor || 0;
		
		this.adaptViewer();
		this._initSubscribe();
	};

	AudioDrawer.prototype._initSubscribe = function() {
		var self = this;
		$.subscribe('Audio-Loaded', function(el, audio){
			self.audio = audio;
			self.audioLjs = new AudioLJSAdapter(self.songModel, audio, self.tempo);
			self.barTimesMng.setBarTimes(self.songModel, self.audioLjs);
			self.viewer.setShortenLastBar(true);
			self.viewer.draw(self.songModel);
			self.draw(self.barTimesMng, self.tempo, self.audioLjs.getDuration())
		});
		$.subscribe('LSViewer-drawEnd', function() {
			if (self.audio.isLoaded){
				self.draw(self.barTimesMng, self.tempo, self.audioLjs.getDuration());
			}
		});
	};
	AudioDrawer.prototype._drawPeaks = function(peaks, area, color, viewer) {

		var ctx = viewer.ctx;
		var self = this;
		
		function normalize (peaks) {
			var NORM_FACTOR = 0.8; //if 1, maximum will draw until the very top of the audio space
			var max = 0;
			for (var i = 0; i < peaks.length; i++) {
				if (peaks[i] > max) max = peaks[i];
			}
			if (max !== 0){
				for (var i = 0; i < peaks.length; i++) {
					peaks[i] /= max / NORM_FACTOR;
				}
			}
			return peaks;
		}

		viewer.drawElem(function() {
			// A half-pixel offset makes lines crisp
			var $ = 0.5 / self.pixelRatio;
			var width = area.w;
			var height = area.h;
			var offsetY = area.y;
			var halfH = height / 2;
			var length = peaks.length;
			var scale;
			var i, h, maxH;

			peaks = normalize(peaks);
			
			// if (self.params.fillParent && width != length) {
			//     scale = width / length;
			// }
			maxH = self.showHalfWave ? halfH : height;
			scale = width / length;
			ctx.fillStyle = color;
			if (self.drawMargins) {
				self._drawMargins(area, ctx);
			}

			ctx.beginPath();
			ctx.moveTo(area.x + $, halfH + offsetY);
			// 3 lines for printing the inferior half
			if (!self.showHalfWave) {
				for (i = 0; i < length; i++) {
					h = Math.round(peaks[i] * halfH);
					ctx.lineTo(area.x + i * scale + $, halfH + h + offsetY);
				}
			}

			ctx.lineTo(area.x + width + $, halfH + offsetY);
			ctx.moveTo(area.x + $, halfH + offsetY);

			for (i = 0; i < length; i++) {
				h = Math.round(peaks[i] * maxH);
				ctx.lineTo(area.x + i * scale + $, halfH - h + offsetY);
			}

			ctx.lineTo(area.x + width + $, halfH + offsetY);
			ctx.closePath();
			ctx.fill();
			// Always draw a median line
			ctx.fillRect(area.x, halfH + offsetY - $, width, $);
		});

	};
	AudioDrawer.prototype._drawMargins = function(area, ctx) {
		ctx.beginPath();
		ctx.moveTo(area.x, area.y);
		ctx.lineTo(area.x + area.w, area.y);
		ctx.stroke();

		ctx.moveTo(area.x, area.y + area.h);
		ctx.lineTo(area.x + area.w, area.y + area.h);
		ctx.stroke();
		ctx.closePath();
	};
	AudioDrawer.prototype.adaptViewer = function() {
		if (this.topAudio > 0) { // if audio is greater than 0 it means audio will be on top of score line
			this.viewer.setLineMarginTop(this.topAudio);
		} else {
			distance = (this.heightAudio - this.topAudio) - this.viewer.lineHeight;
			if (distance > 0) {
				this.viewer.setLineMarginTop(distance, true);
				
			}
		}
	};
	AudioDrawer.prototype.draw = function(barTimesMng, tempo, duration) {
		if (!tempo || !duration) {
			throw "WaveDrawer - missing parameters, tempo : " + tempo + ", duration:" + duration;
		}
		this.waveBarDimensions = [];
		var numBars = barTimesMng.getLength();
		var area, dim, prevDim, bar, barTime = 0,
			sliceSong,
			start = 0,
			peaks,
			toggleColor = 0;

		for (var i = 0; i < barTimesMng.getLength(); i++) {
			sliceSong = barTimesMng.getCurrBarTime(i) / duration;
			prevDim = dim;
			dim = this.viewer.barWidthMng.getDimensions(i);

			if (!dim) {
				dim = prevDim;
				dim.left = dim.left + dim.width;
				dim.width = dim.width / this.viewer.LAST_BAR_WIDTH_RATIO - dim.width;
			}
			waveBarView = new WaveBarView({
				x: dim.left,
				y: dim.top - this.viewer.CHORDS_DISTANCE_STAVE - this.topAudio,
				w: dim.width,
				h: this.heightAudio
			}, this.viewer.scaler);
			
			this.waveBarDimensions.push(waveBarView);
			area = waveBarView.getArea();
			peaks = this.audio.getPeaks(area.w, start, start + sliceSong);
			this._drawPeaks(peaks, area, this.color[toggleColor], this.viewer);
			toggleColor = (toggleColor + 1) % 2;
			start += sliceSong;
		}
		$.publish('WaveDrawer-audioDrawn', this);
	};
	return AudioDrawer;
});